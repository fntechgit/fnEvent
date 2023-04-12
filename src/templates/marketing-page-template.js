import * as React from "react";
import PropTypes from "prop-types";
import { navigate } from "gatsby";

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
  marketingPageSettings,
  lastDataSync,
  summit,
  summitPhase,
  user,
  isLoggedUser
}) => {

  let scheduleProps = {};
  if (marketingPageSettings.leftColumn.schedule && isLoggedUser && summitPhase !== PHASES.BEFORE) {
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
      <MarketingHeroComponent summit={summit} isLoggedUser={isLoggedUser} location={location} />
      {summit && marketingPageSettings?.countdown?.display && <Countdown summit={summit} text={marketingPageSettings?.countdown?.text} />}
      <div className="columns" id="marketing-columns">
        <div className="column is-half px-6 pt-6 pb-0" style={{ position: 'relative' }}>
          {marketingPageSettings.leftColumn.schedule.display &&
            <>
              <h2><b>{marketingPageSettings.leftColumn.schedule.title}</b></h2>
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
          {marketingPageSettings.leftColumn.disqus.display &&
            <>
              <h2><b>{marketingPageSettings.leftColumn.disqus.title}</b></h2>
              <DisqusComponent page="marketing-site"/>
            </>
          }
          {marketingPageSettings.leftColumn.image.display &&
            <>
              <h2><b>{marketingPageSettings.leftColumn.image.title}</b></h2>
              <br />
              <img alt={marketingPageSettings.leftColumn.image.alt} src={marketingPageSettings.leftColumn.image.src} />
            </>
          }
        </div>
        <div className="column is-half px-0 pb-0">
          <Masonry
            breakpointCols={2}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column">
            {formatMasonry(marketingPageSettings.masonry).map((item, index) => {
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
        </div>
      </div>
    </Layout>
  )
};

MarketingPageTemplate.propTypes = {
  location: PropTypes.object,
  marketingPageSettings: PropTypes.object,
  lastDataSync: PropTypes.number,
  summit: PropTypes.object,
  summitPhase: PropTypes.number,
  user: PropTypes.object,
  isLoggedUser: PropTypes.bool
};

export default MarketingPageTemplate;
