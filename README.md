# Faculty Recruitment System

Modern Next.js 14 (App Router) recruitment platform backed by **local MongoDB**.

## Prerequisites

1. Node.js 18+
2. MongoDB running locally

## MongoDB

Default connection string:

- `mongodb://localhost:27017/recruitment_db`

## Environment Variables

The project includes `.env.example` and `.env.local`.

If you need to recreate it:

```bash
cp .env.example .env.local
```

Key variables:

- `NEXTAUTH_SECRET` (required)
- `NEXTAUTH_URL` (required in production: set to your public site URL, e.g. `https://recruitment.example.edu`)
- `MONGODB_URI` (optional; defaults to `mongodb://localhost:27017/recruitment_db`)
- `NEXT_PUBLIC_APP_URL` (optional; public base URL for links)
- `JUDGE0_API_URL` / `JUDGE0_API_KEY` (optional; automated grading for coding questions fails gracefully if unset)

## Install & Run

```bash
npm install
npm run seed
npm run dev -p 3000
```

Open:

- http://localhost:3000

## Production build

The app uses Next.js `output: "standalone"` for a minimal server bundle.

```bash
npm run build
```

Run the production server (after build):

```bash
npm run start
```

For container or custom hosting with the standalone output, copy `public` and `.next/static` next to `.next/standalone` as described in the [Next.js standalone deployment docs](https://nextjs.org/docs/app/building-your-application/deploying#nodejs-server), then start `node server.js` from the standalone folder.

## Seed Data (Development)

`npm run seed` creates sample users and positions.

Login credentials:

- Admin: `admin@example.com` / `Admin123!`
- Committee: `committee@example.com` / `Committee123!`
- Assessor: `assessor@example.com` / `Assessor123!`
- Candidate: `candidate@example.com` / `Candidate123!`

## Current build scope

- Authentication (register/login, password reset)
- Public landing, about, how-it-works, and position listings/detail
- Role-based dashboards: **candidate**, **assessor**, **committee**, **admin**
- Applications (multi-step apply, status, admin/committee views)
- Assessment templates, invitations, timed assessments, Judge0-backed coding items (when configured)
- Committee reviews and hiring decisions; admin users, positions, audit logs, analytics
- File upload and notifications APIs

