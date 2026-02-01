import React, { useState } from 'react';
import './QuestionSubmission.css';

const QuestionSubmission = ({ onClose, onSubmit }) => {
  const [question, setQuestion] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!question.trim()) {
      newErrors.question = 'Question is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    const submission = {
      id: Date.now(),
      question: question.trim(),
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    onSubmit(submission);
    setSubmitted(true);
    
    // Reset form after 2 seconds
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setQuestion('');
    setErrors({});
    setSubmitted(false);
    onClose();
  };

  if (submitted) {
    return (
      <div className="submission-overlay" onClick={handleClose}>
        <div className="submission-modal" onClick={(e) => e.stopPropagation()}>
          <div className="submission-success">
            <h2>✅ Thank You!</h2>
            <p>Your question submission has been received.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="submission-overlay" onClick={handleClose}>
      <div className="submission-modal" onClick={(e) => e.stopPropagation()}>
        <div className="submission-header">
          <h2>Submit a Question</h2>
          <button className="submission-close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="submission-content">
          <p className="submission-intro">
            Have a great question idea? Submit it here for consideration!
          </p>

          <div className="submission-field">
            <label>Question / Prompt *</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question..."
              className={errors.question ? 'error' : ''}
              rows={5}
            />
            {errors.question && <span className="error-message">{errors.question}</span>}
          </div>
        </div>

        <div className="submission-footer">
          <button className="submission-cancel-btn" onClick={handleClose}>
            Cancel
          </button>
          <button className="submission-submit-btn" onClick={handleSubmit}>
            Submit Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionSubmission;
