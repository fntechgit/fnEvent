import React from 'react'
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


export const SponsorPageTemplate = class extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      sponsor: null,
      notFound: null,
      parsedIntro: null,
      tier: null
    }
  }

  componentWillMount() {
    this.setSponsor();
  }

  componentDidUpdate(prevProps) {
    const { sponsorId } = this.props;
    const { sponsorId: prevSponsorId } = prevProps;
    // sponsor id came as param at uri    
    if (sponsorId !== prevSponsorId) {
      this.setSponsor();
    }
  }


  onEventChange = (ev) => {
    const { eventId } = this.props;
    if (eventId !== `${ev.id}`) {
      navigate(`/a/event/${ev.id}`);
    }
  };

  onBadgeScan = () => {
    const { sponsor: { sponsorId } } = this.state;
    this.props.scanBadge(sponsorId);
  };

  setSponsor = () => {
    const { sponsorId, sponsors, tiers } = this.props;
    const sponsor = sponsors.map(t => t.sponsors?.find(s => s.id === parseInt(sponsorId)))
      .filter(e => e !== undefined)[0];
    if (!sponsor) {
      this.setState({ notFound: true });
    } else {
      const tier = sponsors.find(t => t.sponsors.find(s => s === sponsor)).tier[0];
      const tierData = tiers.find(t => t.id === tier.value);
      const parser = new MarkdownIt({
        html: false,
        breaks: true,
        linkify: true,
        xhtmlOut: true,
        typographer: true,
      });
      const parsedIntro = parser.render(sponsor.intro ?? '');
      if (sponsor) this.setState({ sponsor: sponsor, tier: tierData, parsedIntro: parsedIntro });
    }
  }

  render() {
    const { user, summit, sponsors } = this.props;
    const { sponsor, tier, notFound, parsedIntro } = this.state;

    if (notFound) {
      return <HeroComponent title="Sponsor not found" redirectTo="/a/sponsors" />
    }

    const { disqus, liveEvent, schedule, banner } = tier.sponsorPage.widgets || {};
      return (
          <React.Fragment>
            <AttendanceTrackerComponent
                sourceName="SPONSOR"
                sourceId={sponsor.sponsorId}
            />
            <AccessTracker />
            <SponsorHeader sponsor={sponsor} tier={tier} scanBadge={() => this.onBadgeScan()} />
            <SponsorNavigation currentSponsor={sponsor} sponsors={sponsors} />
            <section className={`section px-0 ${tier.sponsorPage.sponsorTemplate === 'big-header' ? 'pt-5' : 'pt-0'} pb-0`}>
              {sponsor.sideImage && sponsor?.sideImage?.file &&
              <div className="columns mx-0 mt-0 mb-6">
                <div className={`column is-half px-5 py-0 ${styles.introHalf}`}>
                  {sponsor.title && <h1>{sponsor.title}</h1>}
                  {sponsor.intro && <span dangerouslySetInnerHTML={{ __html: parsedIntro }} />}
                </div>
                <div className="column is-half px-0 py-0">
                  <img alt={sponsor.sideImage.alt} src={sponsor.sideImage.file} className={styles.sideImage} />
                </div>
              </div>
              }
              <div className="columns mx-0 my-0">
                <div className="column is-three-quarters px-5 py-0">
                  {!sponsor?.sideImage?.file &&
                  <div className={styles.sponsorIntro}>
                    {sponsor.title && <h1>{sponsor.title}</h1>}
                    {sponsor.intro && <span dangerouslySetInnerHTML={{ __html: parsedIntro }} />}
                  </div>
                  }
                  {liveEvent &&
                  <LiveEventWidgetComponent
                      onEventClick={(ev) => this.onEventChange(ev)}
                      onlyPresentations={true}
                      sponsorId={sponsor.companyId}
                      showSponsor={!!sponsor.companyId}
                      featuredEventId={sponsor.featuredEventId}
                      streamThumbnailGifCaptureStarts={parseInt(getEnvVariable(LIVE_EVENT_THUMBNAIL_GIF_CAPTURE_STARTS))}
                  />
                  }
                  {schedule &&
                  <UpcomingEventsComponent
                      eventCount={3}
                      sponsorId={sponsor.companyId}
                      renderEventLink={(event) => <Link to={`/a/event/${event.id}`}>{event.title}</Link>}
                      allEventsLink={<Link to={`/a/schedule#company=${encodeURIComponent(sponsor.name)}`}>View all <span className="sr-only">events</span></Link>}
                  />
                  }
                  {banner && <SponsorBanner sponsor={sponsor} bgColor={sponsor.sponsorColor} scanBadge={() => this.onBadgeScan()} />}
                </div>
                <div className="column is-one-quarter px-5 py-0">
                  {sponsor.chatLink &&
                  <div className={styles.videoChatButton}>
                    <Link className={styles.link} to={sponsor.chatLink}>
                      <button className={`${styles.button} button is-large`} style={{ backgroundColor: `${sponsor.sponsorColor}` }}>
                        <b>LIVE VIDEO CHAT!</b>
                      </button>
                    </Link>
                  </div>
                  }
                  {disqus &&
                  <DisqusComponent className={styles.disqusContainerSponsor} title="" sponsor={sponsor} />
                  }
                  {sponsor.documents &&
                  <DocumentsComponent event={sponsor.documents} />
                  }
                  {sponsor.columnAds &&
                  <AdvertiseSponsorsComponent ads={sponsor.columnAds} style={{ marginTop: '2em' }} />
                  }
                </div>
              </div>
            </section>
          </React.Fragment>
      )
  }
};

const SponsorPage = (
    {
      location,
      user,
      scanBadge,
      sponsorId,
      summit,
      sponsors,
      tiers
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
            tiers={tiers}
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
  tiers: sponsorState.tiers,
  summit: summitState.summit
});

export default connect(mapStateToProps, { scanBadge })(SponsorPage);