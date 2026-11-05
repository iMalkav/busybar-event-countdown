import assert from "node:assert/strict";
import test from "node:test";
import schema from "../src/appmeta/settings.json" with { type: "json" };
import { AppModel } from "../src/model.ts";
import { schemaDefaults, type Settings } from "../src/lib.ts";
const NOW = 1700000000000;
const make = (values: Settings = {}, saved: Settings = {}, now = NOW) =>
  new AppModel({ ...schemaDefaults(schema.fields), ...values }, saved, now);

test("invalid calendar dates are not normalized silently", () => {
  assert.ok(Number.isNaN(make({ date: "2026-02-30" }).target));
});
test("deadline signals once and persists the acknowledgement", () => {
  const a = make({ date: "2030-01-01", time: "00:00", utc_offset: 0 });
  a.tick(a.target);
  a.tick(a.target + 1000);
  assert.equal(a.effects.length, 1);
  const b = make(
    { date: "2030-01-01", time: "00:00", utc_offset: 0 },
    a.save(),
  );
  b.tick(b.target + 1000);
  assert.equal(b.effects.length, 0);
});
