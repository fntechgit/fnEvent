import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { navigate } from 'gatsby'
import { connect } from 'react-redux'

import SponsorHeader from '../components/SponsorHeader'
import AttendanceTrackerComponent from '../components/AttendanceTrackerComponent';
import AccessTracker from '../components/AttendeeToAttendeeWidgetComponent';
import LiveEventWidgetComponent from '../components/LiveEventWidgetComponent'
import UpcomingEventsComponent from '../components/UpcomingEventsComponent'
import AdvertiseSponsorsComponent from '../components/AdvertiseSponsorsComponent'
import DocumentsComponent from '../components/DocumentsComponent'
import DisqusComponent from '../components/DisqusComponent'
import SponsorBanner from '../components/SponsorBanner'
import HeroComponent from '../components/HeroComponent'
import Link from '../components/Link'
import Layout from '../components/Layout'
import { scanBadge } from '../actions/user-actions'
import MarkdownIt from "markdown-it";
import { getEnvVariable, LIVE_EVENT_THUMBNAIL_GIF_CAPTURE_STARTS } from "../utils/envVariables";
import styles from '../styles/sponsor-page.module.scss'
import SponsorNavigation from '../components/SponsorNavigation'

const SponsorPageTemplate = ({ sponsorId, sponsors, scanBadge, eventId }) => {
  const [sponsorLoading, setSponsorLoading] = useState(true);
  const [sponsor, setSponsor] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [parsedIntro, setParsedIntro] = useState('')
  const [sponsorship, setSponsorship] = useState(null);


  useEffect(() => {


    const sponsor = sponsors.find(s => s.id === parseInt(sponsorId)) || null;
    if (!sponsor) {
      setNotFound(true)
    } else {
      const sponsorship = sponsor.sponsorship;
      const parser = new MarkdownIt({
        html: true,
        breaks: true,
        linkify: true,
        xhtmlOut: true,
        typographer: true,
      });
      const parsedIntro = parser.render(sponsor.intro ?? '');
      if (sponsor) setSponsor(sponsor); setSponsorship(sponsorship); setParsedIntro(parsedIntro);
    }
    setSponsorLoading(false)
  }, [sponsorId])

  const onEventChange = (ev) => {
    if (eventId !== `${ev.id}`) {
      navigate(`/a/event/${ev.id}`);
    }
  };

  const onBadgeScan = () => {
    scanBadge(sponsor.id);
  };

  if (notFound) {
    return <HeroComponent title="Sponsor not found" redirectTo="/a/sponsors" />
  }

  const {
    sponsor_page_use_banner_widget: bannerWidget,
    sponsor_page_use_disqus_widget: disqusWidget,
    sponsor_page_use_live_event_widget: liveEventWidget,
    sponsor_page_use_schedule_widget: scheduleWidget
  } = sponsorship || {};

  if (sponsorLoading) {
    return <HeroComponent title="Loading..." />
  }

  return (
      <React.Fragment>
        <AttendanceTrackerComponent
          sourceName="SPONSOR"
          sourceId={sponsor?.id}
        />
        <AccessTracker />
        <SponsorHeader sponsor={sponsor} sponsorship={sponsorship} scanBadge={() => onBadgeScan()} />
        <SponsorNavigation currentSponsor={sponsor} sponsors={sponsors} />
        <section className={`section px-0 ${sponsorship?.sponsor_page_template === 'big-header' ? 'pt-5' : 'pt-0'} pb-0`}>
          {sponsor?.side_image &&
            <div className="columns mx-0 mt-0 mb-6">
              <div className={`column is-half px-5 py-0 ${styles.introHalf}`}>
                {sponsor?.company.name && <h1>{sponsor?.company.name}</h1>}
                {sponsor?.intro && <span dangerouslySetInnerHTML={{ __html: parsedIntro }} />}
              </div>
              <div className="column is-half px-0 py-0">
                <img alt={sponsor?.side_image_alt_text} src={sponsor?.side_image} className={styles.sideImage} />
              </div>
            </div>
          }
          <div className="columns mx-0 my-0">
            <div className="column is-three-quarters px-5 py-0">
              {!sponsor?.side_image &&
                <div className={styles.sponsorIntro}>
                  {sponsor?.company.name && <h1>{sponsor?.company.name}</h1>}
                  {sponsor?.intro && <span dangerouslySetInnerHTML={{ __html: parsedIntro }} />}
                </div>
              }
              {liveEventWidget &&
                <LiveEventWidgetComponent
                  onEventClick={(ev) => onEventChange(ev)}
                  onlyPresentations={true}
                  sponsorId={sponsor?.company.id}
                  showSponsor={!!sponsor?.company.id}
                  featuredEventId={sponsor?.featured_event_id}
                  streamThumbnailGifCaptureStarts={parseInt(getEnvVariable(LIVE_EVENT_THUMBNAIL_GIF_CAPTURE_STARTS))}
                />
              }
              {scheduleWidget &&
                <UpcomingEventsComponent
                  eventCount={3}
                  sponsorId={sponsor?.company.id}
                  renderEventLink={(event) => <Link to={`/a/event/${event.id}`}>{event.title}</Link>}
                  allEventsLink={<Link to={`/a/schedule#company=${encodeURIComponent(sponsor?.name)}`}>View all <span className="sr-only">events</span></Link>}
                />
              }
              {bannerWidget && <SponsorBanner sponsor={sponsor} bgColor={sponsor?.company.color} scanBadge={() => onBadgeScan()} />}
            </div>
            <div className="column is-one-quarter px-5 py-0">
              {sponsor?.chat_link &&
                <div className={styles.videoChatButton}>
                  <Link className={styles.link} to={sponsor?.chat_link}>
                    <button className={`${styles.button} button is-large`} style={{ backgroundColor: `${sponsor?.company.color}` }}>
                      <b>LIVE VIDEO CHAT!</b>
                    </button>
                  </Link>
                </div>
              }
              {disqusWidget &&
                <DisqusComponent className={styles.disqusContainerSponsor} title="" sponsor={sponsor} />
              }
              {sponsor?.materials && sponsor.materials.length > 0 &&
                <DocumentsComponent event={sponsor?.materials} sponsorPage={true} />
              }
              {sponsor?.ads && sponsor.ads.length > 0 &&
                <AdvertiseSponsorsComponent ads={sponsor?.ads} style={{ marginTop: '2em' }} />
              }
            </div>
          </div>
        </section>
      </React.Fragment>
    )
};

const SponsorPage = (
  {
    location,
    user,
    scanBadge,
    sponsorId,
    summit,
    sponsors,
  }
) => {

  return (
    <Layout location={location}>
      <SponsorPageTemplate
        user={user}
        scanBadge={scanBadge}
        sponsorId={sponsorId}
        summit={summit}
        sponsors={sponsors}
      />
    </Layout>
  )
};

SponsorPage.propTypes = {
  user: PropTypes.object,
  scanBadge: PropTypes.func,
  sponsorId: PropTypes.string,
};

SponsorPageTemplate.propTypes = {
  user: PropTypes.object,
  scanBadge: PropTypes.func,
  sponsorId: PropTypes.string,
};

const mapStateToProps = ({ userState, sponsorState, summitState }) => ({
  user: userState,
  sponsors: sponsorState.sponsors,
  summit: summitState.summit
});

export default connect(mapStateToProps, { scanBadge })(SponsorPage);