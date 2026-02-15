// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
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

// Only initialize if we have a DSN and are in production
if (SENTRY_DSN && IS_PRODUCTION) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,

    // Sample 10% of transactions for performance monitoring (stays within free tier)
    tracesSampleRate: TRACES_SAMPLE_RATE,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Enable sending user PII for better debugging
    // We'll set custom user context in the app for email/plan info
    sendDefaultPii: true,

    // Replay sampling - disabled (requires paid plan)
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });

  // Expose Sentry to window for manual error capture and debugging
  if (typeof window !== 'undefined') {
    (window as any).Sentry = Sentry;
  }
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
