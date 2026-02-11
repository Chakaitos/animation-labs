-- Add annual billing support to subscriptions table
-- Adds billing_interval (month/year) and rollover_cap columns

ALTER TABLE public.subscriptions
  ADD COLUMN billing_interval text NOT NULL DEFAULT 'month'
    CHECK (billing_interval IN ('month', 'year')),
  ADD COLUMN rollover_cap int NOT NULL DEFAULT 0
    CHECK (rollover_cap >= 0);

COMMENT ON COLUMN public.subscriptions.billing_interval IS
  'Billing frequency: month or year';
COMMENT ON COLUMN public.subscriptions.rollover_cap IS
  'Max credits that can roll over each period (0 = no rollover)';

-- Backfill existing subscriptions with monthly defaults
UPDATE public.subscriptions
SET billing_interval = 'month', rollover_cap = 0
WHERE billing_interval IS NULL OR rollover_cap IS NULL;
