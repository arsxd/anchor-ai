# ⚓ AnchorAI — GenAI-Powered Recovery & Prevention Platform

A multi-modal, GenAI-powered recovery and prevention platform for individuals navigating substance use disorders and their caregivers. Built for the PromptWars Hackathon.

## 🧠 GenAI Services Used

**Google Gemini (gemini-flash-latest)** — used as the core engine across all features:

| Feature | GenAI Integration |
|---|---|
| AI Companion Chat | Streaming conversational support with context-aware system prompts personalized to user profile |
| Emergency Script Generator | Generates personalized refusal/coping scripts from user context + scenario |
| Crisis SOS | Generates grounding steps personalized to user's triggers, auto-reads via TTS |
| Mood Insight + Prevention | Analyzes mood patterns, generates proactive risk intervention suggestions |
| Caregiver Guidance | Generates contextual "what to say" scripts based on loved one's current state |

## ✨ Key Features

- **Multi-Modal**: Voice input (Web Speech API STT) + Voice output (TTS) + Touch (tap-based mood, one-tap crisis) + Text
- **Zero-Typing**: Every feature usable without typing — voice or single-tap interaction
- **Prevention Engine**: AI detects declining mood patterns and intervenes proactively before crisis
- **Streaming Responses**: Real-time word-by-word AI output — no loading spinners
- **Dual Persona**: Full support for both individuals in recovery AND their caregivers
- **Personalization**: User profile (triggers, "my why", support network) injected into every AI interaction

## 🛡️ Security

- API keys server-side only (never exposed to client)
- Input sanitization with prompt injection detection
- Content-Security-Policy + security headers
- Input validation on all API routes

## 🧪 Testing

```bash
npm run test    # 69 tests across 7 files — all passing
```

Tests cover: sanitization, validation, storage, insight/prevention logic, prompt construction, service layer.

## 🚀 Getting Started

```bash
npm install
echo "GEMINI_API_KEY=your_key" > .env.local
npm run dev
```

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui (Radix-based accessible components)
- **GenAI**: Google Gemini API (streaming)
- **Voice**: Web Speech API (browser-native STT/TTS)
- **Testing**: Vitest
- **Deploy**: Vercel
