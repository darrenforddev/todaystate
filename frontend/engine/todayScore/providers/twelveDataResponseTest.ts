import { strict as assert } from "node:assert";

import { assessTwelveDataResponse } from "./twelveDataResponse";

assert.equal(
  assessTwelveDataResponse(200, true, { values: [{ close: "100" }] }).status,
  "available",
);

assert.equal(
  assessTwelveDataResponse(401, false, {
    status: "error",
    code: 401,
    message: "This symbol is not available with your plan. Please upgrade.",
  }).status,
  "plan-restricted",
);

assert.equal(
  assessTwelveDataResponse(401, false, {
    status: "error",
    code: 401,
    message: "Invalid API key",
  }).status,
  "authentication-error",
);

assert.equal(
  assessTwelveDataResponse(429, false, {
    status: "error",
    code: 429,
    message: "API credits exhausted",
  }).status,
  "rate-limited",
);

assert.equal(
  assessTwelveDataResponse(404, false, {
    status: "error",
    code: 404,
    message: "Symbol not found",
  }).status,
  "unavailable",
);

assert.equal(
  assessTwelveDataResponse(200, true, { values: [] }).status,
  "unavailable",
);

console.log("Twelve Data response classification tests passed.");
