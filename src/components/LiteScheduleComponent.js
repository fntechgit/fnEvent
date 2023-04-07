import * as React from "react";
import * as Sentry from "@sentry/react";
import {connect} from "react-redux";

// these two libraries are client-side only
import LiteSchedule from 'lite-schedule-widget/dist';
import 'lite-schedule-widget/dist/index.css';
// awesome-bootstrap-checkbox css dependency 
// https://cdnjs.cloudflare.com/ajax/libs/awesome-bootstrap-checkbox/1.0.2/awesome-bootstrap-checkbox.min.css
// injected through HeadComponents

import {addToSchedule, removeFromSchedule} from '../actions/user-actions';

import { SentryFallbackFunction } from "./SentryErrorComponent";

const LiteScheduleComponent = ({
   className,
   userProfile,
   colorSettings,
   homeSettings,
   page,
   addToSchedule,
   removeFromSchedule,
   allScheduleEvents,
   summit,
   ...rest
}) => {
    const wrapperClass = page === 'marketing-site' ? 'schedule-container-marketing' : 'schedule-container';

    const componentProps = {
        defaultImage: homeSettings.schedule_default_image,
        eventsData: allScheduleEvents,
        summitData: summit,
        marketingData: colorSettings,
        userProfile: userProfile,
        triggerAction: (action, {event}) => {
            switch (action) {
                case 'ADDED_TO_SCHEDULE': {
                    return addToSchedule(event);
                }
                case 'REMOVED_FROM_SCHEDULE': {
                    return removeFromSchedule(event);
                }
                default: {
                    return;
                }
            }
        }
    };

    return (
        <>
            <div className={className || wrapperClass}>
                <Sentry.ErrorBoundary fallback={SentryFallbackFunction({componentName: 'Schedule Lite'})}>
                    <LiteSchedule {...componentProps} {...rest} />
                </Sentry.ErrorBoundary>
            </div>
        </>
    )
};

const mapStateToProps = ({userState, summitState, allSchedulesState, settingState}) => ({
    userProfile: userState.userProfile,
    allScheduleEvents: allSchedulesState.allScheduleEvents,
    summit: summitState.summit,
    colorSettings: settingState.colorSettings,
    homeSettings: settingState.homeSettings
});

export default connect(mapStateToProps, {addToSchedule, removeFromSchedule})(LiteScheduleComponent)
