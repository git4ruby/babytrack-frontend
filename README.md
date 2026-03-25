# BabyTrack Frontend

Vue 3 SPA for the BabyTrack newborn tracking app.

## Tech Stack

- Vue 3 (Composition API + `<script setup>`)
- Vite
- Tailwind CSS v4
- Pinia (state management)
- Vue Router 4
- Axios (API client with JWT interceptors)
- Chart.js + vue-chartjs
- HeadlessUI + Heroicons
- Day.js

## Setup

```bash
npm install
npm run dev     # Dev server on http://localhost:5173
npm run build   # Production build to dist/
```

The Vite dev server proxies `/api` requests to `http://localhost:3000` (Rails API).

## Project Structure

```
src/
  api/          — Axios client + endpoint modules (auth, feedings, milkStashes, etc.)
  components/
    layout/     — AppLayout, AppSidebar, AppHeader, AppBottomNav
    ui/         — BaseModal, BaseButton, EmptyState, ToastContainer
  composables/  — useTimeSince (gap timer)
  router/       — Route definitions with auth guards
  stores/       — Pinia stores (auth, baby, feedings, milk, ui)
  views/        — Page components
```

## Pages

| Route | View | Features |
|-------|------|----------|
| `/login` | Login | JWT auth, error handling |
| `/` | Dashboard | Gap timer, today's summary, breast balance, milk inventory, upcoming vaccines, next appointment |
| `/feedings` | Feed Log | Timeline grouped by day, date nav, type filters, FeedEntryModal (bottle/breast/pump + combo), pagination, delete |
| `/analytics` | Analytics | Daily volume bar chart, feed type donut, breast balance, feeds/day trend, avg gap line chart, 7/14/30 day range |
| `/milk-storage` | Milk Storage | Inventory cards (room temp/fridge/freezer), stash list with expiry badges, use/transfer/discard with partial volume, store modal |
| `/weight` | Weight Log | Growth chart, weight table, add measurement modal, weight change tracking |
| `/vaccinations` | Vaccinations | Progress bar, upcoming/completed tabs, grouped by milestone, mark administered modal with lot/site |
| `/appointments` | Appointments | Upcoming/past sections, create/edit modal, complete/cancel actions, type badges |

## PWA

Includes `manifest.json` for "Add to Home Screen" on mobile devices.
