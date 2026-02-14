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

// Only initialize if we have a DSN
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,

    // Only send events in production (but always initialize so window.Sentry is available)
    enabled: IS_PRODUCTION,

    // Sample 10% of transactions for performance monitoring (stays within free tier)
    tracesSampleRate: TRACES_SAMPLE_RATE,

  // Capture 100% of errors (we want all errors, not sampled)
  // Note: tracesSampleRate is for performance, errors are always captured when they occur

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII for better debugging
  // We'll set custom user context in the app for email/plan info
  sendDefaultPii: true,

    // Replay sampling - disabled (requires paid plan)
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
} else {
  console.warn('Sentry DSN not configured - error tracking disabled');
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
