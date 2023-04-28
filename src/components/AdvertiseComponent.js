import * as React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { getImage, getSrc } from "gatsby-plugin-image";
import Ad from "./Ad";

import styles from '../styles/advertise.module.scss'

const adsQuery = graphql`
  query {
    adsJson {
      ads {
        section
        columnAds {
          eventId
          column
          button {
            link
            text
          }
          image {
            src {
              childImageSharp {
                gatsbyImageData (
                  quality: 100
                  placeholder: BLURRED
                )
              }
            }
            alt
          }
        }
      }
    }
  }
`;

const AdvertiseComponent = ({ section, column, eventId }) => {

  const {
    adsJson: content
  } = useStaticQuery(adsQuery);

  const sectionAds = content.ads.find(ad => ad.section === section)?.columnAds.filter(c => c.column === column) || [];

  if (sectionAds.length === 0) return null;

  return (
    sectionAds.map((ad, index) => {
      const key = `ad-${index}`;

      if (!ad.id && column === 'center') {
        return (
          <div className={`${styles.sponsorContainerCenter}`} key={key}>
            <div className={styles.containerText}>
              <span className={styles.adText} style={ad.image ? { textAlign: 'left' } : null}>
                <b>Upload your picture and participate with the #yocovirtualsummit</b>
              </span>
              <a className={styles.link} href={ad.button.link}>
                <button className={`${styles.button} button is-large`} style={ad.image ? { width: '100%' } : null}>
                  <b>{ad.button.text}</b>
                </button>
              </a>
            </div>
            {ad.image?.src && <div className={styles.containerImage} style={{ backgroundImage: `url(${getSrc(ad.image.src)})` }} />}
          </div>
        )
      }

      if ((ad.hasOwnProperty('eventId') && eventId && ad.eventId && ad.eventId !== eventId) || column === 'center') return null;

      const wrapperClass =`${index === 0 ? styles.firstSponsorContainer : styles.sponsorContainer} sponsor-container`;

      if (!ad.image?.src) return null;

      return (
        <Ad
          key={key}
          image={getImage(ad.image.src)}
          alt={ad.image?.alt}
          link={ad.button?.link}
          text={ad.button?.text}
          wrapperClass={wrapperClass}
        />
      );
    })
  );
}

export default AdvertiseComponent;