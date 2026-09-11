import assert from "node:assert/strict";
import { test } from "node:test";
import { scoreLead } from "../lib/lead-scoring.ts";

test("an empty lead scores cold with no breakdown", () => {
  const result = scoreLead({ name: "A", company: "", email: "a@gmail.com", phone: "", message: "hi" });
  assert.equal(result.score, 0);
  assert.equal(result.tier, "cold");
  assert.equal(result.breakdown.length, 0);
});

test("a business lead with intent scores hot", () => {
  const result = scoreLead({
    name: "Thabo Mokoena",
    company: "Top Life Mechanics",
    email: "thabo@toplife.co.za",
    phone: "082 555 1234",
    message:
      "We need a quoting and booking system with invoices and a customer portal. Our budget is around R4500 per month and we want to start urgently.",
  });

  // company 15 + business domain 10 + phone 10 + detailed message 15
  // + intent keywords (capped 15) + budget mention 10 = 75 -> hot.
  assert.equal(result.score >= 70, true);
  assert.equal(result.tier, "hot");
  assert.equal(result.score, 75);
});

test("intent keywords are capped so spam cannot max the score", () => {
  const result = scoreLead({
    name: "Spam Bot",
    company: "",
    email: "bot@gmail.com",
    phone: "",
    message: "quote quote quote budget urgent app portal invoice booking website",
  });

  // Keywords (8 unique hits) capped at 15 + message depth (61 chars, 40+) 10.
  // No company, free email, no phone, no budget figure.
  assert.equal(result.score, 25);
  assert.equal(result.tier, "cold");
});

test("free email domains do not earn the business-domain points", () => {
  const gmail = scoreLead({ name: "Jane", company: "", email: "jane@gmail.com", phone: "", message: "hi" });
  const work = scoreLead({ name: "Jane", company: "", email: "jane@firm.co.za", phone: "", message: "hi" });

  assert.equal(gmail.score, 0);
  assert.equal(work.score, 10);
});

test("message depth is bucketed", () => {
  const short = scoreLead({ name: "Jane", company: "", email: "jane@gmail.com", phone: "", message: "hello there" });
  const mid = scoreLead({ name: "Jane", company: "", email: "jane@gmail.com", phone: "", message: "x".repeat(45) });
  const long = scoreLead({ name: "Jane", company: "", email: "jane@gmail.com", phone: "", message: "x".repeat(130) });

  assert.equal(short.score, 0);
  assert.equal(mid.score, 10);
  assert.equal(long.score, 15);
});
