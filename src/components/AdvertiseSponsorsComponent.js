import * as React from "react";
import Ad from "./Ad";

import styles from "../styles/advertise.module.scss";

const AdvertiseSponsorsComponent = ({ ads }) => {

  if (ads.length === 0) return null;

  return (
    ads.map((ad, index) =>
      <Ad
        key={`ad-${index}`}
        imageSrc={ad.image}
        alt={ad.alt}
        text={ad.text}
        link={ad.link}
        wrapperClass={`${styles.sponsorContainer} sponsor-container`}
      />
    )
  )
}

export default AdvertiseSponsorsComponent;