import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildSelectionApprovalDraft,
} from "./selectionApprovalDraft";

const baseInput = {
  ticker: "NXT",
  companyName: "Next",
  decision: "long" as const,

  todayScore: 67,
  qualityScore: 75,
  valueScore: 59,
  momentumScore: 65,

  benchmarkTicker: "ISF",

  themeName: "Industrial Recovery",
  themeConfidence: 93,
};

describe("buildSelectionApprovalDraft", () => {
  it("builds a long thesis against the selected benchmark", () => {
    const draft =
      buildSelectionApprovalDraft(
        baseInput,
      );

    expect(draft.thesis).toContain(
      "expects NXT to outperform ISF",
    );

    expect(draft.thesis).toContain(
      "Industrial Recovery",
    );
  });

  it("builds the correct direction for a short selection", () => {
    const draft =
      buildSelectionApprovalDraft({
        ...baseInput,
        decision: "short",
      });

    expect(draft.thesis).toContain(
      "expects NXT to underperform ISF",
    );
  });

  it("turns weak pillars into material risks", () => {
    const draft =
      buildSelectionApprovalDraft({
        ...baseInput,
        valueScore: 30,
      });

    expect(draft.risks).toContain(
      "Value is weak with a score of 30.",
    );
  });

  it("always provides at least one material risk", () => {
    const draft =
      buildSelectionApprovalDraft(
        baseInput,
      );

    expect(draft.risks.length).toBeGreaterThan(0);
  });
});