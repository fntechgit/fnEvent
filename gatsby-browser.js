import './src/utils/envVariables'
import 'what-input'
import ReduxWrapper from "./src/state/ReduxWrapper"
import colors from './src/content/colors.json'
import * as Sentry from '@sentry/browser';
import { RewriteFrames as RewriteFramesIntegration } from "@sentry/integrations";
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
            integrations: [new RewriteFramesIntegration(
                {
                    iteratee: (frame) => {
                        if (!frame.filename) {
                            return frame;
                        }
                        const isComponentFrame = /component---src-pages-(\w*)-js(-\w*).js/.test(frame.filename);
                        if(isComponentFrame){
                            frame.filename = frame.filename.replace(/^(component---src-pages-(\w*)-js)(-\w*).js$/,'$1.js')
                        }
                        const isAppFrame = /^app(-\w*).js/.test(frame.filename);
                        if(isComponentFrame){
                            frame.filename = frame.filename.replace(/^(component---src-pages-(\w*)-js)(-\w*).js$/,'$1.js')
                        }
                        if(isAppFrame){
                            frame.filename = frame.filename.replace(/^app(-\w*).js$/,'app.js')
                        }
                        return frame;
                    }
                }
            )],
        });
    }

    window.Sentry = Sentry;

};