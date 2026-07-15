import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://httpbun.com";

export const options = {
  scenarios: {
    soak: {
      executor: "constant-vus",
      vus: Number(__ENV.VUS || 5),
      duration: __ENV.DURATION || "10m",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.03"],
    http_req_duration: ["p(95)<1000"],
    checks: ["rate>0.95"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/delay/0.1`, {
    tags: { name: "GET /stable endpoint imitation" },
  });

  check(res, {
    "stable endpoint is 200": (r) => r.status === 200,
  });

  sleep(2);
}
