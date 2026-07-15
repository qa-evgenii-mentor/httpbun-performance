import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://httpbun.com";
const CLOUD_PROJECT_ID = Number(__ENV.K6_CLOUD_PROJECT_ID || 8104573);
const VUS = Number(__ENV.VUS || 5);

export const options = {
  cloud: {
    projectID: CLOUD_PROJECT_ID,
  },
  vus: VUS,
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
