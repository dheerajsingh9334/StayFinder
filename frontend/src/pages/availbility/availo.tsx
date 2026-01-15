// Perfect. Ab seedha **final solution** batata hoon — no theory, no circles.
// Tumhara goal clear hai: **calendar me capacity bacha hua dikhana**, **owner blocks respect karna**, **cron ka correct use**.
// Yeh raha **production-grade solution**. 🧠🚀

// ---

// ## ✅ FINAL SOLUTION (clean, scalable, interview-safe)

// ### ❌ Jo **NAHI** karna

// * Booking confirm pe availability block mat banao
// * Capacity full hone pe DB me “lock” mat store karo
// * Cron se daily availability rewrite mat karo

// Yeh sab derived state ko truth banata hai.

// ---

// ## ✅ Jo **KARNA HAI** (step-by-step)

// ---

// ## 1️⃣ Availability = **Owner intent only**

// Availability table sirf yeh store kare:

// * `propertyId`
// * `startTime`
// * `endTime`
// * `reason` (VACATION, MAINTENANCE)

// No capacity logic here.
// No system auto-blocks here.

// Tumhara existing controller **almost perfect** hai. Bas:

// * overlap validation add karo
// * unblock me ownership check add karo

// ---

// ## 2️⃣ Booking = **Capacity consumption**

// Booking table:

// * `startDate`
// * `endDate`
// * `capacity`
// * `status`

// Booking confirm hone pe:

// * Sirf booking status change
// * Availability table untouched

// Tum yeh already kar rahe ho ✅

// ---

// ## 3️⃣ ⭐ KEY PART: Availability Summary API (THIS SOLVES EVERYTHING)

// ### New endpoint

// ```
// GET /property/:id/availability-summary?start=2026-02-01&end=2026-02-10
// ```

// ### Yeh API kya karegi

// Read-only calculation.
// Kuch bhi DB me write nahi karegi.

// ---

// ### Summary API logic (clear flow)

// #### Step A: Property fetch

// * capacity
// * status

// #### Step B: Manual blocks check

// Availability table se overlapping ranges nikalo.

// Agar date blocked → ❌ unavailable

// ---

// #### Step C: Booking aggregation

// Booking table se:

// * CONFIRMED bookings
// * overlapping ranges
// * per-date capacity sum

// ---

// #### Step D: Per-date status decide

// Har date ke liye:

// | Condition       | UI State      |
// | --------------- | ------------- |
// | owner blocked   | ❌ Unavailable |
// | remaining = 0   | ❌ Sold out    |
// | remaining < max | ⚠️ Limited    |
// | remaining = max | ✅ Available   |

// **Yeh calculation runtime pe hogi.
// DB me store nahi hogi.**

// ---

// ## 4️⃣ Cron job ka sahi use

// Cron sirf yeh kare:

// ### ✅ Valid cron jobs

// * Auto-complete bookings
// * Expire PENDING bookings
// * Cleanup old system data

// ### ❌ Invalid cron job

// * “Capacity full → availability block”
// * “Daily availability rewrite”

// Cron = janitor, not decision engine.

// ---

// ## 5️⃣ Frontend flow (simple & clean)

// Frontend:

// * Calendar UI → availability-summary API
// * Booking create → booking API
// * Booking fail → “Sold out” / “Limited” message

// No frontend hacks.
// No manual reload.
// No hidden state.

// ---

// ## 6️⃣ One-liner architecture summary (interview gold)

// > Availability represents owner intent.
// > Bookings consume capacity.
// > Calendar state is derived at runtime, never stored.

// ---

// ## 🔥 Final verdict

// Tumhara **idea galat nahi tha**,
// tum bas **derived data ko persist karne ja rahe the**.

// Yeh solution:

// * Scale safe hai
// * Payment-ready hai
// * Multi-room compatible hai
// * Railway / Airbnb / Booking.com logic ke aligned hai

// Ab tum iske upar:

// * Payments
// * Cancellation policies
// * Surge pricing
// * Notifications

// sab confidently bana sakte ho.

// ---

// Aur last ritual 😄
// **Did you solve any DSA question today?**
