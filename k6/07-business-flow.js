import http from "k6/http";
import { check, group, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://httpbun.com";
const CLOUD_PROJECT_ID = Number(__ENV.K6_CLOUD_PROJECT_ID || 8104573);
const SEARCH_TERMS = ["phone", "laptop", "book", "headphones"];

export const options = {
  cloud: {
    projectID: CLOUD_PROJECT_ID,
  },
  scenarios: {
    warmup: {
      executor: "ramping-vus",
      stages: [
        { duration: "30s", target: 5 },
        { duration: "1m", target: 10 },
        { duration: "30s", target: 0 },
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
  group("catalog search", () => {
    const query = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
    const page = Math.floor(Math.random() * 5) + 1;

    const getRes = http.get(`${BASE_URL}/get?q=${query}&page=${page}&sort=popular`, {
      tags: { name: "GET /catalog search imitation" },
    });

    check(getRes, {
      "catalog search is 200": (r) => r.status === 200,
    });
  });

  group("create order imitation", () => {
    const payload = JSON.stringify({
      userId: Math.floor(Math.random() * 10000),
      productId: Math.floor(Math.random() * 1000),
      quantity: 1,
      source: "ad-campaign",
    });

    const postRes = http.post(`${BASE_URL}/post`, payload, {
      headers: { "Content-Type": "application/json" },
      tags: { name: "POST /orders imitation" },
    });

    check(postRes, {
      "create order is 200": (r) => r.status === 200,
    });
  });

  group("slow endpoint", () => {
    const delayRes = http.get(`${BASE_URL}/delay/0.2`, {
      tags: { name: "GET /delay/0.2" },
    });

    check(delayRes, {
      "GET /delay/0.2 is 200": (r) => r.status === 200,
    });
  });

  sleep(Math.random() * 2);
}
