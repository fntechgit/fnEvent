import './src/utils/envVariables'
import 'what-input'
import ReduxWrapper from "./src/state/ReduxWrapper"
import colors from './src/content/colors.json'
import * as Sentry from '@sentry/browser';

export const wrapRootElement = ReduxWrapper;

export const onClientEntry = () => {
    // var set at document level
    // preventa widget color flashing from defaults to fetched by widget from marketing api
    Object.entries(colors).forEach(color => {
        document.documentElement.style.setProperty(`--${color[0]}`, color[1]);
        document.documentElement.style.setProperty(`--${color[0]}50`, `${color[1]}50`);
    })

    if('GATSBY_SENTRY_DSN' in process.env) {
        // sentry init
        Sentry.init({
            dsn: process.env.GATSBY_SENTRY_DSN,
            tracesSampleRate: process.env.GATSBY_SENTRY_TRACE_SAMPLE_RATE,
            beforeSend(event) {
                // Modify the event here
                console.log('before send...', event)
                return event;
            },
            release: process.env.GATSBY_SENTRY_RELEASE,
        });
    }

    window.Sentry = Sentry;

};