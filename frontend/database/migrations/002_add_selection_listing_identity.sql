ALTER TABLE selection_snapshots
  ADD COLUMN IF NOT EXISTS
    exchange_mic text,

  ADD COLUMN IF NOT EXISTS
    quote_currency text,

  ADD COLUMN IF NOT EXISTS
    benchmark_ticker text,

  ADD COLUMN IF NOT EXISTS
    benchmark_exchange_mic text,

  ADD COLUMN IF NOT EXISTS
    benchmark_quote_currency text;