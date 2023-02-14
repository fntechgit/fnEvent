import * as Sentry from "@sentry/gatsby";

Sentry.init({
  dsn: process.env.GATSBY_SENTRY_DSN,
  tracesSampleRate: process.env.GATSBY_SENTRY_TRACE_SAMPLE_RATE,
  beforeSend(event) {
    // Modify the event here
    console.log('before send...', event)    
    return event;
  },
  // ...
});