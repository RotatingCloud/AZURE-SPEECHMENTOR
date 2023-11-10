import React, { useState } from 'react';
import './PracticeWord.css';
import RecordButton from '../RecordButton/RecordButton';
import Search from '../Search/Search';

const PracticeWord = () => {
    
    const [word, setWord] = useState('');
    const [syllables, setSyllables] = useState([]);
    const [laymans, setLaymans] = useState([]);
    const [assessment, setAssessment] = useState('');
    const [message, setMessage] = useState('');

    const updateText = (data) => {
        if (data.type === 'sentence') {
            setMessage("Please record a word, not a sentence.");
            setTimeout(() => {
                setMessage('');
            }, 3000);
            return;
        }
        setWord(data.word);
        setSyllables(data.syllables);
        setAssessment(data.assesment);
    }

    return (
        <div className='practice-word-div'>
            <div className='practice-word-div-header'>
                <RecordButton onAudioProcessed={updateText} inputWord={word} />
                <Search setLaymans={setLaymans}/>
                {message && <div className="message">{message}</div>}
                {laymans && laymans.length > 0 && <div className="laymans">{laymans.join(' · ')}</div>}
            </div>
            {word && <div className='practice-word-div-body'>

                <label className='practice-word-div-word'>{word}</label>

                <div className='body-syllables'>
                    
                    <div className='practice-word-div-syllables'>
                        <label>Syllables</label>
                        <ul>
                            {syllables.map((syllable, index) => (
                                <li key={index}>
                                    {syllable.Syllable}: {syllable.AccuracyScore}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className='body-assesment'>
                    <div className='practice-word-div-assessment'>
                        <label>Assessment</label>
                        <div>
                            {assessment.AccuracyScore && <div>Accuracy Score: {assessment.AccuracyScore}</div>}
                            {assessment.FluencyScore && <div>Fluency Score: {assessment.FluencyScore}</div>}
                            {assessment.CompletenessScore && <div>Completeness Score: {assessment.CompletenessScore}</div>}
                            {assessment.PronScore && <div>Pronunciation Score: {assessment.PronScore}</div>}
                        </div>
                    </div>
                </div>
            </div>}
        </div>
    )
}

export default PracticeWord;
