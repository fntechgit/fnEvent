import React from "react"
import { navigate } from "gatsby";

import styles from '../styles/poster-components.module.scss'

const PosterLiveSession = ({ poster, ctaText }) => {

    const goToLiveSession = (url) => {
        const internal = /^\/(?!\/)/.test(url);
        if (!internal) {
            const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
            if (newWindow) newWindow.opener = null;
        } else navigate(url);
    }

    return (
        <div className={styles.posterJoinContainer}>
            <span>
                Live session with authors
            </span>
            <button onClick={() => goToLiveSession(poster.meeting_url)} className="poster-button button">
                <b dangerouslySetInnerHTML={{ __html: ctaText }} />
            </button>
        </div>
    )
}

PosterLiveSession.defaultProps = {
    ctaText: 'Join Now'
}

export default PosterLiveSession;