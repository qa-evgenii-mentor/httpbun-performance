import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://httpbun.com";
const CLOUD_PROJECT_ID = Number(__ENV.K6_CLOUD_PROJECT_ID || 8104573);

export const options = {
  cloud: {
    projectID: CLOUD_PROJECT_ID,
  },
  scenarios: {
    stress: {
      executor: "ramping-vus",
      stages: [
        { duration: "1m", target: 10 },
        { duration: "2m", target: 30 },
        { duration: "2m", target: 50 },
        { duration: "1m", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<1500"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/get?scenario=stress`, {
    tags: { name: "GET /stress endpoint imitation" },
  });

  check(res, {
    "stress endpoint is 200": (r) => r.status === 200,
  });
}