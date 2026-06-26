# Project knowledge

This file gives Freebuff context about your project: goals, commands, conventions, and gotchas.

## Overview

**Eburon BE Data** — a Belgium Government Data Assistant (AI Studio applet). Users can ask questions about Belgian business registration, taxes, residence procedures, VAT filings, etc. Answers come from Gemini AI + official Belgian government sources (CBE/KBO, MyMinfin, CSAM, Statbel, etc.).

Key directories:
- `server.ts` — Express server (API routes + Vite middleware)
- `src/App.tsx` — Main React app (state, auth, session management)
- `src/components/` — UI components (ChatFeed, Header, Sidebar, InputComposer, Modals)
- `src/lib/firebase.ts` — Firebase Auth + Firestore helpers
- `src/data/officialRegistry.ts` — Hardcoded official sources, entities, services, datasets + suggested questions
- `src/types.ts` — Shared TypeScript types

## Commands

- `npm install` — Install dependencies
- `npm run dev` — Start dev server (Express + Vite HMR via `tsx server.ts`)
- `npm run build` — Build for production (Vite frontend + esbuild server bundle -> `dist/`)
- `npm start` — Run production server
- `npm run lint` — TypeScript check (`tsc --noEmit`)
- `npm run clean` — Remove `dist/` and `server.js`

## Architecture

- **Stack:** React 19, Vite 6, Express, Tailwind CSS v4, Firebase Auth + Firestore, Gemini AI API (@google/genai)
- **Data flow:** User message -> `POST /api/chat` -> Gemini AI (gemini-3.1-flash-lite or gemini-3.1-pro-preview) -> structured JSON response -> rendered in ChatFeed
- **Auth:** Firebase Auth (Google SSO). Chat sessions/messages persisted to Firestore under `chatSessions` and `chatMessages` collections.
- **Modals:** PhotoAnalyzer, Registry (sources/branches/services/datasets), KnowledgeGraph, AdminDashboard
- **Models:** gemini-3.1-flash-lite (default, low thinking) and gemini-3.1-pro-preview (high thinking toggle) — hardcoded server-side only, no model names exposed in frontend

## Conventions

- **Styling:** Tailwind CSS v4 (no `tailwind.config.js` needed; uses `@import "tailwindcss"` in CSS)
- **Path alias:** `@/` maps to project root (configured in tsconfig + vite.config)
- **No test framework** configured yet
- **Language selector:** EN / NL / FR / DE (mapped to English/Dutch/French/German in API call)
- **No mock data:** All responses come from Gemini API. If API key is missing, server returns proper 503 error.
- **Image analysis:** `POST /api/analyze-image` accepts base64 image + optional prompt
- **Logo:** Uses `https://eburon.ai/icon-eburon.svg` for branding

## Gotchas

- **GEMINI_API_KEY** must be set in `.env` (or injected by AI Studio runtime). Currently configured with the project key.
- **Firebase Firestore** uses a custom database ID (`ai-studio-eburonbelgiumdat-d057b707-c3dd-46e9-ad32-98f00a101b34`) — don't use the default database.
- **HMR** is disabled when `DISABLE_HMR=true` (set by AI Studio agent mode). File watching is also disabled to save CPU during agent edits.
- **todo.md** previously specified: no mock data (done), use logo from https://eburon.ai/icon-eburon.svg (done), short title "Eburon BE Data" (done), whitelist gemini models server-side and hide from frontend (done).
- **Firestore rules** require authentication for `chatSessions` and `chatMessages` (userId must match auth UID). `officialSources` is publicly readable.
- **TypeScript:** noEmit mode (Vite/esbuild handle compilation). `experimentalDecorators` and `useDefineForClassFields: false` are set.
