import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { graphql, navigate } from 'gatsby'

import Masonry from 'react-masonry-css'
import Slider from "react-slick"

import Layout from '../components/Layout'
import AttendanceTrackerComponent from '../components/AttendanceTrackerComponent'
import MarketingHeroComponent from '../components/MarketingHeroComponent'
import LiteScheduleComponent from '../components/LiteScheduleComponent'
import DisqusComponent from '../components/DisqusComponent'
import {syncData} from '../actions/base-actions';

import Content, { HTMLContent } from '../components/Content'
import Countdown from '../components/Countdown'
import Link from '../components/Link'
import { PHASES } from '../utils/phasesUtils'
import { Mobile, Default } from '../utils/responsive'

import { formatMasonry } from '../utils/masonry'

import styles from "../styles/marketing.module.scss"
import '../styles/style.scss'
import withFeedsWorker from "../utils/withFeedsWorker";
import withRealTimeUpdates from "../utils/real_time_updates/withRealTimeUpdates";


export const MarketingPageTemplate = class extends React.Component {

  render() {
    const { content, contentComponent, summit_phase, user, isLoggedUser, location, summit, siteSettings,lastDataSync } = this.props;
    const PageContent = contentComponent || Content;

    let scheduleProps = {};
    if (siteSettings.leftColumn.schedule && isLoggedUser && summit_phase !== PHASES.BEFORE) {
      scheduleProps = {
        ...scheduleProps,
        onEventClick: (ev) => navigate(`/a/event/${ev.id}`),
      }
    }

    const renderMainContent = () => (
      <>
        {siteSettings.leftColumn.schedule.display &&
          <>
            <h2><b>{siteSettings.leftColumn.schedule.title}</b></h2>
            <LiteScheduleComponent
              {...scheduleProps}
              key={`marketing_lite_schedule_${lastDataSync}`}
              id={`marketing_lite_schedule_${lastDataSync}`}
              page="marketing-site"
              showAllEvents={true}
              showSearch={false}
              showNav={true}
            />
          </>
        }
        {siteSettings.leftColumn.disqus.display &&
          <>
            <h2><b>{siteSettings.leftColumn.disqus.title}</b></h2>
            <DisqusComponent page="marketing-site"/>
          </>
        }
        {siteSettings.leftColumn.image.display &&
          <>
            <h2><b>{siteSettings.leftColumn.image.title}</b></h2>
            <br />
            <img alt={siteSettings.leftColumn.image.alt} src={siteSettings.leftColumn.image.src} />
          </>
        }
      </>
    );

    const renderCountdown = () => summit && siteSettings?.countdown?.display &&
      <Countdown summit={summit} text={siteSettings?.countdown?.text} />;

    const sliderSettings = {
      autoplay: true,
      autoplaySpeed: 5000,
      infinite: true,
      dots: false,
      slidesToShow: 1,
      slidesToScroll: 1
    };

    const renderMasonry = () => (
      <Masonry
        breakpointCols={2}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column">
        {formatMasonry(siteSettings.sponsors).map((item, index) => {
          if (item.images && item.images.length === 1) {
            return (
              <div className={'single'} key={index}>
                {item.images[0].link ?
                  <Link to={item.images[0].link}>
                    <img alt={item.images[0].alt} src={item.images[0].image} />
                  </Link>
                  :
                  <img alt={item.images[0].alt} src={item.images[0].image} />
                }
              </div>
            )
          } else if (item.images && item.images.length > 1) {
            return (
              <Slider {...sliderSettings} key={index}>
                {item.images.map((img, indexSlide) => {
                  return (
                    <div className={styles.imageSlider} key={indexSlide}>
                      {img.link ?
                        <Link to={img.link}>
                          <img alt={img.alt} src={img.image} />
                        </Link>
                        :
                        <img alt={img.alt} src={img.image} />
                      }
                    </div>
                  )
                })}
              </Slider>
            )
          } else {
            return (
              <div className="single" key={index} />
            )
          }
        })}
      </Masonry>
    );

    return (
      <>
        <AttendanceTrackerComponent />
        <MarketingHeroComponent summit={summit} isLoggedUser={isLoggedUser} location={location} />
        <Mobile>
          <div className="columns mb-0">
            <div className="column is-full px-6 pt-6 pb-0" style={{ position: 'relative' }}>
              { renderMainContent() }
            </div>
          </div>
          { renderCountdown() }
          <div className="columns mb-0">
            <div className="column is-full px-0 pb-0">
              { renderMasonry() }
            </div>
          </div>
        </Mobile>
        <Default>
          { renderCountdown() }
          <div className="columns mb-0">
            <div className="column is-half px-6 pt-6 pb-0" style={{ position: 'relative' }}>
              { renderMainContent() }
            </div>
            <div className="column is-half px-0 pb-0">
              { renderMasonry() }
            </div>
          </div>
        </Default>
        <PageContent content={content} />
      </>
    )
  }
}

MarketingPageTemplate.propTypes = {
  content: PropTypes.string,
  contentComponent: PropTypes.func,
  summit_phase: PropTypes.number,
  user: PropTypes.object,
  isLoggedUser: PropTypes.bool,
}

const MarketingPage = ({ summit, location, data, summit_phase, user, isLoggedUser, syncData, lastBuild, siteSettings, lastDataSync }) => {
  const { html } = data.markdownRemark;

  return (
    <Layout marketing={true} location={location}>
      <MarketingPageTemplate
        contentComponent={HTMLContent}
        content={html}
        location={location}
        summit_phase={summit_phase}
        summit={summit}
        user={user}
        isLoggedUser={isLoggedUser}
        syncData={syncData}
        lastBuild={lastBuild}
        siteSettings={siteSettings}
        lastDataSync={lastDataSync}
      />
    </Layout>
  )
}

MarketingPage.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.object,
    }),
  }),
  summit_phase: PropTypes.number,
  user: PropTypes.object,
  isLoggedUser: PropTypes.bool,
  getSummitData: PropTypes.func
}

const mapStateToProps = ({ clockState, loggedUserState, userState, summitState, settingState }) => ({
  summit_phase: clockState.summit_phase,
  isLoggedUser: loggedUserState.isLoggedUser,
  user: userState,
  summit: summitState.summit,
  lastBuild: settingState.lastBuild,
  siteSettings: settingState.siteSettings,
  staticJsonFilesBuildTime: settingState.staticJsonFilesBuildTime,
  lastDataSync: settingState.lastDataSync,
});

export default connect(mapStateToProps, {
  syncData
})(withFeedsWorker(withRealTimeUpdates(MarketingPage)))

export const marketingPageQuery = graphql`
  query MarketingPageTemplate($id: String!) {    
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {        
        title
      }
    }
  }
`;