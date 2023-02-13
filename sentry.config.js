import * as Sentry from "@sentry/gatsby";

Sentry.init({
  dsn: process.env.GATSBY_SENTRY_DSN,
  tracesSampleRate: 0.7, 
  beforeSend(event) {
    // Modify the event here
    console.log('before send...', event)    
    return event;
  },
  // ...
});