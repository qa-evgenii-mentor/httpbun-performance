import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://httpbun.com";
const CLOUD_PROJECT_ID = Number(__ENV.K6_CLOUD_PROJECT_ID || 8104573);

export const options = {
  cloud: {
    projectID: CLOUD_PROJECT_ID,
  },
  scenarios: {
    spike: {
      executor: "ramping-vus",
      stages: [
        { duration: "30s", target: 5 },
        { duration: "20s", target: 40 },
        { duration: "1m", target: 40 },
        { duration: "20s", target: 5 },
        { duration: "30s", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.08"],
    http_req_duration: ["p(95)<1500"],
    checks: ["rate>0.90"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/get?campaign=flash-sale`, {
    tags: { name: "GET /campaign landing imitation" },
  });

  check(res, {
    "campaign endpoint is 200": (r) => r.status === 200,
    "campaign param is echoed": (r) => r.json("args.campaign") === "flash-sale",
  });

  sleep(1);
}
