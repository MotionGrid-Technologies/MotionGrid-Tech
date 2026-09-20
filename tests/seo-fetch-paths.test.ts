import assert from "node:assert/strict";
import { test } from "node:test";
import { isSameOriginPath, mapInBatches } from "../lib/seo-fetch-paths.ts";

const TRUSTED_ORIGIN = "https://motiongrid.co.za";

test("accepts only same-origin paths", () => {
  assert.equal(isSameOriginPath("/about", TRUSTED_ORIGIN), true);
  assert.equal(isSameOriginPath("/blog?page=2", TRUSTED_ORIGIN), true);
  assert.equal(isSameOriginPath("https://motiongrid.co.za/about", TRUSTED_ORIGIN), false);
  assert.equal(isSameOriginPath("//evil.example/about", TRUSTED_ORIGIN), false);
  assert.equal(isSameOriginPath("/\\evil.example/about", TRUSTED_ORIGIN), false);
  assert.equal(isSameOriginPath("not-a-path", TRUSTED_ORIGIN), false);
});

test("maps in fixed-size batches while preserving order", async () => {
  let active = 0;
  let maxActive = 0;

  const results = await mapInBatches([1, 2, 3, 4, 5, 6, 7], 3, async (value) => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    await new Promise((resolve) => setTimeout(resolve, 5));
    active -= 1;
    return value * 2;
  });

  assert.deepEqual(results, [2, 4, 6, 8, 10, 12, 14]);
  assert.equal(maxActive, 3);
});
