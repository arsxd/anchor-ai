# Agent 1 Plan — Caregiver Timeline + Code Quality

## What I'm Doing
Enhancing the caregiver page to show a real-time timeline of patient activity — making caregivers feel connected to their loved one's journey.

## Changes Being Made

### 1. Caregiver Timeline (rewrite /caregiver page)
Show a chronological feed of:
- Mood check-ins (emoji + timestamp + AI insight)
- Risk level changes
- Crisis events (when /crisis page was visited)
- Progress milestones

This reads from localStorage (same data the patient creates) and displays as a timeline card feed.

### 2. Caregiver page gets AI-generated "current status" summary
- One-line AI summary: "Alex is feeling [mood]. Trend is [trend]. Risk: [level]."
- Generated on page load from mood history

### 3. Files Being Modified
- `src/app/caregiver/page.tsx` — rewrite with timeline view
- NOT touching: API routes, services, tests, design/CSS (agent2 territory)

### 4. NOT Touching (agent2's territory)
- globals.css / colors / fonts
- Navigation component (bottom bar)
- Chat page layout
- Layout.tsx
