import * as React from "react";
import { useMemo } from "react";
import { connect } from "react-redux";
import { graphql } from "gatsby";
import MarketingPageTemplate from "../templates/marketing-page-template";
import withRealTimeUpdates from "@utils/real_time_updates/withRealTimeUpdates";
import withFeedsWorker from "@utils/withFeedsWorker";
import { getDefaultLocation } from "@utils/loginUtils";

import { doLogin } from "openstack-uicore-foundation/lib/security/methods";

import { userHasAccessLevel, VirtualAccessLevel } from "../utils/authorizedGroups";

export const marketingPageQuery = graphql`
  query {
    marketingPageJson {
      hero {
        title
        subtitle
        dateLayout
        date
        time
        background {
          src {
            childImageSharp {
              gatsbyImageData (
                quality: 100
                placeholder: BLURRED
              )
            }
          }
          alt
        }
        images {
          src {
            childImageSharp {
              gatsbyImageData (
                quality: 100
                placeholder: BLURRED
              )
            }
          }
          alt
        }
        buttons {
          registerButton {
            text
            display
          }
          loginButton {
            text
            display
          }
        }
      }
      countdown {
        display
        text
      }
      leftColumn {
        disqus {
          title
          display
        }
        image {
          title
          display
          image {
            src {
              childImageSharp {
                gatsbyImageData (
                  quality: 100
                  placeholder: BLURRED
                )
              }
            }
            alt
          }
        }
        schedule {
          title
          display
        }
      }
      eventRedirect
      masonry {
        placement
        size
        images {
          src {
            childImageSharp {
              gatsbyImageData (
                quality: 100
                placeholder: BLURRED
              )
            }
          }
          alt
          link
        }
      }
    }
  }
`;

const MarketingPage = ({
  location,
  data,
  lastDataSync,
  summit,
  summitPhase,
  userProfile,
  isLoggedUser,
  eventRedirect
}) => {
  // we store this calculation to use it later
  const hasVirtualBadge = useMemo(() =>
    userProfile ? userHasAccessLevel(userProfile.summit_tickets, VirtualAccessLevel) : false
  , [userProfile]);
  const defaultPath = getDefaultLocation(eventRedirect, hasVirtualBadge);
  return (
    <MarketingPageTemplate
      location={location}
      data={data}
      lastDataSync={lastDataSync}
      summit={summit}
      summitPhase={summitPhase}
      doLogin={doLogin}
      userProfile={userProfile}
      isLoggedUser={isLoggedUser}
      hasVirtualBadge={hasVirtualBadge}
      defaultPath={defaultPath}
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
  lastDataSync: settingState.lastDataSync,
  summit: summitState.summit,
  summitPhase: clockState.summit_phase,
  userProfile: userState.userProfile,
  isLoggedUser: loggedUserState.isLoggedUser,
  // TODO: move to site settings i/o marketing page settings
  eventRedirect: settingState.marketingPageSettings.eventRedirect,
});

export default connect(mapStateToProps, {
})(withFeedsWorker(withRealTimeUpdates(MarketingPage)));