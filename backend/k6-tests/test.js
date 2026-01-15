import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    realistic_load: {
      executor: "constant-arrival-rate",
      rate: 500, // 50 requests per second
      timeUnit: "1s",
      duration: "30s",
      preAllocatedVUs: 20,
      maxVUs: 100,
    },
  },
};

export default function () {
  const res = http.get("http://localhost:3000/api/property");

  check(res, {
    "status is 200": (r) => r.status === 200,
  });
}
