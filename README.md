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
    ui/         — ToastContainer, shared UI components
  composables/  — useTimeSince (gap timer)
  router/       — Route definitions with auth guards
  stores/       — Pinia stores (auth, baby, feedings, milk, ui)
  views/        — Page components (Dashboard, Feedings, MilkStorage, etc.)
```

## Pages

| Route | View | Status |
|-------|------|--------|
| `/login` | Login | Working |
| `/` | Dashboard | Working (gap timer, summary, milk inventory) |
| `/feedings` | Feed Log | Placeholder |
| `/analytics` | Analytics | Placeholder |
| `/milk-storage` | Milk Storage | Placeholder |
| `/weight` | Weight Log | Placeholder |
| `/vaccinations` | Vaccinations | Placeholder |
| `/appointments` | Appointments | Placeholder |
