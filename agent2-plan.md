# Agent 2 Plan — UX Overhaul

## Problem
The current UI feels like a developer demo, not a recovery app for vulnerable users:
- Cold dark theme with monospace-feeling fonts
- Text-first chat (voice should be PRIMARY)
- No proper favicon/site icon
- Not truly mobile-friendly (spacing, touch targets)
- Emojis still in some places (mood selector, crisis page)
- Overall "cold dev tool" vibe vs warm, safe, supportive

## Changes Being Made

### 1. Warm, Friendly Design System
**Font:** Switch from Geist (geometric, cold) to `Inter` or `Nunito` (rounded, warm, friendly)
**Colors:** Replace the current black/white/gray scheme with:
- Primary: warm teal/sage `#3B9B8F` (calm, healing, trust)
- Background: soft warm white `#FEFAF6` (not clinical white)
- Text: warm dark `#2D2A26` (not pure black)
- Accent: soft coral `#E88D72` (warmth, energy)
- Crisis/destructive: `#D94F4F` (clear but not harsh)
- Cards: `#FFFFFF` with subtle warm shadow
- Muted: `#8A8580` (warm gray, not cold)

**Dark mode:** Removed. Recovery apps should feel warm and safe. Dark mode feels clinical.

### 2. Voice-First Chat Redesign
Current: text input with small mic button
New layout:
```
┌─────────────────────────────┐
│    [Mode tabs: Calm|Crisis] │
│                             │
│    [Chat messages area]     │
│                             │
│  ┌─────────────────────┐   │
│  │                     │   │
│  │   🎙️ BIG MIC BTN   │   │  ← Primary action (80px circle)
│  │   "Tap to speak"   │   │
│  │                     │   │
│  └─────────────────────┘   │
│  [___text input___] [send] │  ← Secondary, collapsed
└─────────────────────────────┘
```

### 3. Proper Favicon
- Generate SVG → inline in /app/icon.svg (Next.js auto-detects)
- Apple touch icon at /apple-icon.png  
- Design: anchor symbol in teal circle, clean

### 4. Mobile-First Fixes
- Nav: bottom tab bar on mobile (not top hamburger)
- Touch targets: minimum 48px everywhere
- Padding: 16px minimum on mobile
- Font sizes: base 16px (prevents iOS zoom)
- Full-width buttons on mobile
- Mood selector: bigger tap targets (64px min)
- Crisis page: huge phone buttons (full width, 64px height)

### 5. Files Being Modified
- `src/app/layout.tsx` — font, theme
- `src/app/globals.css` — entire color palette
- `src/app/chat/page.tsx` — voice-first layout
- `src/components/Navigation.tsx` — bottom tab bar on mobile
- `src/app/icon.svg` — favicon
- `public/icons/icon.svg` — PWA icon update
- `src/app/apple-icon.png` — apple touch icon

### 6. NOT Touching (other tab's territory)
- API routes
- Service files
- Test files
- loading.tsx / error.tsx files
