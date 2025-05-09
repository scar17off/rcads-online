import React, { useState, useMemo } from 'react';
import { rcadsStatements } from './statements';
import { IoMdAdd } from 'react-icons/io';
import { FiCopy } from 'react-icons/fi';
import './index.css';

const options = ['Never', 'Sometimes', 'Often', 'Always'];

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getRemainingStatements = (usedStatements) => {
  return rcadsStatements.filter(
    statement => !usedStatements.some(used => used.text === statement.text)
  );
};

function RCADSForm({ statements, startIndex, responses, onResponseChange }) {
  return (
    <div className="rcads-list">
      {statements.map(({ text }, idx) => {
        const questionNumber = startIndex + idx + 1;
        return (
          <div
            key={idx}
            className={`rcads-row${idx % 2 === 1 ? ' rcads-row-alt' : ''}`}
          >
            <div className="rcads-question">
              <span className="rcads-number">{questionNumber}.</span> {text}
            </div>
            <div className="rcads-options">
              {options.map(option => (
                <label key={option} className="rcads-option-label">
                  <input
                    type="radio"
                    name={`statement-${questionNumber}`}
                    value={option}
                    checked={responses[questionNumber - 1] === option}
                    onChange={() => onResponseChange(questionNumber - 1, option)}
                  />
                  <span className="rcads-option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  );
}

function App() {
  const [forms, setForms] = useState([]);
  const [responses, setResponses] = useState({});
  
  // Generate random 6-digit ID
  const randomId = useMemo(() => Math.floor(100000 + Math.random() * 900000), []);
  
  // Get current date
  const currentDate = useMemo(() => {
    const date = new Date();
    return date.toLocaleDateString('en-GB');
  }, []);

  // Initialize first form
  useMemo(() => {
    if (forms.length === 0) {
      setForms([shuffleArray(rcadsStatements.slice(0, 20))]);
    }
  }, [forms.length]);

  const handleAddForm = () => {
    const usedStatements = forms.flat();
    const remainingStatements = getRemainingStatements(usedStatements);
    
    if (remainingStatements.length > 0) {
      const newStatements = shuffleArray(remainingStatements.slice(0, 20));
      setForms([...forms, newStatements]);
    }
  };

  const handleResponseChange = (index, value) => {
    setResponses(prev => ({ ...prev, [index]: value }));
  };

  const handleExport = () => {
    let exportText = '';
    forms.forEach((formStatements, formIndex) => {
      formStatements.forEach((statement, idx) => {
        const questionNumber = formIndex * 20 + idx + 1;
        const response = responses[questionNumber - 1] || 'Not answered';
        exportText += `${questionNumber}. ${statement.text}: ${response}\n`;
      });
    });
    
    navigator.clipboard.writeText(exportText).then(() => {
      alert('Responses copied to clipboard!');
    });
  };

  return (
    <div className="rcads-container">
      <div className="rcads-header">
        <div style={{ float: 'left' }}>Date: {currentDate}</div>
        <div style={{ float: 'right' }}>ID: {randomId}</div>
        <div style={{ clear: 'both', textAlign: 'center', marginTop: 20 }}>
          <h2>RCADS</h2>
        </div>
      </div>
      <p><b>Please put a circle around the word that shows how often each of these things happens to you. There are no right or wrong answers.</b></p>
      
      {forms.map((formStatements, index) => (
        <RCADSForm
          key={index}
          statements={formStatements}
          startIndex={index * 20}
          responses={responses}
          onResponseChange={handleResponseChange}
        />
      ))}

      <div className="rcads-buttons">
        <button 
          className="rcads-button"
          onClick={handleAddForm}
          disabled={forms.length * 20 >= rcadsStatements.length}
        >
          <IoMdAdd size={24} />
        </button>
        <button 
          className="rcads-button"
          onClick={handleExport}
        >
          <FiCopy size={24} />
        </button>
      </div>
    </div>
  );
}

export default App;