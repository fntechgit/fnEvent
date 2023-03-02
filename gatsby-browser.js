import './src/utils/envVariables'
import 'what-input'
import ReduxWrapper from "./src/state/ReduxWrapper"
import colors from './src/content/colors.json'
import * as Sentry from '@sentry/gatsby';

import { RewriteFrames as RewriteFramesIntegration } from "@sentry/integrations";
export const wrapRootElement = ReduxWrapper;

export const onClientEntry = () => {
    // var set at document level
    // prevents widget color flashing from defaults to fetched by widget from marketing api
    Object.entries(colors).forEach(color => {
        document.documentElement.style.setProperty(`--${color[0]}`, color[1]);
        document.documentElement.style.setProperty(`--${color[0]}50`, `${color[1]}50`);
    })
    // init sentry
    const GATSBY_SENTRY_DSN = process.env.GATSBY_SENTRY_DSN;
    if(GATSBY_SENTRY_DSN) {
        console.log("INIT SENTRY ....");
        // sentry init
        Sentry.init({
            dsn: GATSBY_SENTRY_DSN,
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
                        // @see https://github.com/getsentry/sentry-javascript/blob/f46f5660114ee625af6e4db895565ae4a36558ae/packages/integrations/src/rewriteframes.ts#L70
                        // rewrite frames to remove the dynamic hash version to match the abs_path
                        if (!frame.filename) {
                            return frame;
                        }
                        const isComponentFrame = /component---src-pages-(\w*)-js(-\w*).js/.test(frame.filename);
                        if(isComponentFrame){
                            frame.filename = frame.filename.replace(/(component---src-pages-(\w*)-js)(-\w*).js$/,'$1.js')
                        }
                        const isAppFrame = /app(-\w*).js/.test(frame.filename);
                        if(isAppFrame){
                            frame.filename = frame.filename.replace(/app(-\w*).js$/,'app.js')
                        }
                        return frame;
                    }
                }
            )],
        });
        window.Sentry = Sentry;
    }
};