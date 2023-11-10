import os
import json
import secrets
import subprocess
from django.conf import settings
from .serializer import WordResponseSerializer, SentenceResponseSerializer
from rest_framework import status
from rest_framework.response import Response
import azure.cognitiveservices.speech as speechsdk
from django.core.files.storage import default_storage
from rest_framework.decorators import api_view

def save_audio(request):

    audio_blob = request.FILES['audio']

    # Generate a 5 character random token
    token = secrets.token_hex(3)  # token_hex(3) generates a 6 character long token, as each byte is 2 characters

    # Append the token and file extension to the original filename
    original_name = f'{audio_blob.name}_{token}.wav'
    path_original = 'recordings/' + original_name

    # Save the audio blob
    with default_storage.open(path_original, 'wb+') as destination:
        for chunk in audio_blob.chunks():
            destination.write(chunk)

    # Convert the audio to desired format using FFmpeg
    desired_format_path = 'recordings/converted_' + original_name
    command = [
        'ffmpeg',
        '-i', default_storage.path(path_original),
        '-acodec', 'pcm_s16le',
        '-ac', '1',  # Mono
        '-ar', '16000',  # 16 kHz. Change to '8000' for 8 kHz
        default_storage.path(desired_format_path)
    ]
    subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Optionally delete the original file if only the converted one is needed
    # default_storage.delete(path_original)

    return desired_format_path

def process_audio(path):

    # speech config
    speech_config = speechsdk.SpeechConfig(subscription=os.getenv('SPEECH_KEY'), region=os.getenv('SPEECH_REGION'))
    speech_config.speech_recognition_language="en-US"

    full_path = os.path.join(settings.MEDIA_ROOT, path)

    # audio config
    audio_config = speechsdk.audio.AudioConfig(filename = full_path)

    # speech recognizer
    speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

    # Pronunciation config
    pronunciation_config = speechsdk.PronunciationAssessmentConfig( 
        reference_text="",
        grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
        granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
        enable_miscue=False)

    # add pronunciation assessment to speech recognizer
    pronunciation_config.apply_to(speech_recognizer)

    speech_recognition_result = speech_recognizer.recognize_once_async().get()
    pronunciation_assessment_result_json = speech_recognition_result.properties.get(speechsdk.PropertyId.SpeechServiceResponse_JsonResult)

    # print("Result JSON: {}".format(pronunciation_assessment_result_json))

    if speech_recognition_result.reason == speechsdk.ResultReason.RecognizedSpeech:
        result = speech_recognition_result.text
        pass
    elif speech_recognition_result.reason == speechsdk.ResultReason.NoMatch:
        print("No speech could be recognized: {}".format(speech_recognition_result.no_match_details))
    elif speech_recognition_result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = speech_recognition_result.cancellation_details
        print("Speech Recognition canceled: {}".format(cancellation_details.reason))
        if cancellation_details.reason == speechsdk.CancellationReason.Error:
            print("Error details: {}".format(cancellation_details.error_details))
            print("Did you set the speech resource key and region values?")

    if len(result.split(' ')) > 1:
        return "sentence", pronunciation_assessment_result_json
    else:
        return "word", pronunciation_assessment_result_json

def process_word(result, type):

    lexical = result['NBest'][0]['Lexical']
    syllables = parse_syllables(result['NBest'][0]['Words'][0]['Syllables'])
    pronunciation_assessment = result['NBest'][0]['PronunciationAssessment']

    # print("LEXICAL:", lexical)
    # print("SYLLABLES:", syllables)
    # print("PRONUNCIATION ASSESSMENT:", pronunciation_assessment)

    # Construct the data for the serializer
    serializer_data = {
        'type': type,
        'word': lexical,
        'syllables': syllables,
        'assesment': pronunciation_assessment
    }

    serializer = WordResponseSerializer(data=serializer_data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    return Response(serializer.data, status=status.HTTP_200_OK)

def process_sentence(result, type):

    lexical = result['NBest'][0]['Lexical']
    words = parse_words(result['NBest'][0]['Words'])
    pronunciation_assessment = result['NBest'][0]['PronunciationAssessment']

    # print("type", type)
    # print("LEXICAL:", lexical)
    # print("words:", words)
    # print("PRONUNCIATION ASSESSMENT:", pronunciation_assessment)

    # Construct the data for the serializer
    serializer_data = {
        'type': type,
        'sentence' : lexical,
        'words': words,
        'assesment': pronunciation_assessment
    }

    serializer = SentenceResponseSerializer(data=serializer_data)

    if not serializer.is_valid():
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    return Response(serializer.data, status=status.HTTP_200_OK)

def parse_words(words):
    parsed_words = []

    for word in words:
        word_data = {
            'type': 'word',  # You can adjust this value based on your needs
            'word': word.get('Word'),
            'syllables': [{'Syllable': s.get('Syllable'), 'AccuracyScore': s.get('PronunciationAssessment', {}).get('AccuracyScore')} for s in word.get('Syllables', [])],
            'assesment': word.get('PronunciationAssessment', {})
        }
        parsed_words.append(word_data)

    return parsed_words

def parse_syllables(syllables):

    array = []

    for x in syllables:
        syllable_data = {
            'Syllable': x.get('Syllable'),
            'AccuracyScore': x.get('PronunciationAssessment', {}).get('AccuracyScore')
        }
        array.append(syllable_data)

    # print(array)
    return array

@api_view(['POST'])
def upload_audio(request):

    searched_word = request.data.get('word')

    if request.data.get('audio') is None:
        return Response({'error': 'No audio file was provided'}, status=status.HTTP_400_BAD_REQUEST)
    elif searched_word is None or searched_word == '':
        print("No word was provided")
    else:
        print("Searched word:", searched_word)
    
    path = save_audio(request)

    type, result = process_audio(path)

    result = json.loads(result)
    print(result)

    if type == 'sentence':
        response = process_sentence(result, type)
    else:
        response = process_word(result, type)

    return response