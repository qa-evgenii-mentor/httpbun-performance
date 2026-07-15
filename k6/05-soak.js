import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://httpbun.com";
const CLOUD_PROJECT_ID = Number(__ENV.K6_CLOUD_PROJECT_ID || 8104573);
const VUS = Number(__ENV.VUS || 5);

export const options = {
  cloud: {
    projectID: CLOUD_PROJECT_ID,
  },
  scenarios: {
    soak: {
      executor: "constant-vus",
      vus: VUS,
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
