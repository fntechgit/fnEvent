import React, { useState, useEffect, useRef } from 'react'

import Link from './Link'

import styles from '../styles/sponsor-page.module.scss'

const SponsorHeader = ({ sponsor, scanBadge }) => {

  const { sponsorship } = sponsor;  

  const [isMuted, _setIsMuted] = useState(true);
  const [isMobile, setIsMobile] = useState(null);
  const videoParentRef = useRef(null);

  const setIsMuted = (isMuted) => {
    const player = videoParentRef.current.children[0];
    player.muted = isMuted;
    _setIsMuted(isMuted)
  };

  const onResize = () => {
    if (window.innerWidth <= 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  useEffect(() => {
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  });

  return (
    <section className={styles.hero}>
      <div className={`${isMobile ? styles.heroSponsorMobile : styles.heroSponsor}`}>
        {!sponsor.video_link &&
          <div className={styles.heroSponsorImageBg} style={{
            backgroundImage: `url(${isMobile ? sponsor.header_image_mobile : sponsor.header_image})`,
            paddingBottom: `${isMobile ? '82.77%' : sponsorship.sponsor_page_template === 'big-header' ? '27.77%' : '18.88%'}`,
            maxHeight: `${sponsorship.sponsor_page_template === 'big-header' ? '400px' : '200px'}`
          }}
          />
        }
        {sponsor.video_link &&
          <div ref={videoParentRef}
            style={{
              paddingBottom: `${sponsorship.sponsor_page_template === 'big-header' ? '27.77%' : '18.88%'}`,
              maxHeight: `${sponsorship.sponsor_page_template === 'big-header' ? '400px' : '200px'}`
            }}
            dangerouslySetInnerHTML={{
              __html: `
              <video class=${styles.heroVideo} preload="auto" autoPlay loop muted playsinline>
                <source src=${sponsor.video_link} type="video/mp4" />
              </video>
              `
            }} />
        }
        <div className={`${styles.heroBody}`}>
          <div className={`${styles.heroSponsorContainer}`}>
            <div className={styles.leftContainer}>
              {sponsor.social_networks && sponsor.social_networks.map((net, index) => (
                net.is_enabled && net.icon_css_class &&
                <Link to={net.link} className={styles.link} key={index}>
                  <i className={`fa icon is-large ${net.icon_css_class}`} />
                </Link>
              ))}
            </div>
            <div className={styles.rightContainer}>
              <div className={styles.category}>
                {sponsor.video_link &&
                  <button className="link" onClick={() => setIsMuted(!isMuted)}>
                    <i className={`${styles.volumeButton} fa fa-2x ${isMuted ? 'fa-volume-off' : 'fa-volume-up'} icon is-large`} />
                  </button>
                }
                {sponsorship.badge_image && <img alt={sponsorship.badge_image_alt_text} src={sponsorship.badge_image} />}
              </div>
              <div className={`${sponsorship.sponsor_page_template === 'big-header' ? styles.buttons : styles.buttonsSmall}`}>
                <Link className={styles.link} onClick={scanBadge}>
                  <button className={`${styles.button} button is-large`} style={{ backgroundColor: `${sponsor.company.color}` }}>
                    <i className={`fa fa-2x fa-qrcode icon is-large`} />
                    <b>Scan your badge</b>
                  </button>
                </Link>
                {sponsor.company.contact_email &&
                  <Link className={styles.link} to={sponsor.company.contact_email}>
                    <button className={`${styles.button} button is-large`} style={{ backgroundColor: `${sponsor.company.color}` }}>
                      <i className={`fa fa-2x fa-envelope icon is-large`} />
                      <b>Contact Us!</b>
                    </button>
                  </Link>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      {sponsor.marquee &&
        <div className={`${sponsorship.sponsor_page_template === 'big-header' ? styles.bottomBar : styles.bottomBarSmall}`} style={{ backgroundColor: `${sponsor.company.color}` }}>
          <div className={styles.track}>
            <div>
              {`${sponsor.marquee} `.repeat(100).slice(0, 459)}
            </div>
          </div>
        </div>
      }
    </section >
  )
}

export default SponsorHeader