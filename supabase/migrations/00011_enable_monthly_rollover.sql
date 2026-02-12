-- Enable credit rollover for monthly subscriptions
-- Updates existing monthly subscribers to receive rollover benefits

-- Update Starter monthly subscribers
UPDATE public.subscriptions
SET rollover_cap = 3
WHERE billing_interval = 'month'
  AND plan = 'starter'
  AND rollover_cap = 0;

-- Update Professional monthly subscribers
UPDATE public.subscriptions
SET rollover_cap = 10
WHERE billing_interval = 'month'
  AND plan = 'professional'
  AND rollover_cap = 0;

-- Verify updates
DO $$
DECLARE
  starter_count INT;
  professional_count INT;
BEGIN
  SELECT COUNT(*) INTO starter_count
  FROM public.subscriptions
  WHERE billing_interval = 'month'
    AND plan = 'starter'
    AND rollover_cap = 3;

  SELECT COUNT(*) INTO professional_count
  FROM public.subscriptions
  WHERE billing_interval = 'month'
    AND plan = 'professional'
    AND rollover_cap = 10;

  RAISE NOTICE 'Updated % Starter monthly subscriptions', starter_count;
  RAISE NOTICE 'Updated % Professional monthly subscriptions', professional_count;
END $$;
