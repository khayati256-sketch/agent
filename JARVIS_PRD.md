# Jarvis - Intelligent AI Assistant System

Version: 2.0 (Merged and Enhanced)  
Date: April 15, 2026  
Owner: Product + Engineering

## 1. Product Overview

Jarvis is a full-stack AI assistant that combines conversational AI, authenticated user workspaces, and executable automation commands (browser, desktop, messaging, and utility tasks).  
The product unifies:

- AI chat sessions with persistent history
- Agent Mode for command interpretation and execution
- Task runner and execution audit trail
- Reinforcement-style learning from outcomes
- Secure, OTP-based authentication flows

Primary users include students, working professionals, and power users who want a reliable assistant for both Q&A and real-world actions.

## 2. Goals and Non-Goals

### 2.1 Goals

- Deliver a premium conversational assistant UX with voice and text input.
- Execute safe local/browser tasks from natural language instructions.
- Persist chat + task history for traceability and reuse.
- Improve command handling over time via learning memory.
- Maintain secure authentication and account protection.

### 2.2 Non-Goals (Current Release)

- General unrestricted OS-level automation.
- Multi-tenant enterprise RBAC/admin console.
- Native mobile apps (web-first scope).

## 3. Feature Specifications

### 3.1 Frontend Features (React) - Premium Futuristic Interface

The Jarvis frontend is a modern, immersive, and delightful single-page application built with React 19, TypeScript, Vite, and Tailwind CSS. It delivers a premium AI assistant experience inspired by sci-fi interfaces (like JARVIS from Iron Man and advanced 2025 AI tools).

Design Philosophy:

- Dark cyber-futuristic theme with glassmorphism, subtle neon glows, and fluid micro-interactions.
- Color palette (primary):
- Background: `zinc-950` / `slate-950` (deep space black)
- Surface/cards: `slate-900/80` with `backdrop-blur-xl` (glass effect)
- Primary accent (AI intelligence): `violet-500 -> indigo-600`
- Voice and action highlight: `cyan-400` (neon)
- Success: `emerald-500`
- Warning/error: `rose-500`
- Text: `slate-100` (primary), `slate-400` (secondary)
- Animations: Powered by Framer Motion for buttery-smooth transitions, spring physics, and delightful feedback.
- Accessibility: WCAG 2.2 AA compliant with focus rings, ARIA labels, and reduced motion support.
- Responsiveness: Mobile-first design with collapsible sidebar on smaller screens.

#### 3.1.1 Chat Interface (Core Experience)

The central hub of Jarvis: a clean, threaded conversation interface that feels alive and responsive.

Key features:

- Full-height flexible layout with header `Jarvis - Always Listening` and live connection status.
- Message bubbles:
- User: right-aligned, `rounded-tr-lg`, `bg-violet-600/90`, subtle shadow and tail.
- Assistant: left-aligned, `bg-slate-800/90`, `border-slate-700`, violet left accent bar.
- Markdown rendering for code blocks, tables, and lists using `react-markdown`.
- Timestamp on hover with smooth fade-in.
- Auto-scroll to latest message.
- Copy action on assistant messages with tooltip + success toast.

Animations and transitions:

- New message enter: fade + slide up (`y: 30 -> 0`) spring transition.
- Typing indicator: three pulsing cyan dots with bounce.
- Message hover: subtle lift (`scale 1.01`) and glow.

#### 3.1.2 Voice Input (Web Speech API)

Features:

- Large circular voice button with neon cyan ring that glows/pulses when active.
- Real-time waveform visualization (canvas or SVG bars) reacting to mic volume.
- Interim transcript in floating glassmorphic pill above input.
- Final transcript auto-submit after silence detection.
- Language selector (`en-US` default) in settings.
- Press interaction with scale-down + ripple.

Animations:

- Active listening: breathing scale + glow ring animation.
- Waveform bars rise/fall with spring physics.
- Transcript pill slides up with fade.

#### 3.1.3 Text-to-Speech Output (Web Speech API)

Features:

- Optional auto-read aloud for assistant responses.
- Speaking indicator waveform next to message bubble.
- Settings: toggle, voice dropdown, speed slider (`0.5x - 2.0x`) with preview.
- Auto-stop speaking when a new user command is sent.
- Speaking message bubble gets cyan glow.

Transitions:

- Smooth fade when speech starts/stops.
- Custom styled range slider with thumb glow.

#### 3.1.4 Command History

Features:

