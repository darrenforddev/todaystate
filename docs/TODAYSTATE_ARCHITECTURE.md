# TodayState Architecture

Version: 1.0

---

# Mission

TodayState transforms real-world evidence into explainable investment intelligence.

Everything inside the platform follows one principle:

Evidence → Relationships → Intelligence → Presentation → User

---

# Layer 1 — Evidence

Purpose

Store objective facts.

Evidence never contains opinions.

Examples

• ISM Manufacturing PMI
• CPI
• PPI
• GDP
• Payrolls
• Oil
• Copper
• VIX
• Treasury Yields

Example

{
id
title

    releasedAt

    latestValue
    previousValue

    trend

    interpretation

}

Responsibilities

✓ Store facts

✓ Track releases

✓ Preserve history

Never

✗ Score companies

✗ Score themes

✗ Generate opinions

---

# Layer 2 — Relationship Engine

Purpose

Map evidence to themes.

Examples

ISM PMI

↓

Industrial Recovery

↓

Capital Goods

↓

Caterpillar

Responsibilities

✓ Build relationships

✓ Weight importance

✓ Explain links

Never

✗ Render UI

✗ Write opinions

---

# Layer 3 — MBIE Intelligence

Purpose

Convert evidence into investment intelligence.

Objects

Themes

Companies

ETFs

Countries

Commodities

Sectors

Every Intelligence Object contains

id

name

score

confidence

momentum

lifecycle

risk

opinion

why

relatedObjects

MBIE Responsibilities

Answer six questions

1. What changed?

2. Why does it matter?

3. Who benefits?

4. Who loses?

5. How confident are we?

6. What should we watch next?

---

# Layer 4 — Presentation

Purpose

Display intelligence.

Pages

Morning Brief

Evidence Intelligence

Theme Intelligence

Company Intelligence

ETF Intelligence

Portfolio

Presentation Layer Rules

Pages never calculate.

Pages never score.

Pages render engine output.

---

# Layer 5 — User

Purpose

Personalise intelligence.

Examples

Portfolio

Watchlists

Alerts

Favourite Themes

Notes

Risk Preferences

The User Layer never changes intelligence.

It changes how intelligence is consumed.

---

# Overall Flow

Real World

↓

Economic Releases

↓

Evidence

↓

Relationship Engine

↓

MBIE

↓

Presentation

↓

User

---

# Design Principles

1. Evidence before opinion.

2. Every opinion must reference evidence.

3. Every score must be explainable.

4. Every page must answer:
   - What?
   - Why?
   - Confidence?
   - Risks?
   - What next?

5. Reusable components over duplicated code.

6. Engines calculate.
   Components display.

7. Data flows one direction.

Evidence

↓

Relationships

↓

Intelligence

↓

UI

Never in reverse.

---

# MBIE Philosophy

MBIE does not predict.

MBIE evaluates evidence.

MBIE does not guess.

MBIE explains.

Every conclusion should be understandable by a human.

---

# Long-Term Vision

TodayState becomes an explainable investment intelligence platform where every conclusion can be traced back to real-world evidence.
🌟 I would add one more section

This is something I don't think Bloomberg, Morningstar or TradingView explicitly define.

TodayState Principles

# The Six TodayState Principles

1. Explain before predicting.

2. Evidence beats opinion.

3. Simplicity beats complexity.

4. Every score is traceable.

5. Every page teaches something.

6. Intelligence must reduce uncertainty.
