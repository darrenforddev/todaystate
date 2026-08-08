export type ForecastDirection =
  | "positive"
  | "negative"
  | "neutral";

export type OutcomeDirection =
  | "positive"
  | "negative"
  | "neutral";

export type OutcomeStatus =
  | "pending"
  | "correct"
  | "incorrect"
  | "mixed";

export interface HistoricalOutcome {
  id: string;

  // What produced the forecast
  indicatorId: string;
  indicatorName: string;

  // When the forecast was made
  forecastDate: string;

  // When it should be judged
  evaluationDate: string;

  // Forecast horizon in months
  horizonMonths: number;

  // What MBIE expected
  predictedDirection: ForecastDirection;

  // Optional market/economic value when forecast was created
  startingValue?: number;

  // Filled in when the forecast matures
  actualDirection?: OutcomeDirection;
  endingValue?: number;

  // Result
  status: OutcomeStatus;

  // Percentage move or other measurable outcome
  actualChange?: number;

  // Human-readable reasoning captured at forecast time
  forecastReason: string;

  // Explanation added after evaluation
  outcomeExplanation?: string;

  // If wrong, record why
  failureReasons?: string[];

  // Prevent incomplete outcomes affecting historical accuracy
  evaluated: boolean;
}