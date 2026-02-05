# devops-quiz-app

## Question Format
All quiz questions are stored in `data/questions.json`.

Each question follows this structure:

```json
{
  "id": "Q1",
  "topic": "Continuous Integration",
  "question": "What is the primary goal of Continuous Integration (CI)?",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "answerIndex": 1,
  "explanation": "Explanation shown after answering."
}
## Features
- question bank with 20 questions
- 4 topics included
- Topic selection dropdown (UI)
- Loads questions from JSON using fetch()
- Shows one question at a time
- Submit button checks the selected answer
- Displays feedback and explanation
- Displays feedback and explanation
