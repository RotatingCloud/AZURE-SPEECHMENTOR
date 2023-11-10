import React, { useState } from 'react';
import './PracticeSentences.css';
import RecordButton from '../RecordButton/RecordButton';

const PracticeSentences = () => {

  const [sentence, setSentence] = useState('');
  const [assessment, setAssessment] = useState({});
  const [words, setWords] = useState([]);

  const updateText = (data) => {
    setSentence(data.sentence);
    setAssessment(data.assesment);
    setWords(data.words);
  }

  return (
    <div className='practice-sentence-div'>
      <div className='practice-sentence-div-header'>
        <RecordButton onAudioProcessed={updateText} />
      </div>
      <div className='practice-sentence-div-body'>
        <label className='practice-sentence-div-header-text'>Sentence: {sentence}</label>
        
        <div className='body-words'>
          {words.map((word, index) => (
            <div key={index} className='word'>
              <label className='word-label'>{word.word}</label>
              <ul>
                {word.syllables.map((syllable, idx) => (
                  <li key={idx}>
                    {syllable.Syllable}: {syllable.AccuracyScore}
                  </li>
                ))}
              </ul>
              <div>
                {word.assesment.AccuracyScore && <div className='accuracy-score'>Accuracy Score: {word.assesment.AccuracyScore}</div>}
              </div>
            </div>
          ))}
        </div>

        <div className='body-assesment'>
          <div className='sentence-assesment'>
            {assessment.AccuracyScore && <div>Accuracy Score: {assessment.AccuracyScore}</div>}
            {assessment.FluencyScore && <div>Fluency Score: {assessment.FluencyScore}</div>}
            {assessment.CompletenessScore && <div>Completeness Score: {assessment.CompletenessScore}</div>}
            {assessment.PronScore && <div>Pronunciation Score: {assessment.PronScore}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PracticeSentences;
