import * as React from "react";
import { connect } from "react-redux";
import { graphql } from "gatsby";
import MarketingPageTemplate from "../templates/marketing-page-template";
import withRealTimeUpdates from "../utils/real_time_updates/withRealTimeUpdates";
import withFeedsWorker from "../utils/withFeedsWorker";

const MarketingPage = ({
  data,
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
      summit={summit}
      summitPhase={summitPhase}
      user={user}
      isLoggedUser={isLoggedUser}
    />
  )
};

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
  user: userState,
  isLoggedUser: loggedUserState.isLoggedUser
});

export default connect(mapStateToProps, {
})(withFeedsWorker(withRealTimeUpdates(MarketingPage)));