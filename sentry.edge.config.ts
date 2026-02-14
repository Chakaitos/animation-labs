// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry in production
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development';
const IS_PRODUCTION = SENTRY_ENVIRONMENT === 'production';

// Performance sampling rate (10% in production, configurable via env var)
const TRACES_SAMPLE_RATE = IS_PRODUCTION
  ? parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0.1')
  : 0;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,

  // Only track errors and performance in production
  enabled: IS_PRODUCTION,

  // Sample 10% of transactions for performance monitoring
  tracesSampleRate: TRACES_SAMPLE_RATE,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII for better debugging
  sendDefaultPii: true,
});
