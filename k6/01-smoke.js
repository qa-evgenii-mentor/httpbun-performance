import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://httpbun.com";

export const options = {
  vus: 1,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/get`, {
    tags: { name: "GET /get" },
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(1);
}
