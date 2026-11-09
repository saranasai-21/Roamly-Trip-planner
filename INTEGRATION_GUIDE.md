# Roamly Provider Integration & Deployment Guide

This guide details the integration boundaries in Roamly, distinguishing **live configured integrations** from **demo adapters and labelled fixture fallbacks**. It also explains how to connect production external services.

---

## 1. Matrix of Integrations vs Demo Adapters

| Capability | Configured Mode | Fallback / Demo Adapter | How to Switch to Production |
|---|---|---|---|
| **AI Itinerary Assistant** | Google Gemini API (`@google/generative-ai`) | Deterministic Rule-Based Demo Planner | Supply `GEMINI_API_KEY` and optional `GEMINI_MODEL` |
| **Interactive Map** | MapLibre GL (`maplibre-gl`) with vector tile layers | Interactive SVG/Canvas Vector Map | Supply custom tile URL in `NEXT_PUBLIC_MAPLIBRE_STYLE` |
| **Authentication** | Demo Customer / Admin Mode | Instant 1-Click Role Access | Connect NextAuth, Clerk, or enterprise SSO in `src/lib/auth.ts` |
| **Hotel Price Comparison** | Multi-Provider Aggregation Adapter | Labelled Seeded Offer Fixtures (Agoda, Booking, Direct) | Connect affiliate API or GDS aggregator in `StaysTab` |
| **Booking & Payments** | Adapter Boundary with status tracking | Labelled Sandbox Flow with Manual Reference Entry | Connect Stripe or travel provider API |
| **Travel Expert Contact** | Trip-linked Specialist Queue | Seeded Specialist Desk & Enquiry Review | Connect SendGrid, Resend, or CRM webhook |

---

## 2. Google Gemini AI Integration

### Environment Variables
```env
GEMINI_API_KEY="your-google-gemini-api-key"
GEMINI_MODEL="gemini-1.5-flash"  # or gemini-2.0-flash
```

### Server-Side Implementation
Implemented in `src/lib/gemini.ts`.
- The API key is kept strictly on the server and is never exposed to the client.
- The model is instructed using `responseMimeType: "application/json"` and enforced via schema constraints.
- When `GEMINI_API_KEY` is empty, `runDeterministicDemoPlanner()` is invoked instead. It produces labelled demo output while protecting locked items.

---

## 3. MapLibre GL Map Integration

### Environment Variable
```env
NEXT_PUBLIC_MAPLIBRE_STYLE="https://demotiles.maplibre.org/style.json"
# Or a custom vector tile provider like MapTiler:
# NEXT_PUBLIC_MAPLIBRE_STYLE="https://api.maptiler.com/maps/streets-v2/style.json?key=YOUR_KEY"
```

### Graceful Fallback Architecture
Implemented in `src/components/map/TripMap.tsx`.
- First attempts WebGL canvas initialization via dynamic `import('maplibre-gl')`.
- If WebGL is unavailable (e.g. headless CI environments, software rendering, or network blocked tile provider), the component automatically falls back to an interactive SVG route map that renders marker pins, route paths, and tooltips.

---

## 4. Pluggable Phone OTP Authentication

### Environment Variables
```env
DEMO_OTP_CODE="123456"
NEXT_PUBLIC_DEMO_MODE="true"
```

### Provider Interface (`src/lib/auth.ts`)
```typescript
export interface OtpProvider {
  name: string;
  isDemo: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (phone: string, code: string) => Promise<{ success: boolean; message: string }>;
}
```
To plug in Twilio or AWS SNS, implement `OtpProvider` and return it in `getOtpProvider()`.

---

## 5. Multi-Provider Hotel Offers

In `src/components/tripboard/StaysTab.tsx`, properties display multiple offers from distinct providers (Agoda, Booking.com, Expedia, and Direct properties).
- Offers include room type, meal basis, cancellation terms, taxes and fees, and nightly vs total-stay amounts.
- Price comparisons are strictly like-for-like.
- External booking links open in a new tab with an explicit notice that clicking does not automatically record the stay as booked.

---

## 6. Production Deployment Steps

### Docker Deployment
```bash
# Build and launch with PostgreSQL
docker compose up -d --build

# Run migrations
docker compose exec app npx prisma db push
docker compose exec app npx tsx prisma/seed.ts
```

### Vercel / Cloud Deployment
1. Set `DATABASE_URL` to your production PostgreSQL connection string.
2. In `package.json` build step, Prisma runs `prisma generate && next build`.
3. Provide `GEMINI_API_KEY` in your hosting provider's environment variables.

