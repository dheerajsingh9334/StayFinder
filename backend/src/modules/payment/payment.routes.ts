import { Router } from "express";
import PaymentWebhook from "../../webhooks/payment.webhook";
import { authMiddleware } from "../../middleware/auth.Middleware";
import PaymentController from "./payment.controller";

const Paymentrouter = Router();

Paymentrouter.post("/create", authMiddleware, PaymentController.createPayment as any);
Paymentrouter.post("/webhook", PaymentWebhook.handle);
Paymentrouter.get("/my-history", authMiddleware, PaymentController.getMyPayments as any);

export default Paymentrouter;

