// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

console.log('🔍 Sentry client config loading...');

// Only initialize Sentry in production
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development';
const IS_PRODUCTION = SENTRY_ENVIRONMENT === 'production';

console.log('🔍 Sentry config values:', {
  hasDSN: !!SENTRY_DSN,
  dsnLength: SENTRY_DSN?.length,
  environment: SENTRY_ENVIRONMENT,
  isProduction: IS_PRODUCTION,
  willInitialize: !!(SENTRY_DSN && IS_PRODUCTION)
});

// Performance sampling rate (10% in production, configurable via env var)
const TRACES_SAMPLE_RATE = IS_PRODUCTION
  ? parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0.1')
  : 0;

// Only initialize if we have a DSN and are in production
if (SENTRY_DSN && IS_PRODUCTION) {
  console.log('✅ Calling Sentry.init() with DSN:', SENTRY_DSN.substring(0, 30) + '...');

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: SENTRY_ENVIRONMENT,
      tracesSampleRate: TRACES_SAMPLE_RATE,
      enableLogs: true,
      sendDefaultPii: true,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    });

    console.log('✅ Sentry.init() completed');
    console.log('✅ Sentry available:', typeof Sentry, Object.keys(Sentry).slice(0, 10));
  } catch (error) {
    console.error('❌ Sentry.init() failed:', error);
  }
} else {
  console.warn('⚠️ Sentry NOT initializing:', {
    reason: !SENTRY_DSN ? 'No DSN' : !IS_PRODUCTION ? 'Not production' : 'Unknown',
    hasDSN: !!SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
