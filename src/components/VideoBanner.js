import React from "react"

const VideoBanner = ({ event, ctaText }) => {

  return (
    <div className="join-zoom-container">
      <span>
        Click to Gain Speaker Access
      </span>
      <a className="zoom-link" href={event.meeting_url} target="_blank" rel="noreferrer">
        <button className="zoom-button button">
          <b dangerouslySetInnerHTML={{ __html: ctaText }} />
        </button>
      </a>
    </div>
  )
}

VideoBanner.defaultProps = {
  ctaText: 'Join Now'
}

export default VideoBanner;