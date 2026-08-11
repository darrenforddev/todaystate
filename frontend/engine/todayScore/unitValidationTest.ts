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

const btWithoutShares = validateMarketValues({
  quoteCurrency: "GBP",
  financialCurrency: "GBP",
  exchangeMic: "XLON",
  symbol: "BT.A:LSE",
  latestClose: 195,
  reportedMarketCap: 1_921_456_143_750,
  reportedEnterpriseValue: 39_833_563_136,
  totalDebt: 22_720_000_000,
  totalCash: 2_100_999_936,
});

assert.equal(btWithoutShares.status, "normalised");
assert.equal(btWithoutShares.quoteToFinancialScale, undefined);
assert.equal(btWithoutShares.marketCapScale, 0.01);
assert.equal(btWithoutShares.latestPriceInFinancialCurrency, undefined);
assert.equal(btWithoutShares.marketCap, 19_214_561_437.5);
assert.equal(btWithoutShares.enterpriseValue, 39_833_561_501.5);
assert.match(btWithoutShares.marketCapMessage, /Shares outstanding were unavailable/);
assert.match(btWithoutShares.marketCapMessage, /multiplied by 0.01/);
assert.match(btWithoutShares.marketCapMessage, /quote-price scale remains unverified/);

const btPenceCandidate = btWithoutShares.diagnostics.candidates.find(
  (candidate) => candidate.scale === 0.01,
);
const btDeclaredCandidate = btWithoutShares.diagnostics.candidates.find(
  (candidate) => candidate.scale === 1,
);

assert.equal(btPenceCandidate?.selected, true);
assert.equal(btPenceCandidate?.enterpriseValueMatch, true);
assert.equal(
  btPenceCandidate?.enterpriseValueFromScaledMarketCap,
  39_833_561_501.5,
);
assert.ok((btPenceCandidate?.enterpriseValueRelativeDifference ?? 1) < 0.000001);
assert.equal(btDeclaredCandidate?.selected, false);
assert.equal(btDeclaredCandidate?.enterpriseValueMatch, false);

const nonLondonWithoutShares = validateMarketValues({
  quoteCurrency: "GBP",
  financialCurrency: "GBP",
  exchangeMic: "XNYS",
  symbol: "EXAMPLE",
  latestClose: 195,
  reportedMarketCap: 1_921_456_143_750,
  reportedEnterpriseValue: 39_833_563_136,
  totalDebt: 22_720_000_000,
  totalCash: 2_100_999_936,
});

assert.equal(nonLondonWithoutShares.status, "rejected");
assert.equal(nonLondonWithoutShares.marketCap, undefined);
assert.equal(nonLondonWithoutShares.marketCapScale, undefined);

const ambiguousEnterpriseValueIdentity = validateMarketValues({
  quoteCurrency: "GBP",
  financialCurrency: "GBP",
  exchangeMic: "XLON",
  symbol: "AMBIG:LSE",
  latestClose: 100,
  reportedMarketCap: 100,
  reportedEnterpriseValue: 10_050,
  totalDebt: 10_000,
  totalCash: 0,
});

assert.equal(ambiguousEnterpriseValueIdentity.status, "rejected");
assert.equal(ambiguousEnterpriseValueIdentity.marketCap, undefined);
assert.match(ambiguousEnterpriseValueIdentity.marketCapMessage, /ambiguous/);
assert.equal(
  ambiguousEnterpriseValueIdentity.diagnostics.candidates.every(
    (candidate) => candidate.enterpriseValueMatch,
  ),
  true,
);

const contradictorySharesCannotUseEnterpriseValueFallback =
  validateMarketValues({
    quoteCurrency: "GBP",
    financialCurrency: "GBP",
    exchangeMic: "XLON",
    symbol: "CONTRADICT:LSE",
    latestClose: 200,
    sharesOutstanding: 10_000,
    reportedMarketCap: 1_000_000,
    reportedEnterpriseValue: 20_000,
    totalDebt: 10_000,
    totalCash: 0,
  });

assert.equal(contradictorySharesCannotUseEnterpriseValueFallback.status, "rejected");
assert.equal(
  contradictorySharesCannotUseEnterpriseValueFallback.marketCap,
  undefined,
);
assert.equal(
  contradictorySharesCannotUseEnterpriseValueFallback.diagnostics.candidates.find(
    (candidate) => candidate.scale === 0.01,
  )?.enterpriseValueMatch,
  true,
);

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
