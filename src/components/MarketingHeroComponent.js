import React, {useEffect, useState, useRef, useMemo} from "react";
import { connect } from "react-redux";
import Slider from "react-slick";
import URI from "urijs";
import { doLogin } from "openstack-uicore-foundation/lib/security/methods";
import { PHASES } from "../utils/phasesUtils";
import Link from "../components/Link";
import RegistrationLiteComponent from "./RegistrationLiteComponent";
import { getDefaultLocation } from "../utils/loginUtils";
import { changeSummitTitle } from "../actions/summit-actions";
import {userHasAccessLevel, VirtualAccessLevel} from "../utils/authorizedGroups";

import styles from "../styles/marketing-hero.module.scss";

const MarketingHeroComponent = ({ siteSettings, eventRedirect, summit_phase, isLoggedUser, summit, location, userProfile, changeSummitTitle }) => {

  const sliderRef = useRef(null);
  const [sliderHeight, setSliderHeight] = useState(424);

  const onResize = () => {
    setSliderHeight(sliderRef.current.clientHeight);
  };

  // we store this calculation to use it later
  const hasVirtualBadge = useMemo(() =>
          userProfile ? userHasAccessLevel(userProfile.summit_tickets, VirtualAccessLevel) : false,
      [userProfile]);

  useEffect(() => {
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const getBackURL = () => {
    let defaultLocation = getDefaultLocation(eventRedirect, hasVirtualBadge);
    let backUrl = location.state?.backUrl
      ? location.state.backUrl
      : defaultLocation;
    return URI.encode(backUrl);
  };

  const onClickLogin = () => {
    doLogin(getBackURL());
  };

  const getButtons = () => {

    const path = getDefaultLocation(eventRedirect, hasVirtualBadge);
    const { registerButton, loginButton } = siteSettings.heroBanner.buttons;

    if (summit_phase >= PHASES.DURING && isLoggedUser) {
      return (
        <>
          {registerButton.display &&
            (
              <span className={styles.link}>
                <RegistrationLiteComponent location={location} />
              </span>
            )}
          {hasVirtualBadge && /* only show button if we have virtual access */
              <Link className={styles.link} to={path}>
                <button className={`${styles.button} button is-large`}>
                  <i className={`fa fa-2x fa-sign-in icon is-large`}/>
                  <b>Enter</b>
                </button>
              </Link>
          }
        </>
      );
    }

    return (
      <>
        {registerButton.display && !summit.invite_only_registration &&
          (
            <span className={styles.link}>
              <RegistrationLiteComponent location={location} />
            </span>
          )}
        {loginButton.display && !isLoggedUser && (
          <button className={`${styles.button} button is-large`} onClick={() => onClickLogin()}>
            <i className={`fa fa-2x fa-sign-in icon is-large`} />
            <b>{loginButton.text}</b>
          </button>
        )}
      </>
    );
  };

  const sliderSettings = {
    autoplay: true,
    autoplaySpeed: 5000,
    infinite: true,
    dots: false,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <section className={styles.heroMarketing}>
      <div className={`${styles.heroMarketingColumns} columns is-gapless`}>
        <div
          className={`${styles.leftColumn} column is-6`}
          style={{
            backgroundImage: siteSettings.heroBanner.background?.file
              ? `url(${siteSettings.heroBanner.background.file})`
              : "",
          }}
        >
          <div className={`${styles.heroMarketingContainer} hero-body`}>
            <div className="container">
              <h1 className="title">{siteSettings.heroBanner.title}</h1>
              <h2 className="subtitle">{siteSettings.heroBanner.subTitle}</h2>
              <div
                className={styles.date}
                style={{
                  backgroundColor: siteSettings.heroBanner.dateLayout
                    ? "var(--color_secondary)"
                    : "",
                  display: siteSettings.heroBanner.dateLayout
                    ? ""
                    : "inline",
                  transform: siteSettings.heroBanner.dateLayout
                    ? "skew(-25deg)"
                    : "skew(0deg)",
                }}
              >
                {siteSettings.heroBanner.dateLayout ?
                <div style={{transform: "skew(25deg)"}}>{siteSettings.heroBanner.date}</div>
                :
                <div style={{transform: "skew(0deg)"}}>
                  <span>{siteSettings.heroBanner.date}</span>
                </div>
                }
              </div>
              <h4>{siteSettings.heroBanner.time}</h4>
              <div className={styles.heroButtons}>
                {getButtons()}
              </div>
              {/* TEST */}
              <div>
                {summit?.name}
                <button onClick={changeSummitTitle}>change</button>
              </div>
            </div>
          </div>
        </div>
        <div className={`${styles.rightColumn} column is-6 px-0`} id="marketing-slider" ref={sliderRef}>
          {siteSettings.heroBanner.images.length > 1 ?
            <Slider {...sliderSettings}>
              {siteSettings.heroBanner.images.map((img, index) => {
                return (
                  <div key={index}>
                    <div className={styles.imageSlider} aria-label={img.alt} style={{ backgroundImage: `url(${img.file})`, height: sliderHeight, marginBottom: -6 }} />
                  </div>
                );
              })}
            </Slider>
            :
            <div className={styles.singleImage} aria-label={siteSettings.heroBanner.images[0].alt} style={{ backgroundImage: `url(${siteSettings.heroBanner.images[0].file})`}} >
            </div>
          }
        </div>
      </div>
    </section>
  );
}

const mapStateToProps = ({ clockState, settingState, userState, summitState }) => ({
  summit_phase: clockState.summit_phase,
  summit: summitState.summit,
  siteSettings: settingState.siteSettings,
  eventRedirect: settingState.siteSettings.eventRedirect,
  userProfile: userState.userProfile,
});

export default connect(mapStateToProps, {changeSummitTitle})(MarketingHeroComponent);
