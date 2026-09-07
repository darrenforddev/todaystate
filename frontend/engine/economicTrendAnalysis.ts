import {
  economicHistory,
  formatEconomicPeriod,
  type EconomicHistoryPoint,
} from "@/data/economicHistory";

export type EconomicTrendDirection =
  | "rising"
  | "falling"
  | "stable";

export type EconomicTrendSignal =
  | "supportive"
  | "caution"
  | "mixed";

export interface EconomicFactorTrend {
  id:
    | "pmi"
    | "new-orders"
    | "output"
    | "employment"
    | "prices"
    | "backlogs";

  label: string;

  startPeriod: string;
  endPeriod: string;

  startValue: number;
  endValue: number;

  twelveMonthChange: number;
  latestMonthlyChange: number;

  direction: EconomicTrendDirection;
  signal: EconomicTrendSignal;

  explanation: string;
}

export interface EconomicTrendAnalysis {
  selectedPeriod: string;
  selectedPeriodLabel: string;

  startPeriod: string;
  startPeriodLabel: string;

  supportiveFactors: number;
  cautionFactors: number;
  mixedFactors: number;

  overallSignal:
    | "strengthening"
    | "weakening"
    | "mixed";

  summary: string;

  factors: EconomicFactorTrend[];
}

interface FactorDefinition {
  id: EconomicFactorTrend["id"];
  label: string;

  manufacturingKey:
    keyof EconomicHistoryPoint;

  servicesKey:
    keyof EconomicHistoryPoint;

  /**
   * Most factors support recovery when rising.
   * Prices are different because rapidly rising
   * prices represent increasing inflation pressure.
   */
  risingIsSupportive: boolean;
}

const factorDefinitions: FactorDefinition[] = [
  {
    id: "pmi",
    label: "Headline PMI",
    manufacturingKey:
      "manufacturingPmi",
    servicesKey: "servicesPmi",
    risingIsSupportive: true,
  },
  {
    id: "new-orders",
    label: "New Orders",
    manufacturingKey:
      "manufacturingNewOrders",
    servicesKey: "servicesNewOrders",
    risingIsSupportive: true,
  },
  {
    id: "output",
    label: "Output and Activity",
    manufacturingKey:
      "manufacturingOutput",
    servicesKey: "servicesOutput",
    risingIsSupportive: true,
  },
  {
    id: "employment",
    label: "Employment",
    manufacturingKey:
      "manufacturingEmployment",
    servicesKey:
      "servicesEmployment",
    risingIsSupportive: true,
  },
  {
    id: "prices",
    label: "Prices Paid",
    manufacturingKey:
      "manufacturingPrices",
    servicesKey: "servicesPrices",
    risingIsSupportive: false,
  },
  {
    id: "backlogs",
    label: "Order Backlogs",
    manufacturingKey:
      "manufacturingBacklogs",
    servicesKey: "servicesBacklogs",
    risingIsSupportive: true,
  },
];

function roundToOneDecimal(
  value: number,
): number {
  return Number(value.toFixed(1));
}

function getCombinedValue(
  point: EconomicHistoryPoint,
  definition: FactorDefinition,
): number {
  const manufacturing = Number(
    point[definition.manufacturingKey],
  );

  const services = Number(
    point[definition.servicesKey],
  );

  return roundToOneDecimal(
    (manufacturing + services) / 2,
  );
}

function getDirection(
  change: number,
): EconomicTrendDirection {
  if (change >= 0.5) {
    return "rising";
  }

  if (change <= -0.5) {
    return "falling";
  }

  return "stable";
}

function getSignal(
  direction: EconomicTrendDirection,
  risingIsSupportive: boolean,
): EconomicTrendSignal {
  if (direction === "stable") {
    return "mixed";
  }

  if (direction === "rising") {
    return risingIsSupportive
      ? "supportive"
      : "caution";
  }

  return risingIsSupportive
    ? "caution"
    : "supportive";
}

