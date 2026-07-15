import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://httpbun.com";

export const options = {
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
  const res = http.batch([
    ["GET", `${BASE_URL}/get`, null, { tags: { name: "GET /get" } }],
    ["GET", `${BASE_URL}/bytes/50`, null, { tags: { name: "GET /bytes/50" } }],
    ["GET", `${BASE_URL}/delay/0.1`, null, { tags: { name: "GET /delay/0.1" } }],
  ]);

  check(res[0], {
    "GET /get is 200": (r) => r.status === 200,
  });

  check(res[1], {
    "GET /bytes/50 is 200": (r) => r.status === 200,
    "GET /bytes/50 has body": (r) => r.body.length === 50,
  });

  check(res[2], {
    "GET /delay/0.1 is 200": (r) => r.status === 200,
  });

  sleep(1);
}
