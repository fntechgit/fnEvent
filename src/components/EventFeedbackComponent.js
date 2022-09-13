import React from "react"
import {connect} from "react-redux";
import {getAccessToken} from 'openstack-uicore-foundation/lib/security/methods'
import {getEnvVariable, SUMMIT_API_BASE_URL} from "../utils/envVariables";

// these two libraries are client-side only
import EventFeedbackWidget from 'event-feedback-widget/dist/index.js';
import 'event-feedback-widget/dist/index.css';

const EventFeedbackComponent = ({eventId, summit, user, colorSettings, className = 'event-feedback-container'}) => {

  const widgetProps = {
    title: "Rate this session",
    summitId: summit.id,
    eventId,
    userId: user.id,
    marketingData: colorSettings,
    getAccessToken: getAccessToken,
    apiBaseUrl: getEnvVariable(SUMMIT_API_BASE_URL),
  };

  return (
    <div className={className}>
      <EventFeedbackWidget {...widgetProps} />
    </div>
  )
};

const mapStateToProps = ({summitState, userState, settingState}) => ({
  summit: summitState.summit,
  colorSettings: settingState.colorSettings,
  user: userState.userProfile,
});

export default connect(mapStateToProps, {})(EventFeedbackComponent)