function buildExplanation(
  definition: FactorDefinition,
  direction: EconomicTrendDirection,
  signal: EconomicTrendSignal,
  change: number,
): string {
  const movement =
    direction === "stable"
      ? "was broadly stable"
      : `${direction} by ${Math.abs(
          change,
        ).toFixed(1)} points`;

  if (definition.id === "prices") {
    if (signal === "supportive") {
      return `${definition.label} ${movement}, indicating that inflation pressure eased across the period.`;
    }

    if (signal === "caution") {
      return `${definition.label} ${movement}, indicating that inflation pressure increased across the period.`;
    }

    return `${definition.label} ${movement}, leaving inflation pressure broadly unchanged.`;
  }

  if (signal === "supportive") {
    return `${definition.label} ${movement}, providing stronger support for the Industrial Recovery theme.`;
  }

  if (signal === "caution") {
    return `${definition.label} ${movement}, reducing support for the Industrial Recovery theme.`;
  }

  return `${definition.label} ${movement}, producing no decisive change in theme support.`;
}

export function getEconomicTrendAnalysis(
  selectedPeriod: string,
): EconomicTrendAnalysis | null {
  const selectedIndex =
    economicHistory.findIndex(
      (point) =>
        point.period === selectedPeriod,
    );

  if (selectedIndex < 0) {
    return null;
  }

  const availableHistory =
    economicHistory.slice(
      0,
      selectedIndex + 1,
    );

  const startPoint =
    availableHistory[0];

  const endPoint =
    availableHistory[
      availableHistory.length - 1
    ];

  if (!startPoint || !endPoint) {
    return null;
  }

  const previousPoint =
    availableHistory[
      availableHistory.length - 2
    ] ?? endPoint;

  const factors =
    factorDefinitions.map(
      (
        definition,
      ): EconomicFactorTrend => {
        const startValue =
          getCombinedValue(
            startPoint,
            definition,
          );

        const endValue =
          getCombinedValue(
            endPoint,
            definition,
          );

        const previousValue =
          getCombinedValue(
            previousPoint,
            definition,
          );

        const twelveMonthChange =
          roundToOneDecimal(
            endValue - startValue,
          );

        const latestMonthlyChange =
          roundToOneDecimal(
            endValue - previousValue,
          );

        const direction =
          getDirection(
            twelveMonthChange,
          );

        const signal = getSignal(
          direction,
          definition.risingIsSupportive,
        );

        return {
          id: definition.id,
          label: definition.label,

          startPeriod: startPoint.period,
          endPeriod: endPoint.period,

          startValue,
          endValue,

          twelveMonthChange,
          latestMonthlyChange,

          direction,
          signal,

          explanation:
            buildExplanation(
              definition,
              direction,
              signal,
              twelveMonthChange,
            ),
        };
      },
    );

  const supportiveFactors =
    factors.filter(
      (factor) =>
        factor.signal === "supportive",
    ).length;

  const cautionFactors =
    factors.filter(
      (factor) =>
        factor.signal === "caution",
    ).length;

  const mixedFactors =
    factors.filter(
      (factor) =>
        factor.signal === "mixed",
    ).length;

  const overallSignal =
    supportiveFactors > cautionFactors
      ? "strengthening"
      : cautionFactors >
          supportiveFactors
        ? "weakening"
        : "mixed";

  const summary =
    overallSignal === "strengthening"
      ? "Economic conditions strengthened across more factors than they weakened, increasing support for the Industrial Recovery theme."
      : overallSignal === "weakening"
        ? "More economic factors weakened than strengthened, reducing support for the Industrial Recovery theme."
        : "The economic evidence remains mixed, with supportive and cautionary trends broadly balanced.";

  return {
    selectedPeriod:
      endPoint.period,

    selectedPeriodLabel:
      formatEconomicPeriod(
        endPoint.period,
      ),

    startPeriod:
      startPoint.period,

    startPeriodLabel:
      formatEconomicPeriod(
        startPoint.period,
      ),

    supportiveFactors,
    cautionFactors,
    mixedFactors,

    overallSignal,
    summary,

    factors,
  };
}