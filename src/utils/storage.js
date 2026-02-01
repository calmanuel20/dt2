// Utility functions for localStorage management

const STORAGE_KEY = 'dailyTriviaData';

export const getStoredPrompts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return null;
};

export const savePrompt = (prompt) => {
  try {
    let prompts = getStoredPrompts() || { prompts: [] };
    
    // Check if prompt with same date exists, replace it
    const existingIndex = prompts.prompts.findIndex(
      p => p.date === prompt.date
    );
    
    if (existingIndex >= 0) {
      prompts.prompts[existingIndex] = prompt;
    } else {
      prompts.prompts.push(prompt);
    }
    
    // Sort by date
    prompts.prompts.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const getTodaysPrompt = () => {
  const today = new Date().toISOString().split('T')[0];
  const stored = getStoredPrompts();
  
  if (stored && stored.prompts && stored.prompts.length > 0) {
    const todaysPrompt = stored.prompts.find(p => p.date === today);
    if (todaysPrompt) {
      return todaysPrompt;
    }
    
    // If no prompt for today, get the most recent one
    return stored.prompts[stored.prompts.length - 1];
  }
  
  // Return default prompt if nothing found
  const defaultPrompt = {
    id: 1,
    question: "Name the top 10 most populous countries in the world",
    answers: [
      "China", "India", "United States", "Indonesia", "Pakistan",
      "Brazil", "Bangladesh", "Russia", "Mexico", "Japan"
    ],
    allPossibleAnswers: [
      "China", "India", "United States", "Indonesia", "Pakistan",
      "Brazil", "Bangladesh", "Russia", "Mexico", "Japan", "Nigeria",
      "Germany", "Philippines", "Vietnam", "Turkey", "Iran", "Thailand",
      "United Kingdom", "France", "Italy"
    ],
    date: today
  };
  
  // Save default prompt to localStorage
  savePrompt(defaultPrompt);
  return defaultPrompt;
};

export const getAllPrompts = () => {
  const stored = getStoredPrompts();
  return stored?.prompts || [];
};

// Submissions storage
const SUBMISSIONS_KEY = 'dailyTriviaSubmissions';

export const getSubmissions = () => {
  try {
    const stored = localStorage.getItem(SUBMISSIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading submissions from localStorage:', error);
  }
  return [];
};

export const saveSubmission = (submission) => {
  try {
    const submissions = getSubmissions();
    submissions.push(submission);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
    return true;
  } catch (error) {
    console.error('Error saving submission to localStorage:', error);
    return false;
  }
};

export const deleteSubmission = (submissionId) => {
  try {
    const submissions = getSubmissions();
    const filtered = submissions.filter(s => s.id !== submissionId);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting submission:', error);
    return false;
  }
};

// Clear all localStorage data
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SUBMISSIONS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};
