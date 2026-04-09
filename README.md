# StayFinder

StayFinder is a full-stack property rental and booking platform with role-based access (User, Host, Admin), booking lifecycle management, payment integration, background workers, and a modern React frontend.

## Table of Contents

- [Project Scope](#project-scope)
- [Repository Structure](#repository-structure)
- [Architecture](#architecture)
- [Backend](#backend)
- [Frontend](#frontend)
- [Database Schema Overview](#database-schema-overview)
- [Background Jobs and Workers](#background-jobs-and-workers)
- [API Feature Areas](#api-feature-areas)
- [Frontend Feature Areas](#frontend-feature-areas)
- [Tech Stack](#tech-stack)
- [Setup and Run](#setup-and-run)
- [Testing and Performance](#testing-and-performance)
- [Deployment Notes](#deployment-notes)
- [Current Capabilities Summary](#current-capabilities-summary)

## Project Scope

StayFinder supports the complete property booking workflow:

- Authentication and account verification (OTP flow)
- Property discovery, search, and detail views
- Availability management
- Booking creation and tracking
- Online payment flow integration
- Favorites management
- Review and rating system
- Role-based dashboard access and route protection

## Repository Structure

This project is organized as two applications inside one repository:

- `backend/`: API server, database layer, queues, workers, event listeners
- `frontend/`: React web application, routing, state management, service layer

Top-level folders:

- `backend/`
- `frontend/`

## Architecture

### Backend Architecture

The backend is a TypeScript Node.js API built on Express, with:

- Prisma as ORM
- MongoDB as datasource
- Redis for caching/queue backing
- BullMQ for background processing
- Event/listener pattern for domain workflows
- Node cluster-based process scaling for web server workers

Runtime flow:

1. Server boots and loads environment config.
2. Database and Redis connections initialize.
3. Express middleware and CORS rules are applied.
4. API routes are mounted under `/api`.
5. Queue and workers process async tasks (email, booking, payment, AI).

### Frontend Architecture

The frontend is a React 19 + TypeScript SPA that uses:

- React Router for navigation
- Redux Toolkit for app/auth state
- TanStack Query for async server state and caching
- Service-layer API modules for domain endpoints
- Route guards for authentication, verification, and role checks

## Backend

### Key Backend Directories

- `backend/src/modules/`: domain modules (auth, booking, payment, property, etc.)
- `backend/src/routes/`: route aggregation and mount points
- `backend/src/middleware/`: auth and request middleware
- `backend/src/services/`: integration services (email, payment)
- `backend/src/event/`: event definitions and emitters
- `backend/src/listener/`: event consumers/listeners
- `backend/src/queue/`: queue producers/config
- `backend/src/workers/`: queue worker processors
- `backend/src/jobs/`: scheduled job definitions
- `backend/src/webhooks/`: external webhook handlers
- `backend/src/config/`: config (Redis, etc.)
- `backend/prisma/`: schema and seed logic

### Entry Files

- `backend/cluster.ts`: cluster process orchestration and worker forking
- `backend/server.ts`: express app bootstrap, middleware, CORS, health check, route mount

## Frontend

### Key Frontend Directories

- `frontend/src/app/`: app shell, providers, route config
- `frontend/src/pages/`: route-level pages
- `frontend/src/components/`: reusable and domain UI components
- `frontend/src/features/`: feature-level state and logic
- `frontend/src/services/`: API client service modules
- `frontend/src/store/`: Redux store setup
- `frontend/src/hooks/`: reusable custom hooks
- `frontend/src/utils/`: utility helpers and validators

### Frontend Route Behavior (Observed)

- Public auth routes (`/login`, `/register`, password recovery, OTP)
- Protected account/profile routes
- Property browsing + details + host property management
- Booking and booking detail routes
- Availability calendar route
- Reviews, favorites, notifications
- Host/Admin role-protected dashboards

## Database Schema Overview

Prisma datasource is MongoDB.

Main models:

- `User`
- `Otp`
- `Property`
- `PropertyAvailability`
- `Booking`
- `Payment`
- `Review`
- `Favorite`
- `Message`

Important enums:

- `Role`: `USER`, `HOST`, `ADMIN`
- `BookingStatus`
- `PaymentStatus`
- `PaymentProvider`
- `PropertyStatus`
- `ReviewStatus`

This schema models identity, listings, availability slots, transactions, social feedback, and user preferences.

## Background Jobs and Workers

StayFinder uses queue-based async processing with dedicated workers:

- Email worker
- Booking worker
- Payment worker
- AI worker

Benefits:

- Keeps API responses responsive
- Isolates heavy/slow tasks from request cycle
- Improves reliability of retryable operations

## API Feature Areas

The backend route aggregator exposes these feature groups under `/api`:

- `/auth`
- `/property`
- `/availability`
- `/booking`
- `/reviews`
- `/favorite`
- `/search`
- `/payment`

## Frontend Feature Areas

Based on page and route setup, frontend supports:

- Auth and account lifecycle
- Search and property exploration
- Host property creation/management
- Booking lifecycle
- Reviews and ratings
- Favorites and notifications
- Host and admin dashboards

## Tech Stack

### Backend Dependencies (Core)

- Node.js, Express, TypeScript
- Prisma + MongoDB
- Redis (`ioredis`) + BullMQ
- JWT + bcrypt + cookie-parser + CORS + compression
- Nodemailer
- Razorpay SDK
- node-cron
- dotenv, axios
- AI/semantic tooling packages (OpenAI, Google Generative AI, Pinecone)

### Frontend Dependencies (Core)

- React 19, TypeScript, Vite
- React Router DOM
- Redux Toolkit + React Redux
- TanStack React Query
- Axios + Zod
- Framer Motion
- React Leaflet
- React Hot Toast
- MUI Date Pickers + React Calendar
- Lucide icons

## Setup and Run

## Prerequisites

- Node.js (LTS recommended)
- npm
- MongoDB instance
- Redis instance

## 1. Install Dependencies

From project root:

```bash
npm install
```

From backend:

```bash
cd backend
npm install
```

From frontend:

```bash
cd frontend
npm install
```

## 2. Configure Environment

Create environment files for backend and frontend as needed.
Backend uses variables such as:

- `DATABASE_URL`
- `PORT`
- `CORS_ORIGINS`
- `WEB_CONCURRENCY`
- Provider/API keys used by auth, payment, mail, redis, and AI integrations

## 3. Backend Commands

From `backend/`:

```bash
npm run dev
```

Starts backend in watch mode.

```bash
npm run build
```

Compiles TypeScript.

```bash
npm run start
```

Runs production-style process set (web + workers).

## 4. Frontend Commands

From `frontend/`:

```bash
npm run dev
```

Starts Vite dev server.

```bash
npm run build
```

Builds frontend for production.

```bash
npm run preview
```

Previews production build locally.

## Testing and Performance

Backend includes k6 performance test scripts in:

- `backend/k6-tests/booking.test.js`
- `backend/k6-tests/test.js`

These can be used to load-test selected API workflows.

## Deployment Notes

Observed repository signals indicate:

- Frontend deployment configuration via `frontend/vercel.json`
- Backend CORS patterns already consider local + hosted domains
- Multi-worker backend setup is ready for process-based scaling

## Current Capabilities Summary

StayFinder already includes:

- Production-style full-stack architecture
- Role-based access and guarded routes
- Booking and payment pipeline
- Async worker and queue infrastructure
- Event/listener-driven domain behavior
- Search, favorites, reviews, notifications flows
- Frontend state + query caching strategy

For onboarding new contributors, this README provides the full project map and technical baseline for development, debugging, and deployment.
