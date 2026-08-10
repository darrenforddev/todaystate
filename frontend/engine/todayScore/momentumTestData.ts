import type { MomentumUniverseData } from "./momentumBuilder";

export const momentumTestUniverse: MomentumUniverseData = {
  // PRICE MOMENTUM
  "one-month-price-return": [
    { companyId: "atlas", value: 8 },
    { companyId: "beacon", value: 3 },
    { companyId: "cascade", value: -7 },
    { companyId: "delta", value: 12 },
    { companyId: "ember", value: -2 },
    { companyId: "forge", value: 6 },
    { companyId: "harbor", value: 10 },
  ],

  "three-month-price-return": [
    { companyId: "atlas", value: 19 },
    { companyId: "beacon", value: 7 },
    { companyId: "cascade", value: -11 },
    { companyId: "delta", value: 15 },
    { companyId: "ember", value: 2 },
    { companyId: "forge", value: 12 },
    { companyId: "harbor", value: 24 },
  ],

  "six-month-price-return": [
    { companyId: "atlas", value: 31 },
    { companyId: "beacon", value: 13 },
    { companyId: "cascade", value: -16 },
    { companyId: "delta", value: 27 },
    { companyId: "ember", value: 5 },
    { companyId: "forge", value: 20 },
    { companyId: "harbor", value: 38 },
  ],

  "twelve-month-price-return": [
    { companyId: "atlas", value: 44 },
    { companyId: "beacon", value: 18 },
    { companyId: "cascade", value: -22 },
    { companyId: "delta", value: 36 },
    { companyId: "ember", value: 9 },
    { companyId: "forge", value: 28 },
    { companyId: "harbor", value: 52 },
  ],

  "relative-strength": [
    { companyId: "atlas", value: 1.25 },
    { companyId: "beacon", value: 1.02 },
    { companyId: "cascade", value: 0.68 },
    { companyId: "delta", value: 1.17 },
    { companyId: "ember", value: 0.91 },
    { companyId: "forge", value: 1.1 },
    { companyId: "harbor", value: 1.34 },
  ],

  // EARNINGS MOMENTUM
  "earnings-estimate-revisions-three-month": [
    { companyId: "atlas", value: 9 },
    { companyId: "beacon", value: 2 },
    { companyId: "cascade", value: -14 },
    { companyId: "delta", value: 13 },
    { companyId: "ember", value: -4 },
    { companyId: "forge", value: 5 },
    { companyId: "harbor", value: 11 },
  ],

  "earnings-estimate-revisions-six-month": [
    { companyId: "atlas", value: 15 },
    { companyId: "beacon", value: 4 },
    { companyId: "cascade", value: -19 },
    { companyId: "delta", value: 21 },
    { companyId: "ember", value: -7 },
    { companyId: "forge", value: 8 },
    { companyId: "harbor", value: 17 },
  ],

  "earnings-surprise": [
    { companyId: "atlas", value: 8 },
    { companyId: "beacon", value: 1 },
    { companyId: "cascade", value: -10 },
    { companyId: "delta", value: 13 },
    { companyId: "ember", value: -3 },
    { companyId: "forge", value: 5 },
    { companyId: "harbor", value: 10 },
  ],

  "revenue-surprise": [
    { companyId: "atlas", value: 5 },
    { companyId: "beacon", value: 0.5 },
    { companyId: "cascade", value: -7 },
    { companyId: "delta", value: 9 },
    { companyId: "ember", value: -2 },
    { companyId: "forge", value: 3 },
    { companyId: "harbor", value: 7 },
  ],

  "forward-eps-growth": [
    { companyId: "atlas", value: 21 },
    { companyId: "beacon", value: 10 },
    { companyId: "cascade", value: -5 },
    { companyId: "delta", value: 29 },
    { companyId: "ember", value: 6 },
    { companyId: "forge", value: 16 },
    { companyId: "harbor", value: 24 },
  ],

  // TREND STRENGTH
  "price-versus-50-day-moving-average": [
    { companyId: "atlas", value: 12 },
    { companyId: "beacon", value: 3 },
    { companyId: "cascade", value: -15 },
    { companyId: "delta", value: 16 },
    { companyId: "ember", value: -4 },
    { companyId: "forge", value: 8 },
    { companyId: "harbor", value: 14 },
  ],

  "price-versus-200-day-moving-average": [
    { companyId: "atlas", value: 25 },
    { companyId: "beacon", value: 7 },
    { companyId: "cascade", value: -24 },
    { companyId: "delta", value: 31 },
    { companyId: "ember", value: -6 },
    { companyId: "forge", value: 17 },
    { companyId: "harbor", value: 36 },
  ],

  "fifty-day-versus-200-day-moving-average": [
    { companyId: "atlas", value: 11 },
    { companyId: "beacon", value: 2 },
    { companyId: "cascade", value: -13 },
    { companyId: "delta", value: 14 },
    { companyId: "ember", value: -3 },
    { companyId: "forge", value: 7 },
    { companyId: "harbor", value: 16 },
  ],

  "distance-from-52-week-high": [
    { companyId: "atlas", value: -6 },
    { companyId: "beacon", value: -17 },
    { companyId: "cascade", value: -43 },
    { companyId: "delta", value: -9 },
    { companyId: "ember", value: -26 },
    { companyId: "forge", value: -13 },
    { companyId: "harbor", value: -3 },
  ],
};