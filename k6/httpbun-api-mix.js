import http from "k6/http";
import { check, group, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://httpbun.com";

export const options = {
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
    const query = ["phone", "laptop", "book", "headphones"][Math.floor(Math.random() * 4)];
    const page = Math.floor(Math.random() * 5) + 1;

    const getRes = http.get(`${BASE_URL}/get?q=${query}&page=${page}&sort=popular`, {
      tags: { name: "GET /catalog search imitation" },
    });

    check(getRes, {
      "catalog search is 200": (r) => r.status === 200,
      "catalog search has query": (r) => r.json("args.q") === query,
    });

    const headersRes = http.get(`${BASE_URL}/headers`, {
      headers: { Authorization: "Bearer training-token", "x-course": "load-testing" },
      tags: { name: "GET /headers auth context" },
    });

    check(headersRes, {
      "auth context is 200": (r) => r.status === 200,
      "custom header is echoed": (r) => r.json("headers.X-Course") === "load-testing",
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
      "order source is echoed": (r) => r.json("json.source") === "ad-campaign",
    });
  });

  group("controlled latency and errors", () => {
    const delayRes = http.get(`${BASE_URL}/delay/0.2`, {
      tags: { name: "GET /delay/0.2" },
    });

    check(delayRes, {
      "GET /delay/0.2 is 200": (r) => r.status === 200,
    });

    const statusRes = http.get(`${BASE_URL}/status/200,200,200,500`, {
      tags: { name: "GET /status/200,500" },
    });

    check(statusRes, {
      "status endpoint returns expected code": (r) => [200, 500].includes(r.status),
    });
  });

  sleep(Math.random() * 2);
}
