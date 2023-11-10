import React from 'react'
import { useState } from 'react';
import axios from 'axios';


import './RecordButton.css';

const RecordButton = ({ onAudioProcessed, inputWord }) => {

    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [buttonText, setButtonText] = useState('RECORD');

    const handleRecord = () => {

        if (recording) {
    
            setButtonText('RECORD');
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
    
        } else {
    
            setButtonText('STOP');
            navigator.mediaDevices.getUserMedia({ audio: true })
    
                .then(stream => {
                    const recorder = new MediaRecorder(stream);
    
                    let audioChunks = [];
    
                    recorder.ondataavailable = event => {
                        audioChunks.push(event.data);
                    };
    
                    recorder.onstop = () => {
    
                        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                        const formData = new FormData();

                        formData.append('audio', audioBlob);
                        formData.append('word', inputWord);

    
                        axios.post('http://127.0.0.1:8000/api/upload-audio/', formData)
                            .then(response => {
                                console.log('File uploaded successfully:', response.data);
                                onAudioProcessed(response.data);
                            })
                            .catch(error => {
                                console.error('There was an error uploading the file!', error);
                            });
                    };
    
                    recorder.start();
                    setMediaRecorder(recorder);
                });
        }
        setRecording(!recording);
    };

  return (
    
    <div className='record-button-div'>

        <button className={`record-voice ${recording ? 'record-voice-active' : ''}`} onClick={handleRecord}>{buttonText}</button>

        {recording && <div className='recording-indicator'></div>}
    </div>
    
  )
}

export default RecordButton