- Virtualized list (`react-virtual`) for thousands of entries.
- Filters: date range, tool type, success/failure, keyword search.
- Item card includes:
- Tool icon by type color
- Input text, resolved tool, summary, timestamp
- Feedback status badge
- Expandable details: entities + raw model response (debug mode).
- Clear history action with confirmation modal.

Animations:

- Card fade on load/filter change.
- Smooth expand/collapse (Framer Motion).

#### 3.1.5 Feedback System

Features:

- Message-level feedback controls:
- `Correct` (emerald glow)
- `Incorrect` (rose glow)
- Incorrect feedback opens correction input with auto-focus.
- Buttons disable after submit with graceful fade.
- Optional celebratory particle burst on successful feedback save.

Micro-interactions:

- Hover: scale + glow.
- Click: spring tap (`0.95 -> 1`).
- Toast: `Thank you! Feedback recorded.`

#### 3.1.6 Loading, Error, and Empty States

Loading:

- Skeleton loaders with glass shimmer.
- Stage labels:
- `Thinking...`
- `Understanding intent...`
- `Executing tool...`
- `Preparing response...`
- Spinner with subtle rotating gradient ring.

Error:

- Glassmorphic banners with retry CTA and icon.
- Graceful fallback when Web Speech API is unsupported.

Empty:

- Empty history illustration and prompt text.
- Animated empty chat state with subtle floating particles.

Toasts:

- Motion-based toast system (bottom-right, auto-dismiss, color by type).

#### 3.1.7 Additional Premium UX Features

- Collapsible sidebar with Chat, History, Settings.
- Keyboard shortcuts:
- `Ctrl/Cmd + K` focus input
- `Ctrl/Cmd + Shift + M` toggle mic
- `Esc` stop speaking / close modal
- Settings page with Voice, Appearance, Feedback, Advanced sections.
- Theme toggle (dark default + optional light mode).
- Optimistic updates for feedback interactions.
- Performance: lazy-loaded voice modules, code-splitting, memoized renders.

### 3.2 Authentication and Account Security

Jarvis uses secure authentication with HTTP-only JWT cookie sessions and supports both password and Google OAuth sign-in.

Features:

- Email/password signup with sequential OTP verification:
- Step 1: phone OTP
- Step 2: email OTP
- Login with password + email OTP verification
- Google OAuth login
- Forgot password with OTP-based reset
- Account lock after configurable failed login attempts
- Resend OTP with cooldown and attempt limits
- Dev OTP mode for local testing

### 3.3 Conversational AI and Session Management

Features:

- Persistent chat sessions per user
- Create/list/load/delete sessions
- Per-session message history storage
- Auto-title generation from first user message
- Chat mode:
- Standard AI responses using configured LLM
- Agent mode:
- Interprets command, executes action, logs task, and returns execution context in assistant message

### 3.4 Agent Mode and Task Automation

Jarvis supports controlled task execution via a safe action model.

Execution categories:

- Local app automation (allow-listed apps)
- Browser automation in Chrome (YouTube, Google Search, Gmail, WhatsApp Web)
- Folder and media operations
- Messaging and email actions

Safety principles:

- Allow-list based app/folder actions
- Structured command interpretation
- Unsupported actions return blocked responses
- Execution progress is always captured and surfaced

### 3.5 Reinforcement Learning Feedback Loop

Jarvis includes learning memory to improve command handling over time.

Flow:

1. Command normalized and checked against learned mappings.
2. Retry/cooldown rules checked for recent failures.
3. Command interpreted via catalog -> parser -> LLM.
4. Task executed and result recorded.
5. Success updates learning dataset.
6. Failures store reason, retry window, and suggestions.

Adaptive behaviors:

- Learned mapping reuse for repeated intents
- Cooldown window (1 hour) for repeated failing commands
- Auto-suggestions for fallback actions (example: WhatsApp Web fallback)
- Correction inference from later successful commands

## 4. Backend Technical Specification

### 4.1 Runtime and Framework

- Node.js + Express (ESM)
- PostgreSQL via `pg`
- Input validation via `zod`
- Security middleware: `helmet`, `hpp`, rate limiting
- LLM integration via OpenAI-compatible SDK

### 4.2 Core Services

- `openai.service`: chat reply generation + structured command interpretation
- `commandCatalog.service`: exact-match large catalog routing
- `commandParser.service`: rule-based fallback parser
- `agent.service`: orchestration across learning, parsing, execution, and feedback
- `taskExecutor.service`: unified action execution engine
- `taskFeedback.service`: retry logic + learning updates + failure suggestions
- `browserAutomation.service`: Puppeteer Chrome workflows
- `localAutomation.service`: safe local app/folder/media actions
- `messagingAutomation.service`: SMTP + WhatsApp desktop/web helpers

