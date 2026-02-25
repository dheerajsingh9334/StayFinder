import { paymentServices } from "../../services/payment.service";
import type {
  CreatepaymentPayload,
  CreatePaymentResponse,
} from "./payment.types";

export const CreatePaymentApi = async (
  data: CreatepaymentPayload,
): Promise<CreatePaymentResponse> => {
  const res = await paymentServices.createPayment(data);
  return res.data;
};
