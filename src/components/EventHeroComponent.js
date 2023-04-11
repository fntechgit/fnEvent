import React from 'react'
import { connect } from "react-redux";

import styles from '../styles/event-hero.module.scss'

const EventHeroComponent = ({marketingPageSettings}) => (
  <section className="hero">
    <div className={`${styles.heroEvents} columns`}>
      <div className={'column is-12'}>
        <div className={`${styles.heroBody} hero-body`}>
          <div className={`${styles.heroEventContainer}`}>
            <div>
              <span className={styles.title}>
                {marketingPageSettings.hero.title}
              </span>
              <span className={styles.subtitle}>
              {marketingPageSettings.hero.subTitle}
              </span>
            </div>
            <div className={styles.date}>
              <span>{marketingPageSettings.hero.date}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const mapStateToProps = ({settingState}) => ({
  marketingPageSettings: settingState.marketingPageSettings
});

export default connect(mapStateToProps, {})(EventHeroComponent);