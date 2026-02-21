import { Router } from "express";
import PaymentWebhook from "../../webhooks/payment.webhook";
import { authMiddleware } from "../../middleware/auth.Middleware";
import PaymentController from "./payment.controller";
authMiddleware;
const Paymentrouter = Router();

Paymentrouter.post("/create", authMiddleware, PaymentController.createPayment);
Paymentrouter.post("/webhook", PaymentWebhook.handle);

export default Paymentrouter;
