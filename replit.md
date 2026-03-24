# Project Overview

A React + Vite + TypeScript frontend application, migrated from Lovable to Replit.

## Stack

- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM v6
- **Maps**: Leaflet + react-leaflet v4
- **State/Data**: TanStack Query
- **Forms**: React Hook Form + Zod

## Structure

- `src/` — all application source code
  - `pages/` — top-level route pages
  - `components/` — reusable UI components (shadcn/ui + custom)
  - `hooks/` — custom React hooks
  - `lib/` — utilities

## Running the App

The app runs with `npm run dev` on port 5000.

## Migration Notes (Lovable → Replit)

- Removed `lovable-tagger` dev dependency (Lovable-specific tool)
- Downgraded `react-leaflet` from v5 to v4.2.1 for React 18 compatibility
- Updated Vite server config: host `0.0.0.0`, port `5000` for Replit preview
