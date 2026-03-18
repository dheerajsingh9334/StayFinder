import { paymentServices } from "../../services/payment.service";
import type {
  CreatepaymentPayload,
  CreatePaymentResponse,
} from "./payment.types";

export const CreatePaymentApi = async (
  data: CreatepaymentPayload,
): Promise<CreatePaymentResponse> => {
  try {
    const res = await paymentServices.createPayment(data);
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.msg || "Payment request failed");
  }
};
