# ⚓ AnchorAI — Recovery & Prevention Platform

A **voice-first, multi-modal GenAI platform** for individuals navigating substance use recovery and their caregivers. AI-powered prevention, zero-typing crisis support, and personalized interventions — all in one installable PWA.

**Live:** [anchor-ai.vercel.app](https://anchor-ai.vercel.app)

---

## 🧠 GenAI Integration (Google Gemini)

Every interaction is a **real Gemini API call** with streaming — no mocked data, no hardcoded responses.

| Feature | How Gemini is Used |
|---|---|
| **Talk (Voice-First AI Companion)** | Streaming chat with profile-aware system prompts. Knows user's triggers, "why", mood history. 4 modes: Calm, Crisis, Journal, Caregiver |
| **Emergency Scripts** | Generates personalized refusal scripts from scenario + user context. Custom scenarios supported. Auto-reads aloud via TTS |
| **Crisis SOS** | Instant AI-generated grounding steps. Personalized to user's triggers. Auto-speaks immediately |
| **Daily Check-in + Prevention** | Analyzes mood patterns over time. Proactively intervenes when 3+ negative entries detected |
| **Caregiver Dashboard** | Generates structured "what to say / don't say" guidance based on loved one's current state |
| **Homepage Insight** | Personalized daily motivation pulled from user history — they don't even know AI is working |
| **Quick Journal** | User logs feelings → AI responds in one sentence + silently tracks patterns |

---

## ✨ What Makes It Different

- **Voice-First** — Big mic button as primary interaction. Type if you want, but speak by default
- **Zero-Typing in Crisis** — One tap → AI speaks grounding steps aloud in <5 seconds
- **Prevention, Not Just Reaction** — AI detects declining mood trends and intervenes before crisis
- **Genuinely Personalized** — Uses your name, your triggers, your own words ("my why") in every response
- **Dual Persona** — Role selector: Recovery or Caregiver. Different UI, same data (consent-based)
- **Installable PWA** — Add to home screen, works offline (cached shell), native-app feel
- **Multi-Language** — Hindi, Tamil, Telugu, Kannada, Malayalam support
- **Scannable AI Output** — Structured responses with emoji headers. No walls of text

---

## 🏗️ Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui (Radix-based, accessible) |
| Font | Inter (modern, readable) |
| GenAI | Google Gemini Flash (streaming) |
| Voice | Web Speech API (STT + TTS) |
| Storage | localStorage (typed wrapper) |
| Testing | Vitest (74 tests, 8 files) |
| Deploy | Vercel |
| PWA | Service Worker + Web Manifest |

---

## 🛡️ Security

- Gemini API key server-side only (`.env.local`)
- Prompt injection detection + sanitization on all inputs
- Content-Security-Policy, X-Frame-Options, Referrer-Policy headers
- Input validation (length limits, type checks) on every API route
- No `innerHTML` — React handles rendering

---

## 🧪 Testing

```bash
npm run test    # 74 tests across 8 files
```

Covers: input sanitization, prompt injection blocking, validation schemas, localStorage wrapper, prevention logic (risk detection), prompt construction, service layer (chat + script).

---

## 🚀 Getting Started

```bash
git clone https://github.com/arsxd/anchor-ai.git
cd anchor-ai
npm install
echo "GEMINI_API_KEY=your_gemini_key" > .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📱 PWA

Installable on mobile. Add to home screen for instant access during crisis moments.
- Cached shell for fast loading
- Offline-capable UI (API calls need connection)
- Native app feel with bottom tab navigation

---

## 📝 Project Structure

```
src/
  app/
    page.tsx              ← Home (personalized insight + journal)
    login/                ← Role selector (Recovery/Caregiver)
    chat/                 ← Voice-first AI companion
    scripts/              ← Emergency script generator
    checkin/              ← Daily mood check-in + prevention
    caregiver/            ← Caregiver dashboard
    crisis/               ← SOS page (instant AI grounding)
    onboarding/           ← Profile setup
    api/
      chat/route.ts       ← Gemini streaming
      script/route.ts     ← Gemini streaming
      insight/route.ts    ← Gemini (non-streaming)
      caregiver/route.ts  ← Gemini (non-streaming)
  components/             ← Shared UI components
  services/               ← Business logic (pure functions)
  lib/                    ← Types, validators, sanitizers, prompts
  __tests__/              ← Vitest test files
```

---

Built with ❤️ for PromptWars Hackathon
