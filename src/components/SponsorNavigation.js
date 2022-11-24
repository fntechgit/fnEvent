import React, { useState, useEffect, useRef } from 'react'
import { navigate } from 'gatsby'

import { getSponsorURL } from '../utils/urlFormating'

import styles from '../styles/sponsor-page.module.scss'

const SponsorNavigation = ({ currentSponsor, sponsors }) => {
    
    const localSponsors = sponsors.filter(e => e.is_published);

    const sponsorIndex = localSponsors.findIndex(e => e.id === currentSponsor.id)

    const formatUrl = (index) => {
        return getSponsorURL(localSponsors[index].id, localSponsors[index].company.name);
    }

    const goToPrevSponsor = () => {
        const sponsorUrl = sponsorIndex - 1 < 0 ? formatUrl(localSponsors.length - 1) : formatUrl(sponsorIndex - 1)
        navigate(`/a/sponsor/${sponsorUrl}`);
    }

    const goToNextSponsor = () => {
        const sponsorUrl = sponsorIndex + 1 > localSponsors.length -1 ? formatUrl(0) : formatUrl(sponsorIndex + 1)
        navigate(`/a/sponsor/${sponsorUrl}`);
    }

    return (
        <div className={`${styles.sponsorNavigationWrapper} section px-5 pt-5 pb-0`}>
            <button className={`${styles.button} button is-large`} style={{ backgroundColor: `${currentSponsor.sponsorColor}` }} onClick={() => goToPrevSponsor()}>
                <i className={`fa fa-2x fa-chevron-left icon`} />
                <b>Back</b>
            </button>
            <button className={`${styles.button} button is-large`} style={{ backgroundColor: `${currentSponsor.sponsorColor}` }} onClick={() => goToNextSponsor()}>
                <b>Next</b>
                <i className={`fa fa-2x fa-chevron-right icon`} />
            </button>
        </div>
    )
}

export default SponsorNavigation