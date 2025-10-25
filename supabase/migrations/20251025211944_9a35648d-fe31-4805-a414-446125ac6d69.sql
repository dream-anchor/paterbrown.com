-- Create cron job to sync tour events daily at 3 AM
SELECT cron.schedule(
  'sync-tour-events-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://ymfujbhonvvabivjnnyj.supabase.co/functions/v1/sync-tour-events',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);