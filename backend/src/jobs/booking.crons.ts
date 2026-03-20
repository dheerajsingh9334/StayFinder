import cron from "node-cron";
import { autoCompleteBooking } from "../utils/autocomplete";
import { cancleExpireBooking } from "../utils/booking.cron";

if (process.env.ENABLE_CRON === "true") {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Running autoCompleteBooking cron...");
    await autoCompleteBooking();
    await cancleExpireBooking();
  });
}
