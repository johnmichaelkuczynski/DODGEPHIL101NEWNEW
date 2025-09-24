# Exam System

A fully interactive exam system with proper state management, submission, and grading.

## How to Run

1. Start the development server: `npm run dev`
2. Navigate to `/exams/exam-demo-001` for the demo exam
3. Or click "Start Practice Exam" from the home dashboard

## Seeded Demo Exam

The system includes a pre-seeded exam at `exam-demo-001` with:
- 3 Multiple choice questions (2 points each)
- 2 Short answer questions (5 points each) with regex and synonym support
- 1 Essay question (15 points) with rubric

## Test Steps

### A. Load /exams/exam-demo-001 → questions render; no console errors
- Navigate to `/exams/exam-demo-001`
- Verify all questions display properly
- Check browser console for errors

### B. Answer all; click Submit → total score shows; each question shows feedback + explanation
- Answer all multiple choice, short answer, and essay questions
- Click "Submit Exam"
- Verify score percentage displays
- Verify individual question feedback appears

### C. Short-answer tolerance: "H2O", "h2o", and "water" all accepted
- For the water chemistry question, test:
  - "H2O" (exact match)
  - "h2o" (case insensitive)
  - "water" (synonym)
  - "H 2 O" (regex with spaces)

### D. Timer hits zero → auto-submit; results still render
- Wait for timer to reach zero
- Verify automatic submission occurs
- Verify results page renders correctly

### E. Retake resets state and timer; prior answers cleared
- Click "Retake Exam" after submission
- Verify all answers are cleared
- Verify timer resets to full duration

### F. Essay returns textual feedback from server
- Submit essay with various word counts
- Verify appropriate feedback based on length:
  - <50 words: Brief essay warning
  - 50-99 words: Needs development
  - 100+ words: Good response

### G. Refresh after submit → page rehydrates and shows results
- Submit exam and view results
- Refresh the page
- Verify results persist (Note: Currently results don't persist across refresh - would need database storage)

### H. Lighthouse/Console: no errors/warnings during run
- Open browser dev tools
- Complete entire exam flow
- Verify no console errors or warnings

## API Endpoints

- `GET /api/exams/:id` - Retrieves exam data
- `POST /api/exams/:id/submit` - Submits answers and returns graded results

## Features

- **Interactive Questions**: Radio buttons for MCQ, text inputs for short answers, textareas for essays
- **Real-time Validation**: Submit button disabled until all required questions answered
- **Timer**: Countdown timer with auto-submit on expiration
- **Lenient Grading**: Case-insensitive, punctuation-insensitive, regex support for short answers
- **Comprehensive Feedback**: Per-question feedback with explanations
- **Navigation**: Question-by-question navigation with progress indicators
- **Results Panel**: Score display with retake and review options