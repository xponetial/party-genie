import { expect, test } from "@playwright/test";

// ─── 1. Security Headers ────────────────────────────────────────────────────

test.describe("security headers", () => {
  test("HTML pages include required security headers", async ({ page }) => {
    const response = await page.goto("/");
    expect(response).toBeTruthy();

    const headers = response!.headers();

    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBeTruthy();
    expect(headers["permissions-policy"]).toBeTruthy();
    expect(headers["strict-transport-security"]).toMatch(/max-age=/);
  });

  test("CSP blocks framing and restricts object-src", async ({ page }) => {
    const response = await page.goto("/");
    expect(response).toBeTruthy();

    const csp = response!.headers()["content-security-policy"];
    expect(csp).toBeTruthy();
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
  });

  test("API routes include security headers", async ({ request }) => {
    // Hit a known public API endpoint and check headers are present
    const response = await request.post("/api/rsvp", {
      data: { slug: "hdr-test", guestToken: "t", status: "confirmed", plusOneCount: 0 },
    });

    const headers = response.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
  });
});

// ─── 2. Affiliate Click — Open Redirect Domain Allowlist ────────────────────

test.describe("affiliate click redirect", () => {
  const BASE_PARAMS = {
    eventId: "74bde7c8-48a2-43b0-95e7-8c69181b7a50",
    itemId: "74bde7c8-48a2-43b0-95e7-8c69181b7a50",
  };

  test("blocks redirect to non-allowlist domain", async ({ request }) => {
    const response = await request.get("/api/affiliate/click", {
      params: { ...BASE_PARAMS, target: "https://evil-phishing.com/steal-creds" },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toMatch(/not an allowed affiliate domain/i);
  });

  test("blocks javascript: protocol redirect", async ({ request }) => {
    const response = await request.get("/api/affiliate/click", {
      params: { ...BASE_PARAMS, target: "javascript:alert(1)" },
    });

    expect(response.status()).toBe(400);
  });

  test("blocks data: URI redirect", async ({ request }) => {
    const response = await request.get("/api/affiliate/click", {
      params: { ...BASE_PARAMS, target: "data:text/html,<script>alert(1)</script>" },
    });

    expect(response.status()).toBe(400);
  });

  test("blocks redirect to allowlist subdomain bypass attempt", async ({ request }) => {
    // e.g. amazon.com.evil.com — hostname after stripping www. is amazon.com.evil.com
    const response = await request.get("/api/affiliate/click", {
      params: { ...BASE_PARAMS, target: "https://amazon.com.evil.com/s?k=balloons" },
    });

    expect(response.status()).toBe(400);
  });

  test("accepts redirect to allowlisted Amazon domain", async ({ request }) => {
    // Playwright follows redirects — a 307 to amazon.com will resolve to amazon.com's page.
    // We verify the request does NOT return a 400 (i.e., it was accepted by the route).
    const response = await request.get("/api/affiliate/click", {
      params: { ...BASE_PARAMS, target: "https://www.amazon.com/s?k=party+balloons" },
    });

    // Route accepts it (redirect or Amazon response) — must not be a 400 rejection
    expect(response.status()).not.toBe(400);
  });
});

// ─── 3. Contact API — Rate Limiting ─────────────────────────────────────────

test.describe("contact API rate limiting", () => {
  // Use a unique IP per test run so rate limit state from prior runs doesn't bleed in
  const testIp = `203.0.113.${(Date.now() % 190) + 10}`;

  test("rate limits contact submissions after 5 attempts from the same IP", async ({ request }) => {
    const headers = { "x-forwarded-for": testIp };

    // First 5 requests hit rate limit check then fail at Turnstile (400) — that's expected.
    for (let i = 0; i < 5; i++) {
      const response = await request.post("/api/contact", {
        headers,
        data: {
          name: "Test",
          email: "test@example.com",
          category: "general",
          subject: "Test subject",
          message: "Test message here for length",
          turnstileToken: "test-token",
        },
      });
      // Either Turnstile rejects (400) or rate limit allows through — just not 429 yet
      expect(response.status()).not.toBe(429);
    }

    // 6th request from same IP should be rate limited
    const limitedResponse = await request.post("/api/contact", {
      headers,
      data: {
        name: "Test",
        email: "test@example.com",
        category: "general",
        subject: "Test subject",
        message: "Test message here for length",
        turnstileToken: "test-token",
      },
    });

    expect(limitedResponse.status()).toBe(429);
    expect(limitedResponse.headers()["retry-after"]).toBeTruthy();

    const body = await limitedResponse.json();
    expect(body.error).toMatch(/too many submissions/i);
  });
});

// ─── 4. Contact API — Input Validation ──────────────────────────────────────

test.describe("contact API input validation", () => {
  test("rejects missing required fields", async ({ request }) => {
    const response = await request.post("/api/contact", {
      data: {},
    });
    expect(response.status()).toBe(400);
  });

  test("rejects invalid email", async ({ request }) => {
    const response = await request.post("/api/contact", {
      data: {
        name: "Test",
        email: "not-an-email",
        category: "general",
        subject: "Test",
        message: "Test message here for length",
        turnstileToken: "token",
      },
    });
    expect(response.status()).toBe(400);
  });

  test("rejects invalid category enum", async ({ request }) => {
    const response = await request.post("/api/contact", {
      data: {
        name: "Test",
        email: "test@example.com",
        category: "hacked",
        subject: "Test",
        message: "Test message here for length",
        turnstileToken: "token",
      },
    });
    expect(response.status()).toBe(400);
  });
});

// ─── 5. RSVP API — Rate Limiting (verifies Upstash-backed limiter works) ────

test.describe("RSVP API rate limiting", () => {
  // Dedicated IP range to avoid colliding with existing api-validation.spec.ts test
  const testIp = `203.0.113.${(Date.now() % 190) + 200}`;

  test("rate limits public RSVP after 10 attempts from the same IP", async ({ request }) => {
    const headers = { "x-forwarded-for": testIp };

    for (let attempt = 0; attempt < 10; attempt++) {
      await request.post("/api/rsvp", {
        headers,
        data: { slug: "security-test-rsvp", guestToken: "tok", status: "confirmed", plusOneCount: 0 },
      });
    }

    const limitedResponse = await request.post("/api/rsvp", {
      headers,
      data: { slug: "security-test-rsvp", guestToken: "tok", status: "confirmed", plusOneCount: 0 },
    });

    expect(limitedResponse.status()).toBe(429);
    expect(limitedResponse.headers()["retry-after"]).toBeTruthy();

    const body = await limitedResponse.json();
    expect(body.ok).toBe(false);
    expect(body.message).toMatch(/too many rsvp attempts/i);
  });
});

// ─── 6. Auth — Protected Routes Redirect Unauthenticated Users ──────────────

test.describe("auth route protection", () => {
  const protectedPaths = ["/dashboard", "/events/new", "/admin"];

  for (const path of protectedPaths) {
    test(`${path} redirects to login when unauthenticated`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});

// ─── 7. Stripe Webhook — Unimplemented Returns 501 ──────────────────────────

test("Stripe webhook returns 501 until payments are implemented", async ({ request }) => {
  const response = await request.post("/api/webhooks/stripe", {
    data: {},
  });

  expect(response.status()).toBe(501);
  const body = await response.json();
  expect(body.ok).toBe(false);
});
