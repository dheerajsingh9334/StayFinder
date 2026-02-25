import cron from "node-cron";
import { autoCompleteBooking } from "../utils/autocomplete";
import { cancleExpireBooking } from "../utils/booking.cron";

cron.schedule("*/5 * * * *", async () => {
  console.log("Running autoCompleteBooking cron...");
  await autoCompleteBooking();
  await cancleExpireBooking();
});

// cron.schedule("*/5 * * * *", async () => {
//   console.log("Running autoCompleteBooking cron...");
//   await cancleExpireBooking();
// });
