import React from 'react'
import './Search.css'
import { HiSpeakerphone } from "react-icons/hi";
import { useState } from 'react';
import axios from 'axios';

const Search = (props) => {

  const [word, setWord] = useState('')

  const handleInputChange = (e) => {
    if (e.target.value.includes(' ')) {
      return;
    }
    setWord(e.target.value);
  };

  const checkWord = async (word) => {

    try {

      const response = await axios.get(`https://wordsapiv1.p.rapidapi.com/words/${word}`, {
        headers: {
          'X-RapidAPI-Host': process.env.REACT_APP_RAPIDAPI_HOST,
          'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY
        }
      });

      console.log(response.data);

      props.setLaymans(response.data.syllables.list);
      
      return response.data;

    } catch (error) {

      console.log(error);
      return false;

    }
  };

  const playAudio = async () => {

    if(word === '') {
      console.log('no word to play');
      return;
    } else if(word.split(' ').length > 1) {
      console.log('cannot be more than one word');
      return;
    }

    const validated_word = await checkWord(word);
    if (!validated_word) {
      console.log('word not found');
      return;
    } else {
      console.log(validated_word.syllables.list);
    }

    console.log('play audio', word);
    const body = {
      audioConfig: {
        audioEncoding: "MP3"
      },
      input: {
        text: word
      },
      voice: {
        ssmlGender: "MALE",
        languageCode: "en-US"
      }
    };
  
    axios.post("https://texttospeech.googleapis.com/v1/text:synthesize", body, {
      headers: {
        "X-Goog-Api-Key": process.env.REACT_APP_GOOGLE_TTS_KEY
      }
    })
    .then(response => {
      const audioContent = response.data.audioContent;
      const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.error("Error playing audio: ", e));
    })
    .catch(error => {
      console.error("Error with the Text-to-Speech API", error.message);
    });
  };
  
  return (
    <div className='speak-div'>
      <input
                    type='text'
                    className='speak-search-input'
                    placeholder='Search for a word'
                    value={word}
                    onChange={handleInputChange}
      />

      <button className='speak-button' onClick={playAudio}><HiSpeakerphone/></button>
    </div>
  )
}

export default Search
