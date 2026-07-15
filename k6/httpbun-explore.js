import encoding from "k6/encoding";
import http from "k6/http";
import { check, group, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://httpbun.com";

export const options = {
  vus: 2,
  duration: "1m",
  thresholds: {
    http_req_failed: ["rate<0.02"],
    checks: ["rate>0.95"],
  },
};

export default function () {
  group("payload and response shaping", () => {
    const payloadRes = http.post(`${BASE_URL}/payload`, "hello from k6", {
      headers: { "Content-Type": "text/plain" },
      tags: { name: "POST /payload" },
    });

    check(payloadRes, {
      "payload echoes raw body": (r) => r.status === 200 && r.body === "hello from k6",
      "payload keeps content type": (r) => String(r.headers["Content-Type"]).includes("text/plain"),
    });

    const mixedBody = encoding.b64encode("mixed response from httpbun");
    const mixRes = http.get(`${BASE_URL}/mix/s=201/h=x-course:k6/b64=${mixedBody}`, {
      tags: { name: "GET /mix" },
    });

    check(mixRes, {
      "mix can set status": (r) => r.status === 201,
      "mix can set headers": (r) => r.headers["X-Course"] === "k6",
      "mix can set body": (r) => r.body === "mixed response from httpbun",
    });
  });

  group("auth endpoints", () => {
    const basicRes = http.get(`${BASE_URL}/basic-auth/student/secret`, {
      auth: "basic",
      username: "student",
      password: "secret",
      tags: { name: "GET /basic-auth" },
    });

    check(basicRes, {
      "basic auth accepts valid credentials": (r) => r.status === 200,
    });

    const bearerRes = http.get(`${BASE_URL}/bearer/course-token`, {
      headers: { Authorization: "Bearer course-token" },
      tags: { name: "GET /bearer" },
    });

    check(bearerRes, {
      "bearer auth accepts valid token": (r) => r.status === 200,
    });
  });

  group("caching and redirects", () => {
    const cacheRes = http.get(`${BASE_URL}/cache/60`, {
      tags: { name: "GET /cache/60" },
    });

    check(cacheRes, {
      "cache endpoint returns 200": (r) => r.status === 200,
      "cache endpoint sets cache-control": (r) => String(r.headers["Cache-Control"]).includes("max-age=60"),
    });

    const etagRes = http.get(`${BASE_URL}/etag/course-etag`, {
      headers: { "If-None-Match": "course-etag" },
      tags: { name: "GET /etag" },
    });

    check(etagRes, {
      "etag can return not modified": (r) => r.status === 304,
    });

    const redirectRes = http.get(`${BASE_URL}/redirect/2`, {
      redirects: 2,
      tags: { name: "GET /redirect/2" },
    });

    check(redirectRes, {
      "redirect chain ends successfully": (r) => r.status === 200,
    });
  });

  sleep(1);
}
