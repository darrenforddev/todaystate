CREATE TABLE IF NOT EXISTS
  selection_horizon_outcome_explanations (
    selection_id text NOT NULL,
    horizon text NOT NULL,

    summary text NOT NULL,
    prediction_was_correct boolean,
    primary_cause text NOT NULL,

    supporting_factors jsonb NOT NULL
      DEFAULT '[]'::jsonb,

    contradictory_factors jsonb NOT NULL
      DEFAULT '[]'::jsonb,

    unexpected_events text[] NOT NULL
      DEFAULT ARRAY[]::text[],

    lessons text[] NOT NULL
      DEFAULT ARRAY[]::text[],

    confidence_adjustment integer NOT NULL,
    generated_at date NOT NULL,

    created_at timestamptz NOT NULL
      DEFAULT now(),

    updated_at timestamptz NOT NULL
      DEFAULT now(),

    PRIMARY KEY (
      selection_id,
      horizon
    ),

    FOREIGN KEY (selection_id)
      REFERENCES selection_snapshots (
        selection_id
      )
      ON DELETE CASCADE,

   CHECK (
      horizon IN (
        'one-month',
        'three-month',
        'six-month',
        'twelve-month'
      )
    ),

   CHECK (
      primary_cause IN (
        'theme',
        'market',
        'company',
        'today-score',
        'macro',
        'timing',
        'unexpected-event',
        'insufficient-evidence'
      )
    ),

   CHECK (
      confidence_adjustment BETWEEN -10 AND 10
    )
  );