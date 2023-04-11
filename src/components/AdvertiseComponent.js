import * as React from "react";
import Ad from "./Ad";

import styles from '../styles/advertise.module.scss'

import content from "../content/ads.json";

const AdvertiseComponent = ({ section, column, eventId }) => {
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
                        {ad.image && <div className={styles.containerImage} style={{ backgroundImage: `url(${ad.image})` }} />}
                    </div>
                )
            }

            if((ad.hasOwnProperty('eventId') && eventId && ad.eventId && ad.eventId !== eventId) || column === 'center') return null

            const wrapperClass =`${index === 0 ? styles.firstSponsorContainer : styles.sponsorContainer} sponsor-container`;

            return (
                <Ad image={ad.image?.file} alt={ad.image?.alt} link={ad.button?.link} text={ad.button?.text} wrapperClass={wrapperClass} key={key} />
            );
        })
    );
}

export default AdvertiseComponent;