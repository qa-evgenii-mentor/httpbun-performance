import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://httpbun.com";

export const options = {
  scenarios: {
    load: {
      executor: "ramping-vus",
      stages: [
        { duration: __ENV.RAMP_UP || "1m", target: Number(__ENV.TARGET_VUS || 10) },
        { duration: __ENV.HOLD || "3m", target: Number(__ENV.TARGET_VUS || 10) },
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
  const searchTerm = ["phone", "laptop", "book", "headphones"][Math.floor(Math.random() * 4)];
  const page = Math.floor(Math.random() * 5) + 1;

  const searchRes = http.get(`${BASE_URL}/get?q=${searchTerm}&page=${page}&sort=popular`, {
    tags: { name: "GET /catalog search imitation" },
  });

  check(searchRes, {
    "catalog search is 200": (r) => r.status === 200,
    "catalog search has query": (r) => r.json("args.q") === searchTerm,
  });

  sleep(Math.random() * 2);
}
