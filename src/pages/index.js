import * as React from "react";
import { connect } from "react-redux";
import { graphql } from "gatsby";
import MarketingPageTemplate from "../templates/marketing-page-template";
import withRealTimeUpdates from "../utils/real_time_updates/withRealTimeUpdates";
import withFeedsWorker from "../utils/withFeedsWorker";

const MarketingPage = ({
  data,
  marketingPageSettings,
  lastDataSync,
  summit,
  summitPhase,
  user,
  isLoggedUser
}) => {
  return (
    <MarketingPageTemplate
      data={data}
      lastDataSync={lastDataSync}
      marketingPageSettings={marketingPageSettings}
      summit={summit}
      summitPhase={summitPhase}
      user={user}
      isLoggedUser={isLoggedUser}
    />
  )
};

const mapStateToProps = ({
  settingState,
  summitState,
  clockState,
  userState,
  loggedUserState
}) => ({
  marketingPageSettings: settingState.marketingPageSettings,
  lastDataSync: settingState.lastDataSync,
  summit: summitState.summit,
  summitPhase: clockState.summit_phase,
  user: userState,
  isLoggedUser: loggedUserState.isLoggedUser
});

export default connect(mapStateToProps, {
})(withFeedsWorker(withRealTimeUpdates(MarketingPage)));