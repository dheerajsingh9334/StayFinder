import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    realistic_load: {
      executor: "constant-arrival-rate",
      rate: 10000, // requests per second
      timeUnit: "1s",
      duration: "30s",
      preAllocatedVUs: 3000,
      maxVUs: 5000,
    },
  },
};

export default function () {
  const res = http.get("http://localhost:3000/api/property");

  check(res, {
    "status is 200": (r) => r.status === 200,
  });
}
