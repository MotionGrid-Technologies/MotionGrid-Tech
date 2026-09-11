import assert from "node:assert/strict";
import { test } from "node:test";
import {
  generateSlotsForSastDate,
  isValidSastDateKey,
  nextBookableDateKeys,
  sastDateKey,
  validateSlot,
} from "../lib/booking-slots.ts";

// Reference instants (all math is against SAST = UTC+2, no DST).
const MON_2026_09_14_06_00_UTC = new Date("2026-09-14T06:00:00.000Z"); // Mon 08:00 SAST

test("sastDateKey maps a UTC instant to the SAST calendar day", () => {
  assert.equal(sastDateKey(new Date("2026-09-14T22:30:00.000Z")), "2026-09-15");
  assert.equal(sastDateKey(new Date("2026-09-14T21:59:00.000Z")), "2026-09-14");
});

test("isValidSastDateKey rejects malformed keys", () => {
  assert.equal(isValidSastDateKey("2026-09-14"), true);
  assert.equal(isValidSastDateKey("2026-13-01"), false);
  assert.equal(isValidSastDateKey("not-a-date"), false);
  assert.equal(isValidSastDateKey("2026-02-30"), false);
});

test("generateSlotsForSastDate skips weekends", () => {
  assert.equal(generateSlotsForSastDate("2026-09-19").length, 0); // Saturday
  assert.equal(generateSlotsForSastDate("2026-09-20").length, 0); // Sunday
});

test("generateSlotsForSastDate enforces working hours and lead time", () => {
  // Monday 2026-09-14, checking at 08:00 SAST: the 09:00 slot is 1h ahead —
  // exactly the lead time — so it is offerable; grid is 09:00..15:45.
  const slots = generateSlotsForSastDate("2026-09-14", MON_2026_09_14_06_00_UTC);
  assert.equal(slots.length, 28); // 09:00 through 15:45 inclusive
  assert.equal(slots[0], "2026-09-14T07:00:00.000Z"); // 09:00 SAST
  assert.equal(slots[slots.length - 1], "2026-09-14T13:45:00.000Z"); // 15:45 SAST

  // Checking later the same day (13:30 SAST) drops everything before 14:30.
  const later = generateSlotsForSastDate("2026-09-14", new Date("2026-09-14T11:30:00.000Z"));
  assert.equal(later[0], "2026-09-14T12:30:00.000Z"); // 14:30 SAST
});

test("validateSlot accepts an on-grid workday slot and rejects bad ones", () => {
  const now = MON_2026_09_14_06_00_UTC; // Mon 08:00 SAST

  assert.equal(validateSlot("2026-09-14T07:00:00.000Z", now), null); // Mon 09:00 SAST
  assert.equal(validateSlot("2026-09-19T07:00:00.000Z", now), "not_workday"); // Saturday
  assert.equal(validateSlot("2026-09-14T05:30:00.000Z", now), "outside_hours"); // 07:30 SAST
  assert.equal(validateSlot("2026-09-14T14:15:00.000Z", now), "outside_hours"); // 16:15 SAST
  assert.equal(validateSlot("2026-09-14T06:07:00.000Z", now), "not_on_grid"); // 08:07 SAST
  assert.equal(validateSlot("2026-12-01T07:00:00.000Z", now), "too_far"); // > 30 days
  assert.equal(validateSlot("garbage", now), "invalid");

  // Inside the working day but only 30 minutes out -> lead-time rejection.
  const midMorning = new Date("2026-09-14T08:00:00.000Z"); // Mon 10:00 SAST
  assert.equal(validateSlot("2026-09-14T08:30:00.000Z", midMorning), "too_soon"); // 10:30 SAST
});

test("nextBookableDateKeys skips weekends and returns unique keys", () => {
  const keys = nextBookableDateKeys(5, MON_2026_09_14_06_00_UTC);
  assert.equal(keys.length, 5);
  assert.equal(keys[0], "2026-09-14"); // Monday
  assert.equal(keys.includes("2026-09-19"), false); // Saturday never appears
  assert.equal(new Set(keys).size, keys.length);
});
