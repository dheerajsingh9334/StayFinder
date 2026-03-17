import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    heavy_parallel: {
      executor: "constant-arrival-rate",
      rate: 1000,
      timeUnit: "1s",
      duration: "30s",
      preAllocatedVUs: 1500,
      maxVUs: 6000,
    },
  },
};

export default function () {
  const responses = http.batch([
    ["GET", "https://stayfinder-o92q.onrender.com/api/property"],
    [
      "GET",
      "https://stayfinder-o92q.onrender.com/api/property/693f33eff2ac5a4e889c4d00",
    ],
    [
      "GET",
      "https://stayfinder-o92q.onrender.com/api/property/nearby?lat=28.61&lng=77.23",
    ],
  ]);

  check(responses[0], { "list ok": (r) => r.status === 200 });
  check(responses[1], { "single ok": (r) => r.status === 200 });
  check(responses[2], { "nearby ok": (r) => r.status === 200 });
}
