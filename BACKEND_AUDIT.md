# StayFinder Backend - Complete Feature & API Audit

**Generated:** March 22, 2026  
**Status:** Production-Grade with P0 Hardening Needed

---

## 📊 Database Models & Schema

### Core Models (Prisma MongoDB)

| Model                    | Purpose                          | Key Fields                                                                                                                                                                    | Status   |
| ------------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **User**                 | User accounts across all roles   | id, name, email, password, phone, role (USER/HOST/ADMIN), avatarUrl, isEmailVerified                                                                                          | Complete |
| **OTP**                  | Email/SMS verification codes     | id, code, expiresAt, userId                                                                                                                                                   | Complete |
| **Property**             | Property listings from hosts     | id, title, description, price, lat, lng, capacity, bedrooms, bathrooms, images[], amenities[], status (PENDING/ACTIVE/INACTIVE/REJECTED), averageRating, reviewCount, ownerId | Complete |
| **Booking**              | Guest bookings                   | id, startDate, endDate, totalPrice, status (PENDING_PAYMENT/PENDING/CONFIRMED/CANCELLED/COMPLETED), capacity, userId, propertyId                                              | Complete |
| **Review**               | Guest reviews on properties      | id, rating, comment, status (PUBLISHED/PENDING/HIDDEN/FLAGGED), userId, propertyId, bookingId                                                                                 | Complete |
| **Favorite**             | User's saved properties/wishlist | id, userId, propertyId (unique pair)                                                                                                                                          | Complete |
| **Message**              | DM between users                 | id, content, senderId, receiverId                                                                                                                                             | Complete |
| **PropertyAvailability** | Host blocks time/availability    | id, propertyId, startTime, endTime, isBlocked                                                                                                                                 | Complete |
| **Payment**              | Payment transactions             | id, bookingId, userId, amount, orderId, providerPaymentId, status (INITIATED/SUCCESS/FAILED/REFUNDED), provider (STRIPE/RAZORPAY), failureReason, rawWebhook                  | Complete |

**Indexes:** Property status+date, owner+status, lat+lng for geo queries. Booking-Booking and Availability-Availability relationships optimized.

---

## 🔑 Authentication & Security Module

### Auth Endpoints

**Base Path:** `/auth`

| Endpoint         | Method | Auth | Role | Purpose                    |
| ---------------- | ------ | ---- | ---- | -------------------------- |
| `/register`      | POST   | ❌   | -    | User registration          |
| `/login`         | POST   | ❌   | -    | User login, JWT issued     |
| `/otp/send`      | POST   | ❌   | -    | Send OTP via email/SMS     |
| `/otp/verify`    | POST   | ❌   | -    | Verify OTP code            |
| `/refreshToken`  | POST   | ❌   | -    | Refresh JWT token          |
| `/logout`        | POST   | ❌   | -    | Invalidate session         |
| `/me`            | GET    | ✅   | ALL  | Get logged-in user profile |
| `/updateProfile` | PATCH  | ✅   | ALL  | Update name, phone, avatar |
| `/password`      | PATCH  | ✅   | ALL  | Change password            |

**Security Features:**

- Password hashing with bcrypt
- JWT token-based auth
- OTP email verification
- Session refresh token strategy
- Role-based middleware (`authMiddleware`, `verifyRole`)

---

## 🏠 Property Management Module

### Property Endpoints

**Base Path:** `/property`

| Endpoint      | Method | Auth | Role        | Purpose                                            |
| ------------- | ------ | ---- | ----------- | -------------------------------------------------- |
| `/`           | GET    | ❌   | -           | List all active properties (paginated, searchable) |
| `/:id`        | GET    | ❌   | -           | Get single property details                        |
| `/nearby`     | GET    | ❌   | -           | Get nearby properties by lat/lng                   |
| `/create`     | POST   | ✅   | HOST        | Create new property listing                        |
| `/owner/me`   | GET    | ✅   | HOST, ADMIN | Get host's own properties                          |
| `/update/:id` | PATCH  | ✅   | HOST        | Update property details                            |
| `/delete/:id` | PATCH  | ✅   | HOST, ADMIN | Soft-delete property                               |
| `/:id/status` | PATCH  | ✅   | HOST, ADMIN | Toggle property active/inactive status             |

**Features:**

- Listings with images, amenities, geo-coordinates
- Property status workflow (PENDING → ACTIVE)
- Host-specific CRUD operations
- Admin moderation capability

---

## 🎫 Booking Management Module

### Booking Endpoints

**Base Path:** `/booking`

