import React from 'react'
import { connect } from "react-redux";
import Slider from "react-slick";
import Link from '../components/Link'
import { getSponsorURL } from '../utils/urlFormating'

import styles from '../styles/sponsor.module.scss'

const SponsorComponent = ({ page, sponsorsState, lobbyButton }) => {
  let renderButton = false;

  let sponsorsByTier = sponsorsState.reduce((memo, x) => {
    if (!memo[x['sponsorship'].type.name]) { memo[x['sponsorship'].type.name] = []; }
    memo[x['sponsorship'].type.name].push(x);
    return memo;
  }, {});

  Object.keys(sponsorsByTier).forEach((s) => {
    sponsorsByTier[s] = { ...sponsorsByTier[s][0].sponsorship, sponsors: sponsorsByTier[s] }
  });

  return (
    <React.Fragment>
      {Object.values(sponsorsByTier).map((tier, tierIndex) => {
        const sponsors = tier.sponsors;
        if (!tier) return null;
        const template = page === 'lobby' ? tier.lobby_template : page === 'event' ? tier.event_page_template : 'expo-hall';
        if (sponsors?.length > 0) {
          renderButton = true;
          switch (template) {
            case 'big-images': {
              if (page === 'lobby' && !tier.should_display_on_lobby_page) {
                return null
              } else {
                return (
                  <div className={`${tierIndex === 0 ? styles.firstContainer : ''} ${styles.bigImageContainer}`} key={tierIndex}>
                    {tier.widget_title &&
                      <span><b>{tier.widget_title}</b></span>
                    }
                    {sponsors.map((sponsor, index) => {
                      return (
                        (!sponsor.company.big_logo && !sponsor.company.logo) ?
                        null 
                        :
                        sponsor.is_published ?
                          <Link to={`/a/sponsor/${getSponsorURL(sponsor.id, sponsor.company.name)}`} key={`${tier.type.label}-${index}`}>
                            <img src={sponsor.company.big_logo ? sponsor.company.big_logo : sponsor.company.logo} alt={sponsor.company.name} />
                          </Link>
                          :
                          sponsor.external_link ?
                            <Link to={sponsor.external_link} key={`${tier.type.label}-${index}`}>
                              <img src={sponsor.company.big_logo ? sponsor.company.big_logo : sponsor.company.logo} alt={sponsor.company.name} />
                            </Link>
                            :
                            <img src={sponsor.company.big_logo ? sponsor.company.big_logo : sponsor.company.logo} alt={sponsor.company.name} />
                      )
                    })}
                  </div>
                )
              }
            }
            case 'small-images': {
              if (page === 'lobby' && !tier.should_display_on_lobby_page) {
                return null
              } else {
                return (
                  <div className={`${tierIndex === 0 ? styles.firstContainer : ''} ${styles.smallImageContainer}`} key={tierIndex}>
                    {tier.widget_title &&
                      <span><b>{tier.widget_title}</b></span>
                    }
                    {sponsors.map((sponsor, index) => {
                      if (page === 'event' && !sponsor.showLogoInEventPage) return null
                      return (
                        (!sponsor.company.big_logo && !sponsor.company.logo) ?
                        null 
                        :
                        sponsor.is_published ?
                          <div className={styles.imageBox} key={`${tier.type.label}-${index}`}>
                            <Link to={`/a/sponsor/${getSponsorURL(sponsor.id, sponsor.company.name)}`}>
                              <img src={sponsor.company.big_logo ? sponsor.company.big_logo : sponsor.company.logo} alt={sponsor.company.name} />
                            </Link>
                          </div>
                          : sponsor.external_link ?
                            <div className={styles.imageBox} key={`${tier.type.label}-${index}`}>
                              <Link to={sponsor.external_link}>
                                <img src={sponsor.company.big_logo ? sponsor.company.big_logo : sponsor.company.logo} alt={sponsor.company.name} />
                              </Link>
                            </div>
                            :
                            <div className={styles.imageBox} key={`${tier.type.label}-${index}`}>
                              <img src={sponsor.company.big_logo ? sponsor.company.big_logo : sponsor.company.logo} alt={sponsor.company.name} />
                            </div>
                      )
                    })}
                  </div>
                )
              }
            }
            case 'horizontal-images': {
              return (
                <div className={`${tierIndex === 0 ? styles.firstContainer : ''} ${styles.horizontalContainer} px-6`} key={tierIndex}>
                  {sponsors.map((sponsor, index) => {
                    return (
                      (!sponsor.company.big_logo && !sponsor.company.logo) ?
                        null 
                        :
                      sponsor.is_published ?
                        <div className={styles.imageBox} key={`${tier.type.label}-${index}`}>
                          <Link to={`/a/sponsor/${getSponsorURL(sponsor.id, sponsor.company.name)}`}>
                            <img src={sponsor.company.big_logo ? sponsor.company.big_logo : sponsor.company.logo} alt={sponsor.company.name} />
                          </Link>
                        </div>
                        : sponsor.external_link ?
                          <div className={styles.imageBox} key={`${tier.type.label}-${index}`}>
                            <Link to={sponsor.external_link}>
                              <img src={sponsor.logo} alt={sponsor.company.name} />
                            </Link>
                          </div>
                          :
                          <div className={styles.imageBox} key={`${tier.type.label}-${index}`}>
                            <img src={sponsor.company.big_logo ? sponsor.company.big_logo : sponsor.company.logo} alt={sponsor.company.name} />
                          </div>
                    )
                  })}
                </div>
              )
            }
            case 'expo-hall': {
              return tier.should_display_on_expo_hall_page === true && (
                <div className={`${styles.expoContainer} px-6`} key={tierIndex}>
                  {sponsors.map((sponsor, index) => {
                    return (
                      (!sponsor.company.big_logo && !sponsor.company.logo) ?
                        null 
                      :
                      sponsor.is_published ?
                        <div className={`
                          ${styles.imageBox} 
                          ${tier.expo_hall_template === 'big-images' ? styles.large : tier.expo_hall_template === 'medium-images' ? styles.medium : styles.small}`}
                          key={`${tier.type.label}-${index}`}
                        >
                          <Link to={`/a/sponsor/${getSponsorURL(sponsor.id, sponsor.company.name)}`}>
                            <img src={sponsor.company.big_logo ? sponsor.company.big_logo : sponsor.company.logo} alt={sponsor.company.name} />
                          </Link>
                        </div>
                        : sponsor.external_link ?
                          <div className={`
                          ${styles.imageBox} 
                          ${tier.expo_hall_template === 'big-images' ? styles.large : tier.expo_hall_template === 'medium-images' ? styles.medium : styles.small}`}
                            key={`${tier.type.label}-${index}`}
                          >
                            <Link to={sponsor.external_link}>
                              <img src={sponsor.company.big_logo ? sponsor.company.big_logo : sponsor.company.logo} alt={sponsor.company.name} />
                            </Link>
                          </div>
                          :
                          <div className={`
                          ${styles.imageBox} 
                          ${tier.expo_hall_template === 'big-images' ? styles.large : tier.expo_hall_template === 'medium-images' ? styles.medium : styles.small}`}
                            key={`${tier.type.label}-${index}`}
                          >
                            <img src={sponsor.company.big_logo ? sponsor.company.big_logo : sponsor.company.logo} alt={sponsor.company.name} />
                          </div>
                    )
                  })}
                </div>
              )
            }
            case 'carousel': {
              if (page === 'lobby' && !tier.should_display_on_lobby_page) {
                return null
              } else {
                const sliderSettings = {
                  autoplay: true,
                  autoplaySpeed: 5000,
                  infinite: true,
                  className: 'sponsor-carousel',
                  dots: false,
                  slidesToShow: 1,
                  slidesToScroll: 1
                };
                return (
                  <div className={`${tierIndex === 0 ? styles.firstContainer : ''} ${styles.carouselContainer}`} key={tierIndex}>
                    {tier.widget_title &&
                      <span style={{ marginBottom: '0' }}><b>{tier.widget_title}</b></span>
                    }
                    <Slider {...sliderSettings}>
                      {sponsors.map((sponsor, index) => {
                        const img = sponsor.carousel_advertise_image ? sponsor.carousel_advertise_image : sponsor.logo;
                        return (
                          (!sponsor.company.big_logo && !sponsor.company.logo) ?
                          null 
                          :
                          sponsor.is_published ?
                            <Link to={`/a/sponsor/${getSponsorURL(sponsor.id, sponsor.company.name)}`} key={`${tier.type.label}-${index}`}>
                              <img src={sponsor.carousel_advertise_image} alt={sponsor.carousel_advertise_image_alt_text} />
                            </Link>
                            :
                            sponsor.external_link ?
                              <Link to={sponsor.external_link} key={`${tier.type.label}-${index}`}>
                                <img src={sponsor.carousel_advertise_image} alt={sponsor.carousel_advertise_image_alt_text} />
                              </Link>
                              :
                              <Link key={`${tier.type.label}-${index}`}>
                                <img src={sponsor.carousel_advertise_image} alt={sponsor.carousel_advertise_image_alt_text} />
                              </Link>
                        )
                      })}
                    </Slider>
                  </div>

                )
              }
            }
            default:
              return null;
          }
        } else {
          return null;
        }
      })}
      {page === 'lobby' && lobbyButton.text && lobbyButton.link && renderButton &&
        <Link className={styles.link} to={lobbyButton.link}>
          <button className={`${styles.button} button is-large`}>
            {lobbyButton.text}
          </button>
        </Link>
      }
    </React.Fragment>
  )
};

const mapStateToProps = ({ sponsorState }) => ({
  sponsorsState: sponsorState.sponsors,
  tiers: sponsorState.tiers,
  lobbyButton: sponsorState.lobbyButton
});

export default connect(mapStateToProps, {})(SponsorComponent);