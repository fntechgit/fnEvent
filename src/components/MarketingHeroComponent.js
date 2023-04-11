import React, {useEffect, useState, useRef, useMemo} from "react";
import { connect } from "react-redux";
import Slider from "react-slick";
import URI from "urijs";
import { doLogin } from "openstack-uicore-foundation/lib/security/methods";
import { PHASES } from "../utils/phasesUtils";
import Link from "../components/Link";
import RegistrationLiteComponent from "./RegistrationLiteComponent";
import { getDefaultLocation } from "../utils/loginUtils";

import styles from "../styles/marketing-hero.module.scss";
import {userHasAccessLevel, VirtualAccessLevel} from "../utils/authorizedGroups";
import LoginButton from "./LoginButton";

const MarketingHeroComponent = ({
  marketingPageSettings,
  eventRedirect,
  summitPhase,
  isLoggedUser,
  summit,
  location,
  userProfile
}) => {

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
    const { registerButton, loginButton } = marketingPageSettings.hero.buttons;

    if (summitPhase >= PHASES.DURING && isLoggedUser) {
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
        {registerButton.display &&
          (
            <span className={styles.link}>
              <RegistrationLiteComponent location={location} />
            </span>
          )}
        {loginButton.display && !isLoggedUser && (
          <LoginButton location={location} />          
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
            backgroundImage: marketingPageSettings.hero.background?.file
              ? `url(${marketingPageSettings.hero.background.file})`
              : "",
          }}
        >
          <div className={`${styles.heroMarketingContainer} hero-body`}>
            <div className="container">
              <h1 className="title">{marketingPageSettings.hero.title}</h1>
              <h2 className="subtitle">{marketingPageSettings.hero.subTitle}</h2>
              <div
                className={styles.date}
                style={{
                  backgroundColor: marketingPageSettings.hero.dateLayout
                    ? "var(--color_secondary)"
                    : "",
                  display: marketingPageSettings.hero.dateLayout
                    ? ""
                    : "inline",
                  transform: marketingPageSettings.hero.dateLayout
                    ? "skew(-25deg)"
                    : "skew(0deg)",
                }}
              >
                {marketingPageSettings.hero.dateLayout ?
                <div style={{transform: "skew(25deg)"}}>{marketingPageSettings.hero.date}</div>
                :
                <div style={{transform: "skew(0deg)"}}>
                  <span>{marketingPageSettings.hero.date}</span>
                </div>
                }
              </div>
              <h4>{marketingPageSettings.hero.time}</h4>
              <div className={styles.heroButtons}>
                {getButtons()}
              </div>
            </div>
          </div>
        </div>
        <div className={`${styles.rightColumn} column is-6 px-0`} id="marketing-slider" ref={sliderRef}>
          {marketingPageSettings.hero.images.length > 1 ?
            <Slider {...sliderSettings}>
              {marketingPageSettings.hero.images.map((img, index) => {
                return (
                  <div key={index}>
                    <div className={styles.imageSlider} aria-label={img.alt} style={{ backgroundImage: `url(${img.file})`, height: sliderHeight, marginBottom: -6 }} />
                  </div>
                );
              })}
            </Slider>
            :
            <div className={styles.singleImage} aria-label={marketingPageSettings.hero.images[0].alt} style={{ backgroundImage: `url(${marketingPageSettings.hero.images[0].file})`}} >
            </div>
          }
        </div>
      </div>
    </section>
  );
}

const mapStateToProps = ({ clockState, settingState, userState, summitState }) => ({
  summitPhase: clockState.summit_phase,
  summit: summitState.summit,
  marketingPageSettings: settingState.marketingPageSettings,
  // TODO: move to site settings i/o marketing page settings
  eventRedirect: settingState.marketingPageSettings.eventRedirect,
  userProfile: userState.userProfile,
});

export default connect(mapStateToProps, null)(MarketingHeroComponent);
