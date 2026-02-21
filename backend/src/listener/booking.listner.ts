import { BOOKING_EVENTS } from "../event/booking.event";
import eventBus from "../event/event";

eventBus.on(BOOKING_EVENTS.CREATED, (data) => {
  console.log("payment success Event", data);
});

eventBus.on(BOOKING_EVENTS.CANCELLED, (data) => {
  console.log("payment Cancled Event", data);
});
eventBus.on(BOOKING_EVENTS.CONFIRMED, (data) => {
  console.log("payment comfirmed Event", data);
});
