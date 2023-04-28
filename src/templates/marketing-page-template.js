import * as React from "react";
import PropTypes from "prop-types";
import { navigate } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";

import Layout from "../components/Layout";
import AttendanceTrackerComponent from "../components/AttendanceTrackerComponent";
import MarketingHeroComponent from "../components/MarketingHeroComponent";
import LiteScheduleComponent from "../components/LiteScheduleComponent";
import DisqusComponent from "../components/DisqusComponent";
import Countdown from "../components/Countdown";
import Link from "../components/Link";

import Masonry from "react-masonry-css";
import Slider from "react-slick";
import { formatMasonry } from "../utils/masonry";

import { PHASES } from "../utils/phasesUtils";

import styles from "../styles/marketing.module.scss";

const MarketingPageTemplate = ({
  location,
  data,
  lastDataSync,
  summit,
  summitPhase,
  doLogin,
  isLoggedUser,
  hasVirtualBadge,
  defaultPath
}) => {

  const {
    marketingPageJson
  } = data;

  let scheduleProps = {};
  if (marketingPageJson.leftColumn?.schedule && isLoggedUser && summitPhase !== PHASES.BEFORE) {
    scheduleProps = {
      ...scheduleProps,
      onEventClick: (ev) => navigate(`/a/event/${ev.id}`),
    }
  }

  const sliderSettings = {
    autoplay: true,
    autoplaySpeed: 5000,
    infinite: true,
    dots: false,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  return (
    <Layout marketing={true} location={location}>
      <AttendanceTrackerComponent />
      <MarketingHeroComponent
        location={location}
        marketingPageSettings={marketingPageJson}
        summit={summit}
        doLogin={doLogin}
        isLoggedUser={isLoggedUser}
        hasVirtualBadge={hasVirtualBadge}
        defaultPath={defaultPath}
      />
      {summit && marketingPageJson.countdown?.display && <Countdown summit={summit} text={marketingPageJson?.countdown?.text} />}
      <div className="columns" id="marketing-columns">
        <div className="column is-half px-6 pt-6 pb-0" style={{ position: 'relative' }}>
          {marketingPageJson.leftColumn?.schedule?.display &&
            <>
              <h2><b>{marketingPageJson.leftColumn.schedule.title}</b></h2>
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
          {marketingPageJson.leftColumn?.disqus?.display &&
            <>
              <h2><b>{marketingPageJson.leftColumn.disqus.title}</b></h2>
              <DisqusComponent page="marketing-site"/>
            </>
          }
          {marketingPageJson.leftColumn?.image?.display &&
           marketingPageJson.leftColumn?.image?.image.src &&
            <>
              <h2><b>{marketingPageJson.leftColumn.image.title}</b></h2>
              <br />
              <GatsbyImage image={getImage(marketingPageJson.leftColumn.image.image.src)} alt={marketingPageJson.leftColumn.image.image.alt ?? ""} />
            </>
          }
        </div>
        <div className="column is-half px-0 pb-0">
          <Masonry
            breakpointCols={2}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column">
            { marketingPageJson.masonry &&
              formatMasonry(marketingPageJson.masonry).map((item, index) => {
              if (item.images && item.images.length === 1) {
                const image = getImage(item.images[0].src);
                return (
                  <div className={'single'} key={index}>
                    {item.images[0].link ?
                      <Link to={item.images[0].link}>
                        <GatsbyImage image={image} alt={item.images[0].alt ?? ""} />
                      </Link>
                      :
                      <GatsbyImage image={image} alt={item.images[0].alt ?? ""} />
                    }
                  </div>
                )
              } else if (item.images && item.images.length > 1) {
                return (
                  <Slider {...sliderSettings} key={index}>
                    {item.images.map((image, indexSlide) => {
                      const img = getImage(image.src);
                      return (
                        <div className={styles.imageSlider} key={indexSlide}>
                          {image.link ?
                            <Link to={image.link}>
                              <GatsbyImage image={img} alt={image.alt ?? ""} />
                            </Link>
                            :
                            <GatsbyImage image={img} alt={image.alt ?? ""} />
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
        </div>
      </div>
    </Layout>
  )
};

MarketingPageTemplate.propTypes = {
  location: PropTypes.object,
  data: PropTypes.object,
  lastDataSync: PropTypes.number,
  summit: PropTypes.object,
  summitPhase: PropTypes.number,
  isLoggedUser: PropTypes.bool
};

export default MarketingPageTemplate;
