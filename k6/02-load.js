import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://httpbun.com";
const CLOUD_PROJECT_ID = Number(__ENV.K6_CLOUD_PROJECT_ID || 8104573);
const SEARCH_TERMS = ["phone", "laptop", "book", "headphones"];
const TARGET_VUS = Number(__ENV.TARGET_VUS || 10);

export const options = {
  cloud: {
    projectID: CLOUD_PROJECT_ID,
  },
  scenarios: {
    load: {
      executor: "ramping-vus",
      stages: [
        { duration: __ENV.RAMP_UP || "1m", target: TARGET_VUS },
        { duration: __ENV.HOLD || "3m", target: TARGET_VUS },
        { duration: __ENV.RAMP_DOWN || "1m", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.03"],
    http_req_duration: ["p(95)<900"],
    checks: ["rate>0.95"],
  },
};

export default function () {
  const searchTerm = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
  const page = Math.floor(Math.random() * 5) + 1;

  const searchRes = http.get(`${BASE_URL}/get?q=${searchTerm}&page=${page}&sort=popular`, {
    tags: { name: "GET /catalog search imitation" },
  });

  check(searchRes, {
    "catalog search is 200": (r) => r.status === 200,
  });

  sleep(Math.random() * 2);
}
