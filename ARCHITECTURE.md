# Roamly Architecture Document

This document describes the technical architecture, system design, data flow, and security mechanisms of **Roamly**, a complete travel planning platform inspired by the visual tripboard architecture of Rimigo.

---

## 1. System Overview

Roamly is built with Next.js 14 (App Router) as a modular monolith. It couples server components for fast, SEO-friendly page delivery with interactive client components for real-time visual tripboard manipulation, drag-and-drop schedule editing, multi-provider price comparison, and contextual AI adjustments.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│  Marketing (Dark/Purple) │ Questionnaire │ Visual Tripboard  │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│       App Router (SSR)       ││       Route Handlers        │
│  - /                         ││  - /api/trips               │
│  - /destinations/[slug]      ││  - /api/trips/[id]/items    │
│  - /templates/[slug]         ││  - /api/trips/[id]/stays    │
│  - /trips/[id]               ││  - /api/trips/[id]/ai       │
│  - /share/[token] (Scrubbed) ││  - /api/auth/otp/*          │
└──────────────┬───────────────┘└─────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Domain Services                         │
│  Money/Currency Engine │ Schedule Engine │ Gemini AI Client │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Prisma Data Access Layer                    │
│   SQLite (Zero-daemon local/tests) │ PostgreSQL (Docker)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Core Domain Models

The database schema defined in `prisma/schema.prisma` models 24 entities:

1. **User**: Authentication, contact info, and roles (`customer`, `expert`, `admin`).
2. **TravellerPreferences**: Stored party makeup (adults, children, infants, elders), occasion, pace, dietary preferences, and interests.
3. **Destination**: Primary country/region profile with best months, weather notes, and contextual visa requirements with verification sources.
4. **City**: Multi-city regional clusters (e.g. Ubud, Seminyak, Uluwatu) with default night recommendations and geographic coordinates.
5. **Airport**: IATA codes, names, coordinates, and associated regional cities.
6. **Activity**: Curated activities with categories (culture, food, nature, adventure, entertainment), durations, costs in minor units, highlights, and practical notes.
7. **Hotel & HotelOffer**: Property information and multiple provider offers (Agoda, Booking.com, Expedia, Direct) with room types, meal basis, cancellation policies, nightly and total stay prices.
8. **Trip & TripDay & ItineraryItem**: The central hierarchical schedule structure with types (`activity`, `meal`, `flight`, `transfer`, `stay`, `free_time`), timing, duration, price basis, lock flags (`isLocked`), and ordering index.
9. **StaySelection**: Chosen accommodation per city linked to trip, updating trip budget totals.
10. **Booking & Expense**: Booking lifecycle tracker (`planned`, `shortlisted`, `enquiry_sent`, `awaiting_confirmation`, `booked`, `cancelled`) and private confirmation reference recording.
11. **TripRevision**: Snapshots of complete trip state supporting transactional rollback and undo.
12. **ShareToken**: Opaque, revocable tokens for public read-only sharing with automatic data scrubbing.
13. **ExpertEnquiry & ExpertQuote**: Trip-linked consultation requests, status tracking, and specialist package quotes.
14. **Creator & TripTemplate**: Curated ready-made itineraries with creator profiles, highlight pills, and preview snapshots.

---

## 3. Visual Tripboard Architecture

The Tripboard (`/trips/[id]`) is an interactive workspace featuring 5 persistent views:

```
┌─────────────────────────────────────────────────────────────────┐
│ TripboardHeader: Destination • Dates • Travelers • Route Chips  │
│ [Overview] [Itinerary] [Stays] [Explore] [Bookings & Budget]    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   OverviewTab   │     │  ItineraryTab   │     │    StaysTab     │
│ - Booking check │     │ - Day columns   │     │ - Multi-provider│
│ - Metric cards  │     │ - Drag & Drop   │     │   comparison    │
│ - Day timeline  │     │ - Item drawers  │     │ - Nightly vs    │
│ - Essentials    │     │ - Conflict alert│     │   total stay    │
│ - Expert CTA    │     │ - MapLibre map  │     │ - Offer drawer  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
        ┌─────────────────┐             ┌─────────────────┐
        │   ExploreTab    │             │    BudgetTab    │
        │ - Search/filter │             │ - Whole vs per  │
        │ - Add to day    │             │   person toggle │
        │ - Duplicate det.│             │ - Multi-currency│
        │ - Activity info │             │ - In/exclusions │
        └─────────────────┘             └─────────────────┘
```

---

## 4. AI Planning & Editing Pipeline

Roamly uses a strict 6-stage structured AI pipeline:

1. **Context Assembly**: The server constructs a typed `TripPlannerContext` containing destination facts, date bounds, traveler counts, and current schedule with items marked `isLocked`.
2. **Schema-Constrained Generation**: The prompt requires the model to output a strictly typed JSON object matching `AIPatchPlan` with specific patch operations (`add_item`, `remove_item`, `update_item`).
3. **Safety Validation**:
   - The server validates that locked items (`isLocked = true`) are **never** removed or altered.
   - Operations referencing non-existent IDs are discarded.
4. **Structured Preview Diff**: The user is shown the proposed revision diff, reasoning, and estimated cost impact before any changes are committed.
5. **Transactional Application**: Upon acceptance, the previous trip state is serialized to `TripRevision.snapshotJson`, and operations are applied within a single transaction.
6. **Instant Rollback**: Users can click **Undo** at any time to restore the exact previous snapshot.

If `GEMINI_API_KEY` is absent or the API is unreachable, Roamly seamlessly falls back to a deterministic, labelled demo AI planner that responds to documented prompts (*make day relaxed*, *swap activity*, *cheaper alternatives*, *vegetarian dining*).

---

## 5. Security & Privacy Model

- **Read-Only Public Sharing**: Tokens generated via `/api/trips/[id]/share` serve scrubbed views at `/share/[token]`. Private traveler notes, phone numbers, email addresses, booking confirmation codes, and payment notes are strictly stripped server-side before delivery.
- **Access Control**: Mutations (`PATCH`, `DELETE`) require trip ownership or administrative privileges.
- **Pluggable OTP**: In local sandbox mode, SMS dispatch is simulated with explicit demo indicators (`123456`). Production deployment requires an active provider adapter.
