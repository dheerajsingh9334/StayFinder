# StayFinder Project Overview

## 1. What This Project Is

StayFinder is a full-stack property rental and booking platform. It allows users to:

- Sign up/login and verify accounts
- Discover and search properties
- View property details and nearby places
- Manage availability
- Create bookings and track booking history
- Make payments (Razorpay integration)
- Add favorites
- Leave reviews
- Access role-based dashboards (User, Host, Admin)

The project is split into:

- Backend API and workers in `backend/`
- Frontend web app in `frontend/`

## 2. High-Level Architecture

### Backend

- Node.js + Express API server
- TypeScript codebase
- Prisma ORM with MongoDB datasource
- Redis + BullMQ for async jobs and worker processing
- Event/listener pattern for decoupled domain actions (booking, payment, email, auth)
- Cron jobs for booking-related automation
- Multi-process runtime using Node cluster for web server scaling

### Frontend

- React 19 + TypeScript single-page app
- Vite build tooling (Rolldown-backed Vite package)
- React Router for routing
- Redux Toolkit for global app/auth state
- TanStack Query for server-state caching and data fetching
- Axios-based API service layer

## 3. Tech Stack and Libraries

### Backend stack (from backend/package.json)

- Runtime and framework:
  - Node.js
  - Express
  - TypeScript
- Database and ORM:
  - MongoDB
  - Prisma (`@prisma/client`, `prisma`)
- Caching and queues:
  - Redis (`ioredis`)
  - BullMQ
- Auth and security:
  - JWT (`jsonwebtoken`)
  - Password hashing (`bcrypt`)
  - CORS, cookie-parser, compression
- Background jobs and scheduling:
  - node-cron
  - Dedicated worker processes
- Communication and notifications:
  - Nodemailer
- Payment:
  - Razorpay SDK (`razorpay`, `razorpay-node-typescript`)
- AI/search related packages:
  - OpenAI SDK
  - Google Generative AI SDK
  - Pinecone SDK
- Utility:
  - dotenv
  - axios

### Frontend stack (from frontend/package.json)

- Core:
  - React 19
  - TypeScript
  - Vite
- Routing:
  - React Router DOM
- State and data:
  - Redux Toolkit + React Redux
  - TanStack React Query
- API and validation:
  - Axios
  - Zod
- UI and UX:
  - Framer Motion
  - Lucide React icons
  - React Hot Toast
  - React Loading Indicators
  - React Calendar + MUI Date Pickers
- Maps/location:
  - React Leaflet
- Utilities:
  - Day.js
  - UUID
- Lint/build tooling:
  - ESLint + TypeScript ESLint

## 4. Backend Module Coverage

Main API route prefixes are wired in `backend/src/routes/main.routes.ts`:

- `/auth`
- `/property`
- `/availability`
- `/booking`
- `/reviews`
- `/favorite`
- `/search`
- `/payment`

Supporting backend architecture in `backend/src/` includes:

- `modules/`: feature modules (auth, booking, payment, property, etc.)
- `event/` + `listener/`: domain event publishing/subscribing
- `queue/` + `workers/`: async job queues and processors
- `jobs/` + `utils/booking.cron.ts`: scheduled operations
- `middleware/`: auth and request middleware
- `services/`: integrations such as email and payment providers
- `webhooks/`: payment webhook handling
- `cache/` + `config/redis.ts`: cache and Redis config

Runtime startup:

- `backend/cluster.ts`: forks web workers based on CPU or `WEB_CONCURRENCY`
- `backend/server.ts`: API setup, CORS policy, Redis ping check, queue bootstrap, health route

## 5. Data Layer (Prisma + MongoDB)

The Prisma datasource uses MongoDB (`provider = "mongodb"`).
Core models include:

- `User`
- `Otp`
- `Property`
- `PropertyAvailability`
- `Booking`
- `Payment`
- `Review`
- `Favorite`
- `Message`

Important enums include:

- `Role`: USER, HOST, ADMIN
- `BookingStatus`
- `PaymentStatus`
- `PaymentProvider`
- `PropertyStatus`
- `ReviewStatus`

This schema supports the complete rental lifecycle: account, listing, availability, booking, payment, reviews, and favorites.

## 6. Frontend Feature Coverage

Routing in `frontend/src/app/routes.tsx` shows major user flows:

- Authentication: login/register/forgot-password/OTP/change-password
- Profile: view/update
- Properties: listing, detail, create, owner properties, nearby
- Search: dedicated search page
- Booking: create booking, booking details, my bookings
- Availability calendar views
- Reviews: list/create
- Favorites and notifications
- Role-gated dashboards: host/admin routes

Frontend architecture highlights:

- `frontend/src/features/`: feature-level Redux slices and logic
- `frontend/src/services/`: API service modules per domain
- `frontend/src/hooks/`: reusable hooks (auth, debounce, infinite scroll, live location)
- `frontend/src/components/`: UI building blocks and domain components
- `frontend/src/store/index.ts`: app store
- `frontend/src/app/provider.tsx`: Redux + QueryClient providers

## 7. Background Processing and Reliability

The backend runs multi-process and multi-worker patterns:

- Web process scaling via Node cluster
- Separate workers for:
  - email
  - booking
  - payment
  - AI
- Queue-backed async handling with BullMQ + Redis
- Recovery/bootstrap queue job in server startup

This design keeps API responses fast while heavy or delayed tasks execute in workers.

## 8. Testing and Performance

Backend includes k6 test scripts under:

- `backend/k6-tests/booking.test.js`
- `backend/k6-tests/test.js`

These indicate load/performance testing coverage for API workflows.

## 9. Deployment Signals in Repo

- Frontend has `vercel.json`, indicating Vercel-oriented deployment setup.
- Backend CORS includes localhost and deployed domain patterns (`*.vercel.app`, `*.onrender.com`), indicating web + API deployment across those hosts.

## 10. How to Run (Based on Existing Scripts)

### Backend

From `backend/`:

- Development: `npm run dev`
- Build: `npm run build`
- Production start (web + workers): `npm run start`

### Frontend

From `frontend/`:

- Development: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`

## 11. Quick Summary

StayFinder is a production-style full-stack booking platform using React + TypeScript on the frontend and Express + TypeScript + Prisma + MongoDB on the backend, with Redis/BullMQ workers, payment integration, role-based access, and performance testing support.
