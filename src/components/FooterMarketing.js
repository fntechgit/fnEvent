import * as React from "react";
import Link from "./Link";

import footerContent from "../content/footer/index.json";

import styles from "../styles/footer.module.scss";

const FooterMarketing = () => (
  <div className={styles.footerMarketing}>
    <div className={styles.legalItems}>
      {footerContent.legal.map((item, index) => {
        return (
          <Link to={item.link} className={styles.link} key={index}>
            <span className={styles.legalItem}>
              {item.title}
            </span>
          </Link>
        )
      })}
    </div>
    <div className={styles.socialNetworks}>
      {footerContent.social.networks.map((net, index) => (
        net.display &&
        <Link href={net.link} className={styles.link} key={index}>
          {net.icon === 'fa-facebook' ?
            <img alt="logo" style={{ width: 25, margin: '-10px 10px 0 0' }} src="/img/f_logo_RGB-White_58.png" />
            :
            <i className={`fa icon is-large ${net.icon}`} />
          }
        </Link>
      ))}
    </div>
  </div>
);

export default FooterMarketing;
