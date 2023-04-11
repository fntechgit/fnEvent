import React from "react";
import { connect } from "react-redux";
import { DiscussionEmbed } from "disqus-react";
import { withMarketingSettings } from "@utils/useMarketingSettings";
import { getEnvVariable, DISQUS_SHORTNAME } from "@utils/envVariables";
import { getDisqusSSO } from "../actions/user-actions";
import PropTypes from "prop-types";

const DisqusComponent = class extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isMobile: false
    };

    this.getIdentifier = this.getIdentifier.bind(this);
    this.getTitle = this.getTitle.bind(this);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  componentDidMount() {
    const shortname = getEnvVariable(DISQUS_SHORTNAME);
    if (shortname)
      this.props.getDisqusSSO(shortname).catch((e) => console.log(e));

    window.addEventListener('resize', this.onResize);
    if (window.innerWidth <= 768) {
      this.setState({ isMobile: true })
    } else {
      this.setState({ isMobile: false })
    }
  }

  onResize = () => {
    if (window.innerWidth <= 768 && this.state.isMobile === false) {
      this.setState({ isMobile: true })
    }
    if (window.innerWidth > 768 && this.state.isMobile === true) {
      this.setState({ isMobile: false })
    }
  };

  getIdentifier() {
    const {
      summit,
      page,
      sponsor,
      event,
      getMarketingSettingByKey,
      MARKETING_SETTINGS_KEYS
    } = this.props;

    let threadsBy = getMarketingSettingByKey(MARKETING_SETTINGS_KEYS.disqusThreadsBy) ?? "event";

    let identifier = null;

    if (event) {
      let eventExcludes = getMarketingSettingByKey(MARKETING_SETTINGS_KEYS.disqusExcludeEvents) ?? [];
      let trackExcludes = getMarketingSettingByKey(MARKETING_SETTINGS_KEYS.disqusExcludeTracks) ?? [];

      identifier = eventExcludes.includes(event.id) ? `summit/${summit.id}/event/${event.id}` : null;

      if (event.track && event.track.id) {
        identifier = trackExcludes.includes(event.track.id) ? `summit/${summit.id}/track/${event.track.id}` : null;
      }

      if (identifier === null) {
        switch (threadsBy) {
          case 'event':
            identifier = `summit/${summit.id}/event/${event.id}`;
            break;
          case 'track':
            identifier = event.track?.id ? `summit/${summit.id}/track/${event.track.id}` : `summit/${summit.id}/event/${event.id}`;
            break;
          case 'summit':
            identifier = `summit/${summit.id}`;
            break;
          default:
            identifier = null;
            break;
        }
      }
    } else if (sponsor) {
      identifier = `summit/${summit.id}/sponsor/${sponsor.id}`;
    }

    if (page) {
      identifier = threadsBy === 'summit' ? `summit/${summit.id}` : `summit/${summit.id}/${page}`;
    }

    return identifier;
  }

  getTitle() {
    const {
      summit,
      page,
      sponsor,
      event,
      getMarketingSettingByKey,
      MARKETING_SETTINGS_KEYS
    } = this.props;

    let suffix = '';
    const threadsBy = getMarketingSettingByKey(MARKETING_SETTINGS_KEYS.disqusThreadsBy) ?? "event";

    if (event) {
      const trackExcludes = getMarketingSettingByKey(MARKETING_SETTINGS_KEYS.disqusExcludeTracks) ?? [];
      if (event.track && event.track.id && (threadsBy === 'track' || trackExcludes.includes(event.track.id))) {
        suffix += ' - ';
        suffix += event.track.name;
      } else if (threadsBy === 'summit') {
      } else {
        suffix += ` - ${event.title}`
      }
    } else if (sponsor) {
      suffix += ` - Sponsor - ${sponsor.name}`
    } else if (page && threadsBy !== 'summit') {
      switch (page) {
        case 'lobby':
          suffix += ' - Lobby';
          break;
        case 'marketing-site':
          suffix += ' - Landing Page';
          break;
        default:
          break;
      }
    }
    return `${summit.name}${suffix}`;
  }

  render() {
    const { isMobile } = this.state || null;
    const { disqusSSO, hideMobile = null } = this.props;

    if (!disqusSSO || (hideMobile !== null && hideMobile === isMobile)) {
      return null;
    }

    const { auth: remoteAuthS3, public_key: apiKey } = disqusSSO;
    const shortname = getEnvVariable(DISQUS_SHORTNAME);

    if (!remoteAuthS3 || !apiKey || !shortname) {
      let error = 'Disqus misconfiguration: ';
      if (!remoteAuthS3) error = ` ${error} ${!remoteAuthS3 ? 'SSO remoteAuthS3 missing' : ''}`;
      if (!apiKey) error = ` ${error} ${!apiKey ? 'SSO apiKey missing' : ''}`;
      if (!shortname) error = ` ${error} ${!shortname ? 'DISQUS_SHORTNAME env var missing' : ''}`;
      return error;
    }

    const disqusConfig = {
      url: window.location.href,
      identifier: this.getIdentifier(),
      title: this.getTitle(),
      remoteAuthS3: remoteAuthS3,
      apiKey: apiKey
    };

    const { title, style, className, page, skipTo } = this.props;
    const sectionClass = className ? className : style ? '' : page === 'marketing-site' ? 'disqus-container-marketing' : 'disqus-container';

    return (
      <section aria-labelledby={title ? 'disqus-title' : ''} className={sectionClass} style={style}>
        <div className="disqus-header">
          {skipTo && <a className="sr-only skip-to-next" href={skipTo}>Skip to next section</a>}
          {title && <h2 id="disqus-title" className="title">{title}</h2>}
        </div>
        <DiscussionEmbed
          shortname={shortname}
          config={disqusConfig}
        />
      </section>
    );
  }
};

const mapStateToProps = ({ summitState, userState }) => ({
  summit: summitState.summit,
  disqusSSO: userState.disqusSSO
});

DisqusComponent.propTypes = {
  event: PropTypes.object,
  sponsor: PropTypes.object,
  title: PropTypes.string,
  hideMobile: PropTypes.bool,
  page: PropTypes.string,
};

export default connect(mapStateToProps, { getDisqusSSO })(withMarketingSettings(DisqusComponent));
