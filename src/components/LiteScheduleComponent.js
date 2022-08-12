import React from "react"
import {Helmet} from 'react-helmet'
import {connect} from "react-redux";

// these two libraries are client-side only
import LiteSchedule from 'lite-schedule-widget/dist';
import 'lite-schedule-widget/dist/index.css';

import {addToSchedule, removeFromSchedule} from '../actions/user-actions';

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
    const wrapperClass = page === 'marketing-site' ? 'schedule-container-marketing' : 'schedule-container-sidebar';

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
            <Helmet>
                <link rel="stylesheet" type="text/css"
                      href="https://cdnjs.cloudflare.com/ajax/libs/awesome-bootstrap-checkbox/1.0.2/awesome-bootstrap-checkbox.min.css"/>
            </Helmet>
            <div className={className || wrapperClass}>
                <LiteSchedule {...componentProps} {...rest} />
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
