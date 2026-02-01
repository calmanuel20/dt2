import React, { useState, useRef, useEffect } from 'react';
import './AutocompleteInput.css';

const AutocompleteInput = ({ 
  value, 
  onChange, 
  onSubmit, 
  allPossibleAnswers, 
  guessedAnswers,
  disabled 
}) => {
  const [filteredAnswers, setFilteredAnswers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);

  const normalize = (str) => str.toLowerCase().trim();

  // Filter answers based on input
  useEffect(() => {
    if (!value || value.trim() === '') {
      setFilteredAnswers([]);
      setShowDropdown(false);
      return;
    }

    const normalizedInput = normalize(value);
    const filtered = allPossibleAnswers.filter(answer => {
      const normalizedAnswer = normalize(answer);
      const isAlreadyGuessed = guessedAnswers.some(
        guessed => normalize(guessed) === normalizedAnswer
      );
      return normalizedAnswer.includes(normalizedInput) && !isAlreadyGuessed;
    });

    setFilteredAnswers(filtered.slice(0, 10)); // Limit to 10 suggestions
    setShowDropdown(filtered.length > 0);
    setSelectedIndex(-1);
  }, [value, allPossibleAnswers, guessedAnswers]);

  // Handle input change
  const handleChange = (e) => {
    onChange(e.target.value);
    setShowDropdown(true);
  };

  // Handle input focus
  const handleFocus = () => {
    if (filteredAnswers.length > 0) {
      setShowDropdown(true);
    }
  };

  // Handle input blur (with delay to allow click on dropdown)
  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  // Handle dropdown item selection
  const handleSelect = (answer) => {
    onChange(answer);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || filteredAnswers.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit(value);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredAnswers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredAnswers.length) {
          handleSelect(filteredAnswers[selectedIndex]);
        } else {
          onSubmit(value);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="autocomplete-container">
      <div className="autocomplete-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer..."
          className="autocomplete-input"
          disabled={disabled}
          autoComplete="off"
        />
        {showDropdown && filteredAnswers.length > 0 && (
          <div className="autocomplete-dropdown">
            {filteredAnswers.map((answer, index) => (
              <div
                key={index}
                className={`dropdown-item ${
                  index === selectedIndex ? 'selected' : ''
                }`}
                onClick={() => handleSelect(answer)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {answer}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutocompleteInput;
