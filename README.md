# Daily Fuck

A daily trivia game built with React.js where users guess the top 10 answers to a daily prompt.

## Features

- 🎯 Daily prompts with top 10 answers
- ⌨️ Type answers or select from a complete list
- ❤️ 5 lives system - game ends after 5 incorrect guesses
- 📋 Answer list modal with search functionality
- 📤 Share results functionality (copy to clipboard, Wordle-style)
- 🎨 Modern, responsive UI

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## How to Play

1. Read the daily prompt
2. Type your answers in the input field
3. You have 5 lives - each incorrect guess costs one life
4. Find all 10 answers to win!
5. Click the 📋 icon to view all available answers and select from the list
6. Share your results using the Share button (appears after game ends)

## Project Structure

```
src/
  ├── components/
  │   ├── TriviaGame.js       # Main game component
  │   ├── TriviaGame.css      # Game styles
  │   ├── AnswerListModal.js  # Answer selection modal
  │   └── AnswerListModal.css # Modal styles
  ├── App.js                  # Root component
  ├── App.css                 # App styles
  ├── index.js                # Entry point
  └── index.css               # Global styles
```

## Customization

To add your own trivia prompts, edit the `TRIVIA_DATA` object in `src/components/TriviaGame.js`. You can also implement a date-based system to show different prompts each day.

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.
