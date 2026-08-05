# TodayState Architecture

---

# Philosophy

> **Evidence first. Intelligence second. Decisions third.**

TodayState exists to help users understand the world before making investment decisions.

The platform is built around explainable investment intelligence rather than predictions.

---

# High-Level Architecture

```
                     TODAYSTATE

                           │

                    Presentation Layer

                           │

                   Market Brain UI
                   World Desk
                   Theme Explorer
                   Company Explorer
                   ETF Explorer

                           │

                    Service Layer

                           │

               WorldDeskService
               ThemeService
               CompanyService
               ETFService

                           │

                 Intelligence Layer

                           │

         ┌─────────────────┼─────────────────┐
         │                 │                 │

     Scoring Engine   Confidence Engine  Reasoning Engine

                           │

                 Relationship Engine

                           │

                  Evidence Registry

                           │

                 External Data Services
```

---

# Platform Layers

## Presentation Layer

Responsible for displaying information.

Examples:

- World Desk
- Theme Explorer
- Company Explorer
- ETF Explorer

Presentation components never calculate intelligence.

---

## Service Layer

Responsible for assembling data for the user interface.

Examples:

- WorldDeskService
- ThemeService
- CompanyService
- ETFService

Services orchestrate.

They do not calculate conviction or confidence.

---

## Intelligence Layer

Responsible for analysing evidence.

Contains:

- Evidence Registry
- Relationship Engine
- Scoring Engine
- Confidence Engine
- Reasoning Engine

This is the MBIE intelligence pipeline.

---

# Current Engines

## Evidence Registry

Stores all economic evidence.

Examples

- ISM Manufacturing PMI
- Factory Orders
- Construction Spending
- Employment
- Inflation
- Retail Sales

---

## Relationship Engine

Connects evidence to:

- Themes
- Companies
- ETFs
- Sectors (future)

---

## Query Engine

Retrieves all supporting evidence for an intelligence object.

---

## Scoring Engine

Calculates conviction using:

```
Evidence Weight × Relationship Strength
```

Returns a conviction score.

---

## Confidence Engine

Calculates confidence using:

- Evidence quality
- Agreement
- Freshness
- Breadth

Returns a confidence score.

---

## Reasoning Engine

Produces explainable intelligence.

Every score should answer:

> Why?

---

# Intelligence Objects

## Theme Intelligence

Returns

- Score
- Confidence
- Narrative
- Supporting Evidence
- Risks
- Related Companies
- Related ETFs

---

## Company Intelligence

Returns

- Score
- Confidence
- Narrative
- Supporting Themes

---

## ETF Intelligence

Returns

- Score
- Confidence
- Narrative
- Holdings
- Theme Exposure

---

## Future Intelligence

- Sector Intelligence
- Portfolio Intelligence
- Country Intelligence

---

# Data Layer

Static data currently lives in:

```
frontend/data/
```

Examples

- themes.ts
- events.ts
- markets.ts
- worldState.ts
- intelligence.ts
- mbiePulse.ts

As development progresses this layer will gradually be replaced by MBIE engines and live services.

---

# Service Layer

Services prepare information for the UI.

Example

```
getWorldDeskData()
```

Returns

- Market Status
- World State
- MBIE Pulse
- Top Themes
- Watch Today
- Latest Intelligence

Services assemble data.

They never calculate intelligence.

---

# User Interface

Completed

- Application Shell
- Sidebar
- Global Search
- World Desk
- Market Status
- MBIE Pulse
- World State
- Top Themes
- Watch Today
- Latest Intelligence
- Theme Cards
- Company Cards
- Circular Gauges
- Supporting Evidence
- Reasoning Panels

Planned

- Theme Explorer
- Company Explorer
- ETF Explorer
- Evidence Explorer
- Reports

---

# Architecture Rules

## Rule 1

Components display.

---

## Rule 2

Services assemble.

---

## Rule 3

Engines calculate.

---

## Rule 4

Evidence is the single source of truth.

---

## Rule 5

Every score must be explainable.

---

## Rule 6

Every page answers one primary question.

---

# Long-Term Vision

```
Economic Evidence

        │

        ▼

Evidence Registry

        │

        ▼

Relationship Engine

        │

        ▼

Confidence Engine

        │

        ▼

Scoring Engine

        │

        ▼

Reasoning Engine

        │

        ▼

Theme Intelligence

        │

        ▼

Company Intelligence

        │

        ▼

ETF Intelligence

        │

        ▼

World Desk

        │

        ▼

Better Investment Decisions
```

---

# TodayState Mission

> **Explain the world before people invest in it.**

TodayState is designed to transform complex economic evidence into calm, explainable investment intelligence.
