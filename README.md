# WeShare

A campus ride-sharing web application for students to find rides, offer empty seats, request to join trips, manage approvals, and build trust through driver ratings.

> **Project history.** WeShare began as a team project for UIUC CS 222 in Fall 2025. The original course-hosted project was not retained long-term; this repository was recovered from a surviving teammate copy. In 2026, Yanran Lu revived the project by repairing incomplete flows, restructuring the backend and database model, removing embedded credentials, and redesigning the interface. Original Git history is intentionally preserved so the team's earlier contributions remain attributable.

## What the revival changes

The surviving snapshot contained useful product ideas and partial implementations, but several flows were disconnected or unsafe. The revival focuses on turning that prototype into a coherent portfolio project:

- Replaces hard-coded PostgreSQL credentials with environment configuration.
- Adds token-based authentication and authenticated API middleware.
- Fixes ride creation so the driver comes from the authenticated user rather than an undefined `user_id`.
- Replaces malformed dynamic ride-update logic with a smaller, ownership-aware API surface.
- Integrates ride requests, approval/rejection, seat counts, My Trips, and ratings under one Express server.
- Replaces the draft database notes with valid PostgreSQL schema and indexes.
- Rebuilds the React interface around a consistent responsive design system.
- Adds a read-only demo fallback for ride discovery so the interface remains explorable when the local API is not running.

## Product flow

1. Create an account or sign in.
2. Search upcoming rides by origin, destination, date, and seat count.
3. Open a ride and request a seat.
4. Drivers offer rides and manage incoming requests.
5. Approved rides appear in **My Trips**.
6. Approved passengers can rate a driver after a ride.

## Stack

**Frontend:** React 18, React Router, Axios, custom responsive CSS  
**Backend:** Node.js, Express, JWT authentication, bcrypt  
**Database:** PostgreSQL

## Repository layout

```text
UI/                    React frontend
  src/components/      Shared navigation and ride cards
  src/pages/           Home, search, ride detail, auth, create ride, trips
server/                Express API
  db/schema.sql        PostgreSQL schema
  middleware/auth.js   JWT authentication
  routes/              Users, rides, requests, trips, ratings
Project Proposal.pdf   Original course proposal retained for project history
```

## Local setup

### 1. Database

Create a PostgreSQL database, then run:

```bash
psql "$DATABASE_URL" -f server/db/schema.sql
```

### 2. API

```bash
cd server
cp .env.example .env
npm install
npm start
```

Set `DATABASE_URL` and a strong `JWT_SECRET` in `.env` before using accounts.

### 3. Web app

In another terminal:

```bash
cd UI
npm install
npm start
```

The frontend runs at `http://localhost:3000` and proxies API requests to `http://localhost:4000`.

## Security note

The recovered snapshot contained a local development database password in source code. The revival removes that credential from the working tree and uses environment variables instead. If the old password was ever reused for another service, it should be rotated independently.

## Attribution

The original Fall 2025 CS 222 project was collaborative. Historical commits are preserved rather than rewritten so Git can retain authentic authorship information. The 2026 restoration and modernization is a later continuation, not a claim that the original team authored the new work.

This repository is shared as a portfolio project, not as an official course solution or template for current students.
