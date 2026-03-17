import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 20, // 20 concurrent users
  duration: "10s", // run for 10 seconds
};

const URL = "http://localhost:3000/api/booking/create";

const payload = JSON.stringify({
  propertyId: "694b33565e3ab757a95ce064",
  startDate: "2026-03-25",
  endDate: "2026-03-26",
  capacity: 1,
});

const params = {
  headers: {
    "Content-Type": "application/json",
    Cookie:
      "accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWIyODdiZWIzNTYwNWIzMWM2NDhhYTciLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc3Mzc4NzIwNCwiZXhwIjoxNzczNzg4MTA0fQ.sIK1ovGqEnrNCbJPbKkdgyXL_A0hHqvceJfWOATpmRI",
  },
};

export default function () {
  const res = http.post(URL, payload, params);

  check(res, {
    "status is 201 or 429": (r) => r.status === 201 || r.status === 429,
  });

  sleep(1);
}
