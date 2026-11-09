# Roamly — Next-Gen AI Travel Itinerary & Visual Tripboard

> A complete full-stack travel-planning web application inspired by the public visual structure and capabilities of Rimigo, built with original branding, copy, sample itineraries, and verified travel intelligence.

---

## Overview

**Roamly** helps travelers discover destinations, create personalized multi-city itineraries, customize them manually or with AI, compare accommodation prices across providers, manage transparent budgets, and consult verified human travel experts.

The heart of the application is a **visual tripboard** structured into five core sections:
1. **Overview**: Daily preview cards, booking readiness checklist, stays status, and essential traveler intelligence (eSIM, temple etiquette, apps).
2. **Itinerary Workspace**: Horizontal multi-day columns with drag-and-drop reordering, compact/detailed card modes, schedule overlap detection, item locking, and interactive day & full-trip routing maps.
3. **Stays & Hotel Comparison**: Multi-provider price comparison (Agoda, Booking.com, Expedia, and Direct properties) showing transparent nightly vs total-stay costs with meal basis and cancellation terms.
4. **Explore**: Searchable activity catalogue with duration, costs, category filters, and direct "Add to Trip" scheduling with conflict feedback.
5. **Bookings & Budget**: Whole-trip vs per-person view, minor-unit calculations across currencies (USD, EUR, GBP, AUD, IDR, JPY), clear inclusions vs exclusions, and private confirmation reference recording.

---

## Visual Design & Architecture

- **Visual Theme**: Clean, production-grade light theme default (`bg-slate-50` / `bg-white`) with refined purple brand accents, high-contrast typography, interactive world map, country search, suggested destinations, 4-step workflow, and original FAQ.
- **Tripboard Workspace**: Crisp warm-neutral and white surfaces, purple active states, city-and-night navigation chips, responsive horizontal day columns (desktop) and stacked picker (mobile), and activity detail drawers.
- **AI Architecture**: Pluggable Google Gemini integration on the server using typed structured patch operations. Users cloning the repository can directly enter their Google Gemini API key right inside the app (via the automatic post-login prompt or the navbar "Gemini Key" button). If no API key is provided, Roamly seamlessly falls back to a deterministic, labelled demo AI planner that supports documented commands.
- **Interactive Mapping**: MapLibre GL with configurable tile styles and an interactive SVG/Canvas vector route fallback ensuring 100% offline and testing reliability.
- **Authentication & Security**: Instant 1-click Customer and Admin demo login, multi-role access control, and tokenized read-only public sharing that scrubs all private notes, phone numbers, and booking references.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) with TypeScript & React 18 |
| **Styling** | Tailwind CSS with brand purple palette & accessible components |
| **Database & ORM** | Prisma ORM with SQLite for zero-daemon local run + PostgreSQL schema for production |
| **AI Integration** | Google Generative AI SDK (`@google/generative-ai`) with structured JSON patches |
| **Interactive Maps** | MapLibre GL (`maplibre-gl`) + Vector Canvas Fallback |
| **Icons** | Lucide React |
| **Testing** | Vitest for domain logic & Playwright for browser user journeys |
| **Containerization** | Docker Compose with PostgreSQL 16 Alpine and Node container |

---

## Quick Start (Zero External Dependencies)

### 1. Prerequisites
- Node.js 18+ (Node 20 or 22 recommended)
- npm 9+

### 2. Installation
```bash
# Clone or navigate to the repository
cd roamly-clone

# Install dependencies
npm install
```

### 3. Database Setup & Seeding
Roamly runs out of the box with zero external database daemons using SQLite for local development:
```bash
# Initialize SQLite database schema
npx prisma db push

# Seed rich Bali, Thailand, and Japan sample data
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running with Docker Compose (PostgreSQL)

To run the complete production stack (PostgreSQL + Roamly app container):
```bash
docker compose up -d
```
The app will be available on `http://localhost:3000` connected to PostgreSQL on port 5432.

---

## Testing & Quality Assurance

Roamly includes comprehensive unit, domain, and end-to-end browser test suites:

### Unit & Domain Tests (Vitest)
Tests money calculations (minor units, exchange rates, price bases), schedule conflict detection, traveller validation, AI patch validation, and public share scrubbing:
```bash
npm test
```

### End-to-End Browser Tests (Playwright)
Executes the full central user journey in a real browser:
*discover destination → choose template → customise → edit itinerary → select stay → inspect budget → share read-only*:
```bash
npm run test:e2e
```

### Type Checking & Production Build
```bash
# TypeScript compiler check
npx tsc --noEmit

# Production Next.js build
npm run build
```

---

## Key Workflows

### 1. Interactive 4-Stage Travel Questionnaire (`/plan`)
- **Who**: Adults (18–59), Children (3–17), Infants (0–2), Elders (60+), Occasions. Enforces traveller rules (requires at least one adult or elder).
- **When**: Start and end date range selection with duration and nights calculation.
- **Where**: Multi-city selection, departure airport (IATA/City), return airport (independently editable).
- **How**: Pace (relaxed, balanced, packed), dietary preferences, and themes.
- Draft is automatically saved in `localStorage` and can be merged into an account upon login.

### 2. Contextual AI Planning & Revisions
- Open the AI Assistant from the Tripboard header.
- Try quick action prompts:
  - *"Make Day 2 more relaxed"* (replaces high-intensity items with leisure wellness buffers).
  - *"Swap for cultural cooking class"* (identifies unlocked activity and swaps with authentic workshop).
  - *"Suggest lower-cost alternatives"* (optimizes commercial excursions for scenic public trails).
  - *"Incorporate vegetarian dining"* (configures certified organic plant-based lunch reservations).
- Inspect the **Proposed Revision Diff** with line-by-line explanation and budget difference.
- Click **Accept & Apply Revision** (transactionally updates the board and stores a revision).
- Click **Undo Last AI Edit** to roll back any revision snapshot.

### 3. Multi-Provider Stay Comparison
- Switch between Bali city regions (Ubud 3N, Seminyak 2N, Uluwatu 1N).
- Compare transparent rates across Agoda, Booking.com, Expedia, and Direct Resort websites.
- Expand "Compare Provider Offers" to view room types, meal inclusions, and cancellation terms.
- Selecting an offer instantly recalibrates the trip's stay selection and updates the budget ledger.

### 4. Revocable Read-Only Sharing (`/share/[token]`)
- Click **Share** on any tripboard.
- Copies a tokenized URL (`/share/roam-...`).
- When accessed, all private notes, phone numbers, booking references, and private files are scrubbed.
- Public viewers can explore the full interactive board or click **Duplicate & Customise** to clone it into their own workspace.

### 5. Specialist Assistance & Operations Hub (`/admin`)
- Travelers can request expert human consultation via the tripboard modal enquiry form.
- Admins and travel experts can review the queue, assign specialists, draft custom quotes, and update statuses.

---

## Demo Credentials & Sandbox Logins

Click **Sign In** in the top navigation bar to instantly choose between Demo Customer and Administrator:

| Profile | Role | Capabilities |
|---|---|---|
| **Alex Morgan** | Customer | Create trips, drag-and-drop itinerary editing, AI planning, stay selection, export |
| **Elena Rostova** | Administrator | Full platform access, review inbound enquiries, manage specialist queues |

---

## License

MIT License. Designed and engineered for high-performance agentic travel workflows.

