import * as Sentry from "@sentry/gatsby";

Sentry.init({
  dsn: process.env.GATSBY_SENTRY_DSN,
  tracesSampleRate: 0.7, 
  beforeSend(event) {
    // Modify the event here
    console.log('before send...', event)
    if (event.user) {
      // Don't send user's email address
      delete event.user.email;
    }
    return event;
  },
  // ...
});