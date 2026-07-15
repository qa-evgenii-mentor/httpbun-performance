import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://httpbun.com";

export const options = {
  vus: Number(__ENV.VUS || 5),
  duration: __ENV.DURATION || "1m",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
    checks: ["rate>0.99"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/get?resource=users`, {
    tags: { name: "GET /users imitation" },
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(1);
}
