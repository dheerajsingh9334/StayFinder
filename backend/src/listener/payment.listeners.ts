import eventBus from "../event/event";

eventBus.on("PAYMENT_SUCCESS", (data) => {
  console.log("Payment success event", data);
});

eventBus.on("PAYMENT_FAILED", (data) => {
  console.log("Payment failed event", data);
});
