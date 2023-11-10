from rest_framework import serializers

class SyllableSerializer(serializers.Serializer):
    Syllable = serializers.CharField(max_length=100)
    AccuracyScore = serializers.FloatField()

class WordSerializer(serializers.Serializer):
    Word = serializers.CharField(max_length=100)
    AccuracyScore = serializers.FloatField()

class WordResponseSerializer(serializers.Serializer):
    type = serializers.CharField(max_length=100)
    word = serializers.CharField(max_length=100)
    syllables = SyllableSerializer(many=True)
    assesment = serializers.DictField()

class SentenceResponseSerializer(serializers.Serializer):
    type = serializers.CharField(max_length=100)
    sentence = serializers.CharField(max_length=100)
    words = WordResponseSerializer(many=True)
    assesment = serializers.DictField()
    