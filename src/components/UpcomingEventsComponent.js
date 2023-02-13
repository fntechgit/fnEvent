import React from "react";
import * as Sentry from "@sentry/react";
import { Helmet } from "react-helmet";
import { connect } from "react-redux";

// these two libraries are client-side only
import UpcomingEvents from "upcoming-events-widget/dist";
import "upcoming-events-widget/dist/index.css";

import { addToSchedule, removeFromSchedule } from "../actions/user-actions";

import { SentryFallbackFunction } from "./SentryErrorComponent";

const UpcomingEventsComponent = ({
    className,
    userProfile,
    page,
    addToSchedule,
    removeFromSchedule,
    colorSettings,
    homeSettings,
    allEvents,
    summit,
    ...rest
}) => {
    const wrapperClass = page === "marketing-site" ? "schedule-container-marketing" : "schedule-container";

    const componentProps = {
        defaultImage: homeSettings.schedule_default_image,
        eventsData: allEvents,
        summitData: summit,
        marketingData: colorSettings,
        userProfile: userProfile,
        showAllEvents: true,
        triggerAction: (action, { event }) => {
            switch (action) {
                case "ADDED_TO_SCHEDULE": {
                    return addToSchedule(event);
                }
                case "REMOVED_FROM_SCHEDULE": {
                    return removeFromSchedule(event);
                }
                default:
                    return;
            }
        },
    };

    return (
        <>
            <Helmet>
                <link
                    rel="stylesheet"
                    type="text/css"
                    href="https://cdnjs.cloudflare.com/ajax/libs/awesome-bootstrap-checkbox/1.0.2/awesome-bootstrap-checkbox.min.css"
                />
            </Helmet>
            <div id="upcoming-events" className={className || wrapperClass} style={{ height: 500 }}>
                <Sentry.ErrorBoundary fallback={SentryFallbackFunction}>
                    <UpcomingEvents {...componentProps} {...rest} />
                </Sentry.ErrorBoundary>
            </div>
        </>
    );
};

const mapStateToProps = ({ userState, summitState, allSchedulesState, settingState }) => ({
    userProfile: userState.userProfile,
    colorSettings: settingState.colorSettings,
    homeSettings: settingState.homeSettings,
    summit: summitState.summit,
    allEvents: allSchedulesState.allEvents,
});

export default connect(mapStateToProps, {
    addToSchedule,
    removeFromSchedule
})(UpcomingEventsComponent);
