import React, { useState } from 'react';
import './AnswerListModal.css';

const AnswerListModal = ({ answers, guessedAnswers, onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Normalize for comparison
  const normalize = (str) => str.toLowerCase().trim();

  // Check if answer is already guessed
  const isGuessed = (answer) => {
    return guessedAnswers.some(
      guessed => normalize(guessed) === normalize(answer)
    );
  };

  // Filter answers based on search term
  const filteredAnswers = answers.filter(answer =>
    normalize(answer).includes(normalize(searchTerm))
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>All Available Answers</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-search">
          <input
            type="text"
            placeholder="Search answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            autoFocus
          />
        </div>

        <div className="modal-answers">
          {filteredAnswers.length === 0 ? (
            <p className="no-results">No answers found matching "{searchTerm}"</p>
          ) : (
            filteredAnswers.map((answer, index) => {
              const guessed = isGuessed(answer);
              return (
                <button
                  key={index}
                  className={`answer-option ${guessed ? 'guessed' : ''}`}
                  onClick={() => !guessed && onSelect(answer)}
                  disabled={guessed}
                >
                  <span className="answer-option-text">{answer}</span>
                  {guessed && <span className="answer-option-check">✓</span>}
                </button>
              );
            })
          )}
        </div>

        <div className="modal-footer">
          <p className="modal-hint">
            Click on an answer to select it. Already guessed answers are disabled.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnswerListModal;
