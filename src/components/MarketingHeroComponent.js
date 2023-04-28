import React, {
  useRef,
  useState,
  useEffect
} from "react";
import { connect } from "react-redux";
import { getSrc } from "gatsby-plugin-image";
import Slider from "react-slick";
import URI from "urijs";
import Link from "../components/Link";
import LoginButton from "./LoginButton";
import RegistrationLiteComponent from "./RegistrationLiteComponent";

import { PHASES } from "@utils/phasesUtils";

import styles from "../styles/marketing-hero.module.scss";

const MarketingHeroComponent = ({
  location,
  marketingPageSettings,
  summitPhase,
  isLoggedUser,
  summit,
  doLogin,
  hasVirtualBadge,
  defaultPath
}) => {

  const sliderRef = useRef(null);
  const [sliderHeight, setSliderHeight] = useState(424);

  const onResize = () => {
    sliderRef?.current && setSliderHeight(sliderRef.current.clientHeight);
  };

  useEffect(() => {
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const getBackURL = () => {
    const backUrl = location.state?.backUrl
      ? location.state.backUrl
      : defaultPath;
    return URI.encode(backUrl);
  };

  const onClickLogin = () => {
    doLogin(getBackURL());
  };

  const getButtons = () => {
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
              <Link className={styles.link} to={defaultPath}>
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

  let heroLeftColumnInlineStyles = {};
  if (marketingPageSettings.hero?.background?.src) {
    const imageSrc = getSrc(marketingPageSettings.hero.background.src);
    heroLeftColumnInlineStyles.backgroundImage = `url(${imageSrc})`;
  }

  return (
    <section className={styles.heroMarketing}>
      <div className={`${styles.heroMarketingColumns} columns is-gapless`}>
        <div
          className={`${styles.leftColumn} column is-6`}
          style={heroLeftColumnInlineStyles}
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
                {marketingPageSettings.hero?.dateLayout ?
                <div style={{transform: "skew(25deg)"}}>{marketingPageSettings.hero?.date}</div>
                :
                <div style={{transform: "skew(0deg)"}}>
                  <span>{marketingPageSettings.hero?.date}</span>
                </div>
                }
              </div>
              <h4>{marketingPageSettings.hero?.time}</h4>
              <div className={styles.heroButtons}>
                {getButtons()}
              </div>
            </div>
          </div>
        </div>
        {marketingPageSettings.hero?.images &&
        <div className={`${styles.rightColumn} column is-6 px-0`} id="marketing-slider" ref={sliderRef}>
            {marketingPageSettings.hero?.images?.length > 1 ?
            <Slider {...sliderSettings}>
              {marketingPageSettings.hero.images.map((image, index) => {
                const imageSrc = getSrc(image.src);
                return (
                  <div key={index}>
                    <div className={styles.imageSlider} aria-label={image.alt} style={{ backgroundImage: `url(${imageSrc})`, height: sliderHeight, marginBottom: -6 }} />
                  </div>
                );
              })}
            </Slider>
            :
            <div className={styles.singleImage} aria-label={marketingPageSettings.hero.images[0].alt} style={{ backgroundImage: `url(${getSrc(marketingPageSettings.hero.images[0].src)})`}} >
            </div>
          }
        </div>
      }
      </div>
    </section>
  );
}

const mapStateToProps = ({ clockState, summitState }) => ({
  summitPhase: clockState.summit_phase,
  summit: summitState.summit
});

export default connect(mapStateToProps, null)(MarketingHeroComponent);
