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
assert.equal(mislabeledLondonPence.diagnostics.londonListing, true);
assert.equal(mislabeledLondonPence.diagnostics.latestClose, 200);
assert.equal(mislabeledLondonPence.diagnostics.sharesOutstanding, 10_000);
assert.equal(mislabeledLondonPence.diagnostics.reportedMarketCap, 20_000);
assert.deepEqual(
  mislabeledLondonPence.diagnostics.candidates.map((candidate) => candidate.scale),
  [1, 0.01],
);

const declaredCandidate = mislabeledLondonPence.diagnostics.candidates[0];
const penceCandidate = mislabeledLondonPence.diagnostics.candidates[1];

assert.equal(declaredCandidate.latestPriceInFinancialCurrency, 200);
assert.equal(declaredCandidate.independentlyDerivedMarketCap, 2_000_000);
assert.equal(declaredCandidate.directRelativeDifference, 0.99);
assert.equal(declaredCandidate.directMatch, false);
assert.equal(declaredCandidate.selected, false);
assert.equal(penceCandidate.latestPriceInFinancialCurrency, 2);
assert.equal(penceCandidate.independentlyDerivedMarketCap, 20_000);
assert.equal(penceCandidate.directRelativeDifference, 0);
assert.equal(penceCandidate.directMatch, true);
assert.equal(penceCandidate.selected, true);

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
assert.equal(
  ambiguousLondonUnits.diagnostics.candidates.every(
    (candidate) => candidate.selected === false,
  ),
  true,
);
assert.equal(ambiguousLondonUnits.diagnostics.candidates[0].directMatch, true);
assert.equal(ambiguousLondonUnits.diagnostics.candidates[1].scaledMatch, true);

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