| Endpoint                  | Method | Auth | Role        | Purpose                                 |
| ------------------------- | ------ | ---- | ----------- | --------------------------------------- |
| `/create`                 | POST   | ✅   | USER        | Create new booking request              |
| `/my-booking`             | GET    | ✅   | USER        | Get user's bookings (filters by status) |
| `/getBooking/:propertyId` | GET    | ✅   | HOST, ADMIN | Get all bookings for a host's property  |
| `/cancle/:bookingId`      | PATCH  | ✅   | USER, HOST  | Cancel a booking                        |
| `/Complete/:bookingId`    | PATCH  | ✅   | HOST, ADMIN | Mark booking as completed               |

**Booking Flow:**

1. User creates booking → `PENDING_PAYMENT`
2. Payment processed → `CONFIRMED` or `FAILED`
3. Host/System marks complete → `COMPLETED`
4. User/Host can cancel → `CANCELLED`

**Events Triggered:**

- `booking.created` → Email notification + queue job
- `booking.confirmed` → Host notification
- `booking.cancelled` → Refund trigger (if applicable)

---

## ⭐ Reviews & Ratings Module

### Reviews Endpoints

**Base Path:** `/reviews`

| Endpoint                | Method | Auth | Role  | Purpose                            |
| ----------------------- | ------ | ---- | ----- | ---------------------------------- |
| `/add`                  | POST   | ✅   | USER  | Add review after completed booking |
| `/property/:propertyId` | GET    | ❌   | -     | Get all reviews for a property     |
| `/me`                   | GET    | ✅   | USER  | Get user's own reviews             |
| `/delete/:reviewId`     | PATCH  | ✅   | USER  | Delete user's own review           |
| `/edit/:reviewId`       | PATCH  | ✅   | USER  | Edit user's own review             |
| `/toggle/:reviewId`     | PATCH  | ✅   | ADMIN | Admin hide/show flagged reviews    |
| `/restore/:reviewId`    | PATCH  | ✅   | ADMIN | Admin restore hidden reviews       |

**Features:**

- Star ratings (1-5)
- Text comments
- Review status management (PUBLISHED, PENDING, HIDDEN, FLAGGED)
- Admin moderation
- Property avg rating auto-updated

---

## ❤️ Favorites/Wishlist Module

### Favorites Endpoints

**Base Path:** `/favorite`

| Endpoint              | Method | Auth | Role | Purpose                        |
| --------------------- | ------ | ---- | ---- | ------------------------------ |
| `/add/:propertyId`    | POST   | ✅   | USER | Add property to favorites      |
| `/my`                 | GET    | ✅   | USER | Get user's favorite properties |
| `/remove/:propertyId` | DELETE | ✅   | USER | Remove from favorites          |

**Features:**

- Individual user wishlists
- Unique constraint: `(userId, propertyId)`
- Fast lookups via indexes

---

## 💳 Payment Processing Module

### Payment Endpoints

**Base Path:** `/payment`

| Endpoint   | Method | Auth | Role | Purpose                         |
| ---------- | ------ | ---- | ---- | ------------------------------- |
| `/create`  | POST   | ✅   | USER | Initiate payment for booking    |
| `/webhook` | POST   | ❌   | -    | Razorpay/Stripe webhook handler |

**Payment Providers:**

- Razorpay (primary)
- Stripe (secondary)

**Payment Statuses:**

- `INITIATED` → Order created, awaiting user payment
- `SUCCESS` → Payment verified, booking confirmed
- `FAILED` → Payment failed, retry offered
- `REFUNDED` → Cancellation refund processed

**Features:**

- Idempotent payment creation (prevents double-charging)
- Webhook signature verification
- Raw webhook logging for audit
- Automatic booking status update on success

**Webhook Flow:**

1. User completes payment on provider
2. Provider sends webhook to `/payment/webhook`
3. Signature verified
4. Payment record updated
5. Booking status → CONFIRMED
6. Email sent to guest & host

---

## 🔍 Search Module

### Search Endpoints

**Base Path:** `/search`

| Endpoint    | Method | Auth | Role | Purpose                                                      |
| ----------- | ------ | ---- | ---- | ------------------------------------------------------------ |
| `/`         | GET    | ❌   | -    | Vector search for properties (by location, amenities, price) |
| `/aisearch` | POST   | ❌   | -    | AI-powered search using Gemini/LLM                           |

**Features:**

- Text-based property search
- AI semantic search (natural language queries)
- Pinecone vector database integration
- Google Generative AI (Gemini) integration
- Autocomplete suggestions

---

## 📅 Availability & Calendar Module

### Availability Endpoints

**Base Path:** `/availability`

