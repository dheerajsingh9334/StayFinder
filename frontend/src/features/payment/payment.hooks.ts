import { useMutation } from "@tanstack/react-query";
import type {
  CreatepaymentPayload,
  CreatePaymentResponse,
} from "./payment.types";
import { CreatePaymentApi } from "./payment.api";

export const useCreatePayment = () => {
  return useMutation<CreatePaymentResponse, Error, CreatepaymentPayload>({
    mutationFn: CreatePaymentApi,
  });
};
