import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import { getSubmissions, deleteSubmission, clearAllData } from '../utils/storage';

const ADMIN_PASSWORD = 'pooppoop';

const AdminPanel = ({ onClose, onSave }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'submissions'
  
  const [question, setQuestion] = useState('');
  const [allAnswers, setAllAnswers] = useState('');
  const [topTenAnswers, setTopTenAnswers] = useState(['', '', '', '', '', '', '', '', '', '']);
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState({});
  
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSubmissions();
    }
  }, [isAuthenticated]);

  const loadSubmissions = () => {
    const allSubmissions = getSubmissions();
    setSubmissions(allSubmissions);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const handleTopTenChange = (index, value) => {
    const newTopTen = [...topTenAnswers];
    newTopTen[index] = value;
    setTopTenAnswers(newTopTen);
  };

  const handleAllAnswersChange = (e) => {
    setAllAnswers(e.target.value);
  };

  const parseAllAnswers = () => {
    if (!allAnswers.trim()) return [];
    return allAnswers
      .split(/[\n,]/)
      .map(answer => answer.trim())
      .filter(answer => answer.length > 0);
  };

  const validate = () => {
    const newErrors = {};

    if (!question.trim()) {
      newErrors.question = 'Question is required';
    }

    if (topTenAnswers.some(answer => !answer.trim())) {
      newErrors.topTen = 'All 10 answers are required';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    const allPossibleAnswers = parseAllAnswers();
    
    const newPrompt = {
      id: Date.now(),
      question: question.trim(),
      answers: topTenAnswers.map(a => a.trim()),
      allPossibleAnswers: allPossibleAnswers.length > 0 
        ? allPossibleAnswers 
        : topTenAnswers.map(a => a.trim()),
      date: date
    };

    onSave(newPrompt);
    handleClose();
  };

  const handleDeleteSubmission = (submissionId) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      deleteSubmission(submissionId);
      loadSubmissions();
    }
  };

  const handleUseSubmission = (submission) => {
    setQuestion(submission.question);
    if (submission.answers) {
      setTopTenAnswers(submission.answers);
    }
    if (submission.allPossibleAnswers) {
      setAllAnswers(submission.allPossibleAnswers.join('\n'));
    }
    setActiveTab('add');
  };

  const handleClose = () => {
    setIsAuthenticated(false);
    setPassword('');
    setPasswordError('');
    setQuestion('');
    setAllAnswers('');
    setTopTenAnswers(['', '', '', '', '', '', '', '', '', '']);
    setDate('');
    setErrors({});
    setActiveTab('add');
    onClose();
  };

  // Password screen
  if (!isAuthenticated) {
    return (
      <div className="admin-overlay" onClick={handleClose}>
        <div className="admin-panel admin-password-panel" onClick={(e) => e.stopPropagation()}>
          <div className="admin-header">
            <h2>Admin Access</h2>
            <button className="admin-close-btn" onClick={handleClose}>×</button>
          </div>
          <div className="admin-password-content">
            <form onSubmit={handlePasswordSubmit}>
              <div className="admin-password-field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Enter admin password"
                  className={passwordError ? 'error' : ''}
                  autoFocus
                />
                {passwordError && <span className="error-message">{passwordError}</span>}
              </div>
              <button type="submit" className="admin-password-btn">
                Access Admin Panel
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main admin panel
  return (
    <div className="admin-overlay" onClick={handleClose}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <h2>Admin Panel</h2>
          <button className="admin-close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            Add Question
          </button>
          <button
            className={`admin-tab ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            Submissions ({submissions.length})
          </button>
          <button
            className="admin-clear-btn"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear ALL localStorage data? This cannot be undone.')) {
                clearAllData();
                alert('All data cleared! Page will reload.');
                window.location.reload();
              }
            }}
            title="Clear All Data"
          >
            🗑️ Clear Data
          </button>
        </div>

        {activeTab === 'add' && (
          <div className="admin-content">
            <div className="admin-field">
              <label>Question / Prompt *</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter the daily question..."
                className={errors.question ? 'error' : ''}
                rows={3}
              />
              {errors.question && <span className="error-message">{errors.question}</span>}
            </div>

            <div className="admin-field">
              <label>Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            <div className="admin-field">
              <label>Top 10 Answers (in order) *</label>
              <div className="top-ten-grid">
                {topTenAnswers.map((answer, index) => (
                  <div key={index} className="top-ten-item">
                    <span className="top-ten-number">{index + 1}.</span>
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => handleTopTenChange(index, e.target.value)}
                      placeholder={`Answer ${index + 1}`}
                      className={errors.topTen && !answer.trim() ? 'error' : ''}
                    />
                  </div>
                ))}
              </div>
              {errors.topTen && <span className="error-message">{errors.topTen}</span>}
            </div>

            <div className="admin-field">
              <label>All Possible Answers (optional)</label>
              <p className="field-hint">
                Enter all possible answers, one per line or separated by commas.
                If left empty, only the top 10 will be available.
              </p>
              <textarea
                value={allAnswers}
                onChange={handleAllAnswersChange}
                placeholder="Enter all possible answers (one per line or comma-separated)..."
                rows={8}
              />
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="admin-content admin-submissions-content">
            {submissions.length === 0 ? (
              <div className="no-submissions">
                <p>No submissions yet.</p>
              </div>
            ) : (
              <div className="submissions-list">
                {submissions.map((submission) => (
                  <div key={submission.id} className="submission-item">
                    <div className="submission-item-header">
                      <span className="submission-date">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                      <div className="submission-item-actions">
                        <button
                          className="submission-use-btn"
                          onClick={() => handleUseSubmission(submission)}
                        >
                          Use
                        </button>
                        <button
                          className="submission-delete-btn"
                          onClick={() => handleDeleteSubmission(submission.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="submission-item-question">
                      <strong>Question:</strong> {submission.question}
                    </div>
                    {submission.answers && submission.answers.length > 0 && (
                      <div className="submission-item-answers">
                        <strong>Top 10:</strong>
                        <ol>
                          {submission.answers.map((answer, idx) => (
                            <li key={idx}>{answer}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="admin-footer">
            <button className="admin-cancel-btn" onClick={handleClose}>
              Cancel
            </button>
            <button className="admin-save-btn" onClick={handleSave}>
              Save Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
