import { strict as assert } from "node:assert";

import {
  quoteToFinancialScale,
  validateMarketValues,
} from "./unitValidation";

assert.equal(quoteToFinancialScale("GBX", "GBP"), 0.01);
assert.equal(quoteToFinancialScale("GBP", "GBP"), 1);
assert.equal(quoteToFinancialScale("USD", "GBP"), undefined);

const mislabeledLondonPence = validateMarketValues({
  quoteCurrency: "GBP",
  financialCurrency: "GBP",
  exchangeMic: "XLON",
  symbol: "BT.A:LSE",
  latestClose: 200,
  sharesOutstanding: 10_000,
  reportedMarketCap: 20_000,
  reportedEnterpriseValue: 30_000,
  totalDebt: 12_000,
  totalCash: 2_000,
});

assert.equal(mislabeledLondonPence.status, "normalised");
assert.equal(mislabeledLondonPence.quoteToFinancialScale, 0.01);
assert.equal(mislabeledLondonPence.latestPriceInFinancialCurrency, 2);
assert.equal(mislabeledLondonPence.marketCap, 20_000);
assert.equal(mislabeledLondonPence.enterpriseValue, 30_000);
assert.match(mislabeledLondonPence.marketCapMessage, /reconciled uniquely/);
assert.match(mislabeledLondonPence.marketCapMessage, /scale 0.01/);

const sameNumbersWithoutLondonEvidence = validateMarketValues({
  quoteCurrency: "GBP",
  financialCurrency: "GBP",
  exchangeMic: "XNYS",
  latestClose: 200,
  sharesOutstanding: 10_000,
  reportedMarketCap: 20_000,
  reportedEnterpriseValue: 30_000,
  totalDebt: 12_000,
  totalCash: 2_000,
});

assert.equal(sameNumbersWithoutLondonEvidence.status, "rejected");
assert.equal(sameNumbersWithoutLondonEvidence.marketCap, undefined);

const ambiguousLondonUnits = validateMarketValues({
  quoteCurrency: "GBP",
  financialCurrency: "GBP",
  exchangeMic: "XLON",
  latestClose: 200,
  sharesOutstanding: 10_000,
  reportedMarketCap: 2_000_000,
  reportedEnterpriseValue: 2_010_000,
  totalDebt: 12_000,
  totalCash: 2_000,
});

assert.equal(ambiguousLondonUnits.status, "rejected");
assert.equal(ambiguousLondonUnits.marketCap, undefined);
assert.match(ambiguousLondonUnits.marketCapMessage, /ambiguous/);

const alreadySterling = validateMarketValues({
  quoteCurrency: "GBX",
  financialCurrency: "GBP",
  latestClose: 200,
  sharesOutstanding: 10_000,
  reportedMarketCap: 20_000,
  reportedEnterpriseValue: 30_000,
  totalDebt: 12_000,
  totalCash: 2_000,
});

assert.equal(alreadySterling.status, "validated");
assert.equal(alreadySterling.marketCap, 20_000);
assert.equal(alreadySterling.enterpriseValue, 30_000);

const penceInflated = validateMarketValues({
  quoteCurrency: "GBX",
  financialCurrency: "GBP",
  latestClose: 200,
  sharesOutstanding: 10_000,
  reportedMarketCap: 2_000_000,
  reportedEnterpriseValue: 2_010_000,
  totalDebt: 12_000,
  totalCash: 2_000,
});

assert.equal(penceInflated.status, "normalised");
assert.equal(penceInflated.marketCap, 20_000);
assert.equal(penceInflated.enterpriseValue, 30_000);
assert.match(penceInflated.marketCapMessage, /multiplied by 0.01/);
assert.match(penceInflated.enterpriseValueMessage, /replacing its quote-unit/);

const irreconcilable = validateMarketValues({
  quoteCurrency: "GBX",
  financialCurrency: "GBP",
  latestClose: 200,
  sharesOutstanding: 10_000,
  reportedMarketCap: 700_000,
  reportedEnterpriseValue: 710_000,
  totalDebt: 12_000,
  totalCash: 2_000,
});

assert.equal(irreconcilable.status, "rejected");
assert.equal(irreconcilable.marketCap, undefined);
assert.equal(irreconcilable.enterpriseValue, undefined);

console.log("TodayScore unit validation tests passed.");
