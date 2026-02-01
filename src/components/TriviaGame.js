import React, { useState, useEffect } from 'react';
import './TriviaGame.css';
import AnswerListModal from './AnswerListModal';
import AutocompleteInput from './AutocompleteInput';
import AdminPanel from './AdminPanel';
import QuestionSubmission from './QuestionSubmission';
import { getTodaysPrompt, savePrompt, saveSubmission } from '../utils/storage';

const TriviaGame = () => {
  const [prompt, setPrompt] = useState(null);
  const [revealedPositions, setRevealedPositions] = useState({}); // { position: answer }
  const [inputValue, setInputValue] = useState('');
  const [lives, setLives] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [showAnswerList, setShowAnswerList] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSubmission, setShowSubmission] = useState(false);
  const [incorrectGuesses, setIncorrectGuesses] = useState([]);

  // Load today's prompt on mount
  useEffect(() => {
    const todaysPrompt = getTodaysPrompt();
    setPrompt(todaysPrompt);
  }, []);

  if (!prompt) {
    return <div className="loading">Loading...</div>;
  }

  // Normalize answers for comparison (case-insensitive, trim whitespace)
  const normalizeAnswer = (answer) => answer.toLowerCase().trim();

  // Get all possible answers (for autocomplete)
  const allPossibleAnswers = prompt.allPossibleAnswers || prompt.answers;

  // Check if answer is correct and get its position
  const getAnswerPosition = (answer) => {
    const normalized = normalizeAnswer(answer);
    const index = prompt.answers.findIndex(
      correctAnswer => normalizeAnswer(correctAnswer) === normalized
    );
    return index >= 0 ? index + 1 : null; // Return 1-10, or null if not found
  };

  // Check if answer was already guessed
  const isAlreadyGuessed = (answer) => {
    const normalized = normalizeAnswer(answer);
    return Object.values(revealedPositions).some(
      revealedAnswer => normalizeAnswer(revealedAnswer) === normalized
    );
  };

  // Handle answer submission
  const handleSubmit = (answer) => {
    if (!answer || gameOver || gameWon) return;
    
    if (isAlreadyGuessed(answer)) {
      alert('You already guessed that answer!');
      return;
    }

    const position = getAnswerPosition(answer);

    if (position) {
      // Correct answer - reveal it in its position
      const newRevealed = {
        ...revealedPositions,
        [position]: prompt.answers[position - 1]
      };
      setRevealedPositions(newRevealed);

      // Check if all 10 answers have been found
      if (Object.keys(newRevealed).length === 10) {
        setGameWon(true);
        setGameOver(true);
      }
    } else {
      // Incorrect answer
      const newLives = lives - 1;
      setLives(newLives);
      setIncorrectGuesses(prev => [...prev, answer]);
      
      if (newLives === 0) {
        setGameOver(true);
      }
    }

    setInputValue('');
  };

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(inputValue);
  };

  // Handle answer selection from modal
  const handleAnswerSelect = (answer) => {
    handleSubmit(answer);
    setShowAnswerList(false);
  };

  // Handle admin save
  const handleAdminSave = (newPrompt) => {
    savePrompt(newPrompt);
    // Reload if it's today's prompt
    const today = new Date().toISOString().split('T')[0];
    if (newPrompt.date === today) {
      window.location.reload();
    }
  };

  // Handle question submission
  const handleQuestionSubmission = (submission) => {
    saveSubmission(submission);
  };

  // Generate share text (similar to Wordle) - without revealing answers
  const generateShareText = () => {
    const correctCount = Object.keys(revealedPositions).length;
    const totalGuesses = correctCount + incorrectGuesses.length;
    const livesUsed = 5 - lives;
    
    let shareText = `Daily Fuck - ${prompt.question}\n\n`;
    shareText += `Found ${correctCount}/10 answers\n`;
    shareText += `Guesses: ${totalGuesses} | Lives used: ${livesUsed}/5\n\n`;
    
    // Show answer grid without revealing answers
    for (let i = 1; i <= 10; i++) {
      if (revealedPositions[i]) {
        shareText += `${i}. ✅\n`;
      } else {
        shareText += `${i}. ⬜\n`;
      }
    }
    
    if (gameWon) {
      shareText += '\n🎉 Perfect!';
    } else if (gameOver) {
      shareText += '\n💔 Game Over';
    }
    
    return shareText;
  };

  // Handle share button click
  const handleShare = async () => {
    const shareText = generateShareText();
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        alert('Results copied to clipboard!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Results copied to clipboard!');
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  return (
    <div className="trivia-game">
      <header className="game-header">
        <h1>Daily Fuck</h1>
        <div className="header-actions">
          <button
            className="admin-btn"
            onClick={() => setShowAdmin(true)}
            title="Admin Panel"
          >
            ⚙️
          </button>
          <button
            className="answer-list-btn"
            onClick={() => setShowAnswerList(true)}
            title="View all answers"
          >
            📋
          </button>
          {(gameOver || gameWon) && (
            <button className="share-btn" onClick={handleShare}>
              Share
            </button>
          )}
          <button
            className="submit-question-btn"
            onClick={() => setShowSubmission(true)}
            title="Submit a Question"
          >
            💡
          </button>
        </div>
      </header>

      <div className="game-content">
        <div className="prompt-section">
          <h2 className="prompt-question">{prompt.question}</h2>
          <p className="prompt-hint">Find the top 10 answers</p>
        </div>

        <div className="lives-section">
          <span className="lives-label">Lives:</span>
          <div className="lives-display">
            {[...Array(5)].map((_, index) => (
              <span
                key={index}
                className={`life ${index < lives ? 'active' : 'lost'}`}
              >
                ❤️
              </span>
            ))}
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(Object.keys(revealedPositions).length / 10) * 100}%`
              }}
            />
          </div>
          <p className="progress-text">
            {Object.keys(revealedPositions).length} / 10 answers found
          </p>
        </div>

        {!gameOver && !gameWon && (
          <form onSubmit={handleFormSubmit} className="input-section">
            <AutocompleteInput
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSubmit}
              allPossibleAnswers={allPossibleAnswers}
              guessedAnswers={Object.values(revealedPositions)}
            />
            <button type="submit" className="submit-btn">
              Submit
            </button>
          </form>
        )}

        {/* Answer Grid - Positions 1-10 */}
        <div className="answer-grid-section">
          <h3>Answers</h3>
          <div className="answer-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((position) => {
              const isRevealed = revealedPositions[position];
              const answer = isRevealed 
                ? prompt.answers[position - 1] 
                : (gameOver ? prompt.answers[position - 1] : null);
              
              return (
                <div
                  key={position}
                  className={`answer-slot ${
                    isRevealed 
                      ? 'revealed correct' 
                      : gameOver 
                        ? 'revealed missed' 
                        : 'hidden'
                  }`}
                >
                  <span className="slot-number">{position}</span>
                  <span className="slot-answer">
                    {answer || '?'}
                  </span>
                  {isRevealed && <span className="slot-check">✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Incorrect Guesses */}
        {incorrectGuesses.length > 0 && (
          <div className="incorrect-guesses-section">
            <h4>Incorrect Guesses:</h4>
            <div className="incorrect-guesses-list">
              {incorrectGuesses.map((guess, index) => (
                <span key={index} className="incorrect-guess">{guess}</span>
              ))}
            </div>
          </div>
        )}

        {gameOver && (
          <div className="game-over-section">
            {gameWon ? (
              <div className="game-over-message success">
                <h2>🎉 Congratulations!</h2>
                <p>You found all 10 answers!</p>
              </div>
            ) : (
              <div className="game-over-message failure">
                <h2>💔 Game Over</h2>
                <p>You ran out of lives. All answers have been revealed.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showAnswerList && (
        <AnswerListModal
          answers={allPossibleAnswers}
          guessedAnswers={Object.values(revealedPositions)}
          onSelect={handleAnswerSelect}
          onClose={() => setShowAnswerList(false)}
        />
      )}

      {showAdmin && (
        <AdminPanel
          onClose={() => setShowAdmin(false)}
          onSave={handleAdminSave}
        />
      )}

      {showSubmission && (
        <QuestionSubmission
          onClose={() => setShowSubmission(false)}
          onSubmit={handleQuestionSubmission}
        />
      )}
    </div>
  );
};

export default TriviaGame;