| Endpoint                             | Method | Auth | Role        | Purpose                                       |
| ------------------------------------ | ------ | ---- | ----------- | --------------------------------------------- |
| `/block`                             | POST   | ✅   | HOST, ADMIN | Block time slots for maintenance/personal use |
| `/unblock/:blockId`                  | DELETE | ✅   | HOST, ADMIN | Remove block from availability                |
| `/:propertyId`                       | GET    | ✅   | HOST, ADMIN | Get all blocks for a property                 |
| `/property/:propertyId/calender`     | GET    | ❌   | -           | Calendar view of blocked/available dates      |
| `/property/:propertyId/availability` | GET    | ❌   | -           | Check if property available for booking dates |

**Features:**

- Date range blocking
- Calendar UI support
- Booking availability validation

---

## 🔔 Notifications & Messaging

### Notification Features (Internal, No Direct API Yet)

| Feature                  | Trigger           | Delivery       | Status               |
| ------------------------ | ----------------- | -------------- | -------------------- |
| **Booking Confirmation** | Payment success   | Email + In-app | ✅ Queue implemented |
| **Payment Failed**       | Payment error     | Email + In-app | ✅ Queue implemented |
| **Review Received**      | New review posted | Email          | ✅ Queue implemented |
| **Booking Cancelled**    | User/host cancels | Email          | ✅ Queue implemented |
| **OTP Code**             | /otp/send called  | Email          | ✅ Direct email      |

### Messaging (DM between users)

**Model:** `Message` - stored but no endpoints yet

---

## 🔗 Queue & Async Jobs System

### BullMQ Queue Architecture

**Queues Implemented:**

| Queue Name        | Workers           | Purpose                   | Status    |
| ----------------- | ----------------- | ------------------------- | --------- |
| **email-queue**   | email.worker.ts   | Send transactional emails | ✅ Active |
| **booking-queue** | booking.worker.ts | Booking lifecycle events  | ✅ Active |
| **payment-queue** | payment.worker.ts | Payment confirmations     | ✅ Active |
| **ai-queue**      | ai.worker.ts      | AI search index updates   | ✅ Active |

**Queue Features:**

- Redis-backed (ioredis)
- Exponential backoff on retry
- Dead-letter queue (DLQ) pattern ready
- Job persistence

**Listeners Implemented:**

| Listener                 | Event             | Action                        |
| ------------------------ | ----------------- | ----------------------------- |
| **booking.listener.ts**  | booking.created   | Enqueue email notification    |
| **email.listener.ts**    | Multiple          | Trigger email.worker          |
| **payment.listeners.ts** | payment.confirmed | Update booking status + email |

---

## 🤖 AI & Advanced Features

### AI Search Integration

**Service:** `src/utils/gemini.ts`

- Google Generative AI (Gemini) for semantic search
- Pinecone vector database for embeddings
- Autocomplete suggestions via vector similarity

### Jobs

- **ai.job.ts** - Index properties for vector search
- **booking.crons.ts** - Auto-complete expired bookings, cleanup stale data

---

## 📧 Email Service

**Service:** `src/services/email.service.ts`

- Nodemailer SMTP integration
- Template-based emails
- Queue-driven sending
- Retry mechanism

**Email Types Supported:**

- OTP verification
- Booking confirmation
- Payment receipt
- Review notification
- Host alerts

---

## 💰 Payment Service

**Service:** `src/services/razorpay.service.ts`

- Razorpay SDK integration
- Order creation
- Payment verification
- Refund handling

---

## 🛡️ Security & Middleware

### Middleware Stack

| Middleware         | Purpose                                  | Status                 |
| ------------------ | ---------------------------------------- | ---------------------- |
| `authMiddleware`   | Verify JWT token, attach user to request | ✅ Active              |
| `verifyRole`       | Check user role against allowed roles    | ✅ Active              |
| CORS               | Cross-origin request handling            | ⚠️ Needs strict config |
| Helmet             | Security headers                         | ❌ **NOT IMPLEMENTED** |
| Rate Limiting      | Prevent abuse                            | ❌ **NOT IMPLEMENTED** |
| Request Validation | Schema validation with Zod/Joi           | ⚠️ Partial             |

---

## 📊 Caching Strategy

**Service:** Redis (ioredis)
**Cache Keys Module:** `src/utils/cacheKeys.ts` (empty, needs implementation)

**Cacheable Data:**

- Property listings (30min TTL)
- Property details (1hr TTL)
- User profiles (2hr TTL)
- Reviews (30min TTL)
- Search results (5min TTL)

**Status:** ⚠️ **Integration ready, key normalization incomplete**

---

## 🔄 Data Flow Examples

### Booking → Payment → Confirmation

```
1. POST /booking/create
   → Create booking (status: PENDING_PAYMENT)
   → Emit booking.created event
   → Enqueue email notification

2. POST /payment/create
   → Create Payment record (status: INITIATED)
   → Razorpay order created
   → Return order details to frontend

3. Frontend → User pays on Razorpay

4. Razorpay webhook → /payment/webhook
   → Verify signature
   → Update Payment (status: SUCCESS)
   → Update Booking (status: CONFIRMED)
   → Emit payment.confirmed event
   → Enqueue confirmation emails (guest + host)
```