### 4.3 Command Routing Strategy

Routing precedence:

1. Command catalog exact match (`commands.catalog.json`)
2. Rule parser
3. LLM interpretation fallback (if available)

Route types:

- `local`
- `browser`
- `chat`

## 5. API Specification (MVP + Enhanced)

Base URL: `/api`

### 5.1 Auth APIs

- `POST /auth/signup`
- `POST /auth/signup/verify-phone`
- `POST /auth/signup/verify-email`
- `POST /auth/signup/resend-otp`
- `POST /auth/login`
- `POST /auth/login/verify-otp`
- `POST /auth/login/resend-otp`
- `POST /auth/google`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/logout`
- `GET /auth/me`

### 5.2 Chat APIs

- `GET /chat/sessions`
- `POST /chat/sessions`
- `GET /chat/sessions/:sessionId`
- `DELETE /chat/sessions/:sessionId`
- `POST /chat/message`

### 5.3 Task APIs

- `POST /tasks/run`
- `GET /tasks/history`

### 5.4 Utility APIs

- `GET /health`
- `GET /config/public`
- `GET /auth/debug/smtp-status`
- `POST /auth/debug/send-otp-email`

## 6. Data Model (PostgreSQL)

### 6.1 Primary Tables

- `users`
- `signup_sessions`
- `otp_codes`
- `chat_sessions`
- `chat_messages`
- `task_logs`
- `task_history`
- `command_learning_examples`

### 6.2 Key Relationships

- One user -> many chat sessions
- One chat session -> many chat messages
- One user -> many task logs/history records
- One user -> many learning examples (unique normalized instruction)

## 7. Security, Privacy, and Guardrails

Authentication and session:

- JWT signed with server secret
- HTTP-only cookie, `sameSite=lax`, `secure` in production

Abuse protection:

- Route-level auth rate limiters
- OTP send/verify throttling
- OTP spam prevention guard

Data and validation:

- Zod schema validation on request payloads
- AppError + centralized error handler
- Minimal public config surface (`googleEnabled`, `openAiEnabled`)

Automation safety:

- App/folder allow-list restrictions
- Browser automation scoped to known tasks
- Unsupported actions return blocked status, not arbitrary execution

## 8. Non-Functional Requirements

Performance:

- Chat response target: p50 < 1.5s (non-agent), p50 < 4s (agent simple task)
- History and session lists should remain responsive at 10k+ records with pagination/virtualization

Reliability:

- Graceful fallback when LLM provider unavailable
- Graceful fallback when voice APIs unsupported
- Retry windows and transparent status messaging for failed tasks

Scalability:

- Stateless API nodes (cookie JWT verification)
- DB-indexed query paths on user/session/date dimensions

Accessibility:

- WCAG 2.2 AA baseline
- Keyboard navigation and focus-visible states
- Reduced motion support for animation-heavy UI

## 9. Frontend Architecture (Target)

### 9.1 Updated Frontend Tech Stack

- React `19.x`
- Vite `6.x`
- TypeScript `5.x`
- Tailwind CSS `v4.x`
- DaisyUI `v5.x`
- Framer Motion (latest)
- `lucide-react`
- `react-markdown`
- `react-virtual`
- `canvas-confetti` (optional)
- `sonner` (toasts)

### 9.2 Updated Frontend Folder Structure

```text
client/
|- public/
|  |- favicon.ico
|- src/
|  |- assets/
|  |  |- images/
|  |  |- icons/
|  |- components/
|  |  |- atoms/
|  |  |  |- Button.tsx
|  |  |  |- Input.tsx
|  |  |  |- Badge.tsx
|  |  |  |- Icon.tsx
|  |  |  |- WaveformVisualizer.tsx
|  |  |- molecules/
|  |  |  |- MessageBubble.tsx
|  |  |  |- FeedbackBar.tsx
|  |  |  |- VoiceButton.tsx
|  |  |  |- HistoryCard.tsx
|  |  |- organisms/
|  |  |  |- ChatWindow.tsx
|  |  |  |- CommandInput.tsx
|  |  |  |- HistoryPanel.tsx
|  |  |  |- Sidebar.tsx
|  |  |  |- SettingsPanel.tsx
|  |  |- layouts/
|  |     |- MainLayout.tsx
|  |     |- SettingsLayout.tsx
|  |- hooks/
|  |  |- useSpeechRecognition.ts
|  |  |- useTextToSpeech.ts
|  |  |- useAgent.ts
|  |  |- useHistory.ts
|  |  |- useFramerAnimations.ts
|  |- pages/
|  |  |- Chat.tsx
|  |  |- History.tsx
|  |  |- Settings.tsx
|  |- store/
|  |  |- chatStore.ts
|  |  |- settingsStore.ts
|  |  |- historyStore.ts
|  |  |- uiStore.ts
|  |- services/
|  |  |- api.ts
|  |  |- agentService.ts
|  |  |- feedbackService.ts
|  |  |- historyService.ts
|  |- types/
|  |  |- index.ts
|  |  |- agent.types.ts
|  |  |- ui.types.ts
|  |- utils/
|  |  |- animations.ts
|  |  |- formatDate.ts
|  |  |- cn.ts
|  |- App.tsx
|  |- main.tsx
|  |- index.css
|- index.html
|- vite.config.ts
|- tailwind.config.ts
|- tsconfig.json
```

### 9.3 Tailwind Extension Requirements

- Custom semantic colors: violet, indigo, cyan, emerald, rose
- Utility classes for glass surfaces and neon shadows
- Custom animations: `glow-pulse`, `waveform`, `ripple`, `breathe`

## 10. Environment and Configuration

### 10.1 Frontend

- `VITE_API_BASE_URL`
- `VITE_GOOGLE_CLIENT_ID`

### 10.2 Backend

- Core: `PORT`, `NODE_ENV`, `CLIENT_URL`
- Auth: `JWT_SECRET`, `JWT_EXPIRY`, cookie settings
- Database: `DATABASE_URL`, `DATABASE_SSL`
- LLM: `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`
- OTP/Security: cooldown/expiry/attempt env vars
- Email: `SMTP_*`, `MAIL_FROM`
- Automation: `AGENT_ARTIFACTS_DIR`, `COMMAND_CATALOG_PATH`, `WHATSAPP_CONTACTS_JSON`

## 11. Observability and QA

### 11.1 Logging and Monitoring

- Structured server logs for request lifecycle and errors
- Automation execution progress logged per task
- SMTP diagnostics endpoint for local debugging

### 11.2 Test Strategy

- Unit tests:
- parser logic
- feedback learning and retry windows
- validation schemas
- Integration tests:
- auth OTP lifecycle
- chat session APIs
- task execution status paths (completed/failed/waiting)
- E2E tests:
- signup/login/dashboard flow
- chat + agent mode workflow
- voice input fallback behavior

## 12. Milestones and Delivery Plan

### Phase 1 (Completed Baseline)

- Auth + OTP + Google login
- Chat sessions and persistent history
- Task runner and core automation actions
- Learning feedback persistence and retry behavior

### Phase 2 (Premium Frontend Upgrade)

- TypeScript migration
- Premium UI theme and animations
- Advanced history panel + filters + virtualization
- Feedback UX enhancements and toast system
- Voice waveform and TTS settings panel

### Phase 3 (Production Hardening)

- Expanded test coverage
- Performance tuning and profiling
- Monitoring/alerts and deployment automation
- Documentation and runbooks

## 13. Risks and Mitigations

- Browser automation fragility: keep selectors resilient, add fallback selectors, run smoke checks regularly.
- Voice API variance across browsers: detect support and degrade gracefully.
- SMTP provider constraints: expose diagnostics, support mock/dev modes.
- Incorrect command execution: enforce allow-lists, provide transparent confirmations and fallback suggestions.

## 14. Acceptance Criteria

- Users can sign up and log in with OTP-secured flows.
- Users can create and manage chat sessions.
- Agent mode executes supported commands and returns structured execution results.
- Task history and learning memory update correctly for success/failure flows.
- Premium frontend states (loading/error/empty) are visually complete and accessible.
- Voice input and TTS settings work with graceful fallback on unsupported browsers.
- Security controls (validation, throttling, cookie auth) are enforced in all protected APIs.

## 15. Appendix

### 15.1 Current Repository Baseline (as of April 15, 2026)

- Frontend currently implemented in React 19 + JavaScript + Tailwind 3.
- Backend implemented in Node.js + Express + PostgreSQL.
- This PRD defines the production target state, including TypeScript/Tailwind v4 frontend upgrades.
