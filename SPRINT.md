# SPRINT — Current Work Split

## Tab 1 (Kiro - this tab) — DOING NOW:
1. ✅ Sprint doc created
2. 🔄 `/login` page — role selector (Recovery vs Caregiver)
3. 🔄 Role stored in localStorage (`anchor_user_role`)
4. 🔄 Navigation updated: show role + logout button
5. 🔄 PWA: manifest.json, service worker, meta tags
6. 🔄 Replace emojis with Lucide icons (nav, buttons, mood selector, features)

## Tab 2 (Other Kiro) — YOUR TASKS:
1. Add `loading.tsx` files for each route (already doing)
2. Add `error.tsx` boundaries
3. Lint fixes
4. **After I finish:** Extract components from pages:
   - `ChatMessage.tsx` — message bubble with TTS
   - `VoiceButton.tsx` — STT toggle
   - `StreamingText.tsx` — streaming text with cursor
   - `MoodSelector.tsx` — mood grid
   - `ScriptDisplay.tsx` — script card with actions
   - `RiskBadge.tsx` — risk level badge (shared checkin/caregiver)

## Role Selector Design:
- `/login` page: two cards — "I'm in Recovery" / "I'm a Caregiver"
- Stores `anchor_user_role` = "recovery" | "caregiver" in localStorage
- Nav shows current role + "Switch Role" button
- Caregiver role: hide onboarding/checkin from nav, show caregiver dashboard
- Recovery role: hide caregiver dashboard from nav, show all recovery features
- No real auth. Just role-based view filtering.

## PWA Notes:
- `public/manifest.json` with app name, icons, theme color
- `public/sw.js` — basic service worker (cache shell)
- Meta tags in `layout.tsx`: theme-color, apple-mobile-web-app-capable, manifest link

## Icon Replacement (Lucide):
Package already installed (`lucide-react`). Replace emojis with icons:
- Navigation: MessageCircle, FileText, BarChart3, Heart, AlertTriangle
- Chat modes: Waves, AlertTriangle, BookOpen, Heart
- Mood selector: proper mood-related icons
- SOS button: Phone icon
- Feature cards: Mic, ClipboardList, Shield, Heart, Brain, Zap

## DO NOT TOUCH (my files):
- `/login/page.tsx` (creating)
- `Navigation.tsx` (modifying)
- `layout.tsx` (adding PWA meta)
- `public/manifest.json` (creating)
- `public/sw.js` (creating)