### Search Flow

```
1. GET /property?city=Mumbai&price_min=5000&price_max=20000
   → Database query with filters
   → Cache lookup (optional)

2. POST /search/aisearch { query: "beach house with pool" }
   → Gemini semantic search
   → Find embeddings in Pinecone
   → Return top K results
```

---

## 📈 Performance & Load Patterns

**Expected QPS (Queries Per Second):**

- Property list: 100+ QPS (highly cacheable)
- Search: 50+ QPS (vector search slower)
- Bookings: 10–20 QPS (write-heavy)
- Payments: 5–10 QPS (critical path)

**Bottlenecks Identified:**

1. ⚠️ No pagination implemented on list endpoints
2. ⚠️ No request rate limiting (brute force vulnerable)
3. ⚠️ Cache key normalization missing (cache misses likely)
4. ⚠️ Payment webhook not idempotent-safe (duplicate charges possible)
5. ⚠️ No global error handling (inconsistent error responses)

---

## 🚨 P0 Issues to Fix

| Issue                           | Risk        | Fix                                             |
| ------------------------------- | ----------- | ----------------------------------------------- |
| No request validation (Zod/Joi) | 🔴 High     | Add schema validation on all POST/PATCH         |
| No Helmet security headers      | 🔴 High     | Install helmet, configure CORS strictly         |
| No rate limiting                | 🔴 High     | Implement express-rate-limit                    |
| Payment webhook not idempotent  | 🔴 Critical | Add payment.providerId uniqueness check         |
| Secrets in logs                 | 🔴 High     | Remove console.log of env, tokens, URLs         |
| No global error handler         | 🔴 High     | Implement error middleware with standard schema |
| Cache keys not normalized       | 🟡 Medium   | Implement `cacheKeys.ts` utility                |
| No structured logging           | 🟡 Medium   | Add request IDs, structured JSON logs           |

---

## ✅ P1 Enhancements

- [ ] Complete payment service layer (constants, types, validators)
- [ ] Implement notification API endpoints
- [ ] Add messaging endpoints (DM)
- [ ] Implement admin dashboard endpoints for user/property management
- [ ] Add advanced filtering (amenities, ratings, availability date range)
- [ ] Implement property recommendations (ML/vector)
- [ ] Add dashboard endpoints for host analytics
- [ ] Implement refund workflow
- [ ] Add role-based dashboard endpoints

---

## 📦 Dependencies Summary

| Package                     | Version | Purpose          |
| --------------------------- | ------- | ---------------- |
| express                     | 4.22.1  | Web framework    |
| @prisma/client              | 6.19.0  | ORM, MongoDB     |
| bullmq                      | 5.71.0  | Queue system     |
| ioredis                     | 5.10.0  | Redis client     |
| jsonwebtoken                | 9.0.3   | Auth tokens      |
| bcrypt                      | 6.0.0   | Password hashing |
| nodemailer                  | 8.0.1   | Email sending    |
| razorpay                    | 2.9.6   | Payment provider |
| @google/generative-ai       | 0.24.1  | Gemini AI        |
| @pinecone-database/pinecone | 7.1.0   | Vector DB        |
| axios                       | 1.13.5  | HTTP client      |

---

## 🎯 Deployment Status

**Environment Variables Required:**

```
DATABASE_URL=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
REDIS_URL=redis://...
RAZORPAY_KEY_ID=...
RAZORPAY_SECRET=...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
GEMINI_API_KEY=...
PINECONE_API_KEY=...
```

**Deployment Model:**

- ✅ Production: Separate API + Worker processes
- ✅ Local: `npm run all` (API + workers together)
- ⚠️ CI/CD: Not yet automated
- ⚠️ Containerization: Dockerfile missing

---

## 📋 Checklist for Frontend Integration

- ✅ Auth module complete (register, login, OTP, profile)
- ✅ Property CRUD complete
- ✅ Booking lifecycle functional
- ✅ Reviews functional
- ✅ Favorites functional
- ✅ Payment webhook ready
- ✅ Email queue ready
- ⚠️ Notification endpoints missing (only queue-based)
- ⚠️ Messaging endpoints missing
- ⚠️ Admin dashboard endpoints incomplete
- ⚠️ Host analytics endpoints missing
- ❌ Rate limiting not enforced (frontend must retry gracefully)
- ❌ Payment idempotency not guaranteed (handle duplicates in frontend)

---

**Last Updated:** March 22, 2026  
**Audit Status:** ✅ COMPLETE
