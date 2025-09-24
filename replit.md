# Philosophical Learning Platform

## Overview
This project is an advanced AI-powered philosophical learning platform designed to provide an engaging, personalized educational experience for philosophical texts. It guides users through complex subjects by integrating with any philosophical content, offering interactive tools for understanding, analyzing, and generating content. The business vision is to serve philosophical students and enthusiasts, with market potential in academic and self-study sectors, aspiring to become a leading AI-powered educational resource in philosophy.

## User Preferences
- Preferred communication style: Simple, everyday language.
- Chat interface should be much larger (made 420px wide)
- User input should be a large textarea, not small input field
- Email functionality should only appear when user clicks on a specific response, not as a persistent input field
- AI responses should be very short (3-4 sentences maximum) unless user specifically asks for elaboration
- Enter key should send messages (Shift+Enter for new lines)
- **Grading Policy**: Grade ONLY on philosophical substance, never deduct points for grammar, spelling, capitalization, or formatting issues

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **UI**: Shadcn/ui (Radix UI primitives), Tailwind CSS
- **State Management**: TanStack Query (server), React hooks (local)
- **Routing**: Wouter
- **Math Rendering**: KaTeX

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES modules)
- **Database**: PostgreSQL with Drizzle ORM (Neon)
- **Session Storage**: PostgreSQL
- **Authentication**: Password-free username login for testing

### Key Capabilities
- **Document Processing**: Handles pre-loaded academic content, auto-generated navigation, and mathematical notation.
- **AI Integration**: Supports multi-model AI (DeepSeek, OpenAI GPT-4, Claude 4, Perplexity) with full document context for Q&A and content modification, emphasizing pure LLM responses.
- **Interactive Features**: Text highlighting, rewrite capabilities, quiz/test creation, study guide generation, podcast script summarization.
- **Practice System**: Interactive homework, quizzes, tests with instant "Show Solutions," symbolic logic keyboard, performance tracking, adaptive diagnostics.
- **Living Study Guides**: Interactive guides for exams with AI-generated practice tests, essay feedback, and real-time AI grading.
- **Final Exam System**: AI-powered final exam generation with one-click creation and JSON API integration.
- **User Interface**: Responsive design with navigation sidebar, AI model selector, chat, and instruction box. Export options include PDF and text copy.
- **Freemium Model**: AI-generated previews for unregistered users, full functionality via credit purchases.
- **Security**: Secure payment verification.
- **Testing Authentication**: Password-free login with automatic user creation and unlimited credits.
- **Database Integration**: PostgreSQL for user data, progress tracking, and session management.
- **Grading System**: Weighted percentage-based grading, excluding practice assignments, with category-based calculation and transparent display. Focuses on philosophical substance.

### System Design Choices
- **UI/UX**: Prioritizes content display space, clear typography, accessibility, and responsive design. Theming uses CSS variables for light/dark modes.
- **Data Flow**: Manages static content loading, user interaction, AI processing with document context, response handling, and session persistence.
- **Content Handling**: Robust text extraction and formatting for academic integrity, including precise mathematical notation and philosophical propositions. AI prompts mandate Unicode for logical symbols.
- **AI Integration**: Utilizes multiple AI models with context-awareness and user-defined instructions. Employs intelligent chunking (4000 token limit). Prioritizes philosophical concepts over symbolic notation.
- **Feature Specifications**:
    - **Practice Finals/Midterms**: Multi-question exams with AI-powered semantic equivalence grading.
    - **Quiz Generation**: AI-powered quizzes, including symbolic logic and multiple-choice.
    - **Content Expansion**: Comprehensive assignments covering translation, proofs, Boolean algebra, etc.
    - **Analytics Dashboard**: Learning analytics, performance trends, and visual tracking.
    - **Grading System**: Liberal grading logic accepting multiple notation systems, automatic answer reveal, enhanced feedback. Weighted percentage system for categories (Discussions: 19%, Essays: 13%, Homeworks: 19%, Quizzes: 19%, Midterm: 6%, Term Papers: 13%, Final: 10%). Practice assignments are excluded from overall grade calculation.
    - **Show Solutions**: Instant viewing of answers and explanations for practice content.
    - **HTML Rendering**: Proper HTML rendering for preset content and dark mode.

## External Dependencies

### Core Libraries
- **@anthropic-ai/sdk**: Claude AI integration
- **@neondatabase/serverless**: PostgreSQL database connection
- **@tanstack/react-query**: Server state management and caching
- **@paypal/paypal-server-sdk**: PayPal integration

### UI Components
- **@radix-ui/***: Accessible component primitives
- **class-variance-authority**: Component variant styling
- **cmdk**: Command palette functionality
- **date-fns**: Date formatting utilities
- **KaTeX**: Mathematical notation rendering

### Development Tools
- **drizzle-kit**: Database schema management and migrations
- **tsx**: TypeScript execution for development
- **wouter**: Lightweight routing solution
- **vite**: Frontend build tool
- **esbuild**: Backend bundling

## Recent Changes

### September 22, 2025 - Major Platform Fixes & AI Detection Integration

**Critical Infrastructure Fixes:**
- **Fixed Module Display**: All 6 course modules now display properly on main interface (previously only Week 1 showed)
- **Fixed Navigation**: "Back to Modules" button now works correctly across all module views
- **Fixed Discussion Submissions**: Resolved content field mismatch causing submission failures
- **Fixed Lecture Generation**: Corrected endpoint routing and eliminated JSON parsing timeouts
- **Fixed Short Answer Questions**: Homework/quiz text input fields now render properly for essay questions
- **Fixed Quiz Generation**: Proper question type mapping ensures mixed multiple choice and text input questions
- **Eliminated Grade Popups**: Removed annoying popup alerts, grades now display inline with questions
- **CRITICAL: Fixed Practice Quiz Text Input Fields**: Resolved rendering logic where questions 4 & 5 had no input fields - now all text-based questions show textarea inputs for answers

**New Feature - AI Detection Integration:**
- **GPTZero Integration**: Automatic AI detection for all discussion AND essay submissions
- **Real-time Scanning**: Every discussion and essay post automatically scanned for AI-generated content
- **Visual Indicators**: AI probability scores display in main interface with color-coded badges for both discussions and essays
- **Academic Integrity Alerts**: Flagged submissions (>70% AI probability) show warning messages inline with grades
- **Instructor Feedback**: AI detection results included in grading feedback for transparency
- **Comprehensive Coverage**: Both major writing assignments (discussions and essays) now include automatic AI integrity checking

**Technical Improvements:**
- Enhanced homework data transformation to support multiple question types
- Improved error handling across all generation endpoints
- Streamlined grading workflow with inline result display
- Secured API integration with encrypted secret management
- **Question Type Detection**: Implemented per-question type determination instead of per-problem classification to ensure proper input field rendering
- **Fallback Input Logic**: Added robust fallback to textarea inputs when question options are missing or type is undetermined

**Educational Platform Status:**
✅ All 8 Core Features Operational:
1. Working modules with proper navigation
2. Discussion assignments with AI detection and grading
3. Essay submissions with AI detection and grading
4. Practice homework generation and grading
5. LLM-generated homework with mixed question types
6. LLM-generated practice quizzes with proper input fields
7. LLM-generated practice exams
8. LLM-generated formal exams

**Platform Stability:** All major functionality verified and operational