import React from "react"

const VideoBanner = ({ event }) => {

  return (
    <div className="join-zoom-container">
      <span>
        Share your video feed and virtually join the RDC22 keynote audience!
      </span>
      <a className="zoom-link" href={event.meeting_url} target="_blank" rel="noreferrer">
        <button className="zoom-button button">
          <b>Join now</b>
        </button>
      </a>
    </div>
  )
}

export default VideoBanner;