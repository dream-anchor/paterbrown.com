-- Update cron schedule: sync tour events daily at 11:00 CET (10:00 UTC)
-- Previously: 0 3 * * * (3 AM UTC)
SELECT cron.schedule(
  'sync-tour-events-daily',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url := 'https://ymfujbhonvvabivjnnyj.supabase.co/functions/v1/sync-tour-events',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);
