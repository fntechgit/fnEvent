import React from 'react';
import PropTypes from 'prop-types';

import VideoJSPlayer from './VideoJSPlayer';
import VimeoPlayer from "./VimeoPlayer";

import styles from '../styles/video.module.scss';

const checkLiveVideo = (url) => {
    let isLiveVideo = null;
    url.match(/.m3u8/) ? isLiveVideo = true : isLiveVideo = false;
    return isLiveVideo;
};

const checkVimeoVideo = (url) => {
    // this is get from vimeo dash board
    return url.match(/https:\/\/(www\.)?(player\.)?vimeo.com\/(.*)/);
};

const VideoComponent = ({ url, title, namespace, firstHalf, autoPlay, start }) => {
    console.log({ url, title, namespace, firstHalf, autoPlay, start });
    if (url) {
        // vimeo player
        if (checkVimeoVideo(url)) {
            return (
                <VimeoPlayer
                    video={url}
                    autoplay={autoPlay}
                    start={start}
                    className={styles.vimeoPlayer}
                />
            );
        };
        // default mux live
        if (checkLiveVideo(url)) {
            const videoJsOptions = {
                autoplay: autoPlay,
                /*
                 TIP: If you want to use autoplay and improve the chances of it working, use the muted attribute
                 (or the muted option, with Video.js).
                 @see https://blog.videojs.com/autoplay-best-practices-with-video-js/
                 */
                muted: !!autoPlay,
                controls: true,
                fluid: true,
                playsInline: true,
                start: start,
                sources: [{
                    src: url,
                    type: 'application/x-mpegURL'
                }],
            };
            return (
                <VideoJSPlayer title={title} namespace={namespace} firstHalf={firstHalf} {...videoJsOptions} />
            );
        };
        const videoJsOptions = {
            autoplay: autoPlay,
            /*
             TIP: If you want to use autoplay and improve the chances of it working, use the muted attribute
             (or the muted option, with Video.js).
             @see https://blog.videojs.com/autoplay-best-practices-with-video-js/
             */
            muted: !!autoPlay,
            controls: true,
            fluid: true,
            techOrder: ["youtube"],
            sources: [{
                type: "video/youtube",
                src: url
            }],
            youtube: {
                ytControls: 0,
                iv_load_policy: 1
            },
            playsInline: true,
        };
        return (
            <VideoJSPlayer title={title} namespace={namespace} {...videoJsOptions} />
        );
    }
    return (<span className="no-video">No video URL Provided</span>);
};

VideoComponent.propTypes = {
    url: PropTypes.string.isRequired,
    title: PropTypes.string,
    namespace: PropTypes.string,
    firstHalf: PropTypes.bool,
    autoPlay: PropTypes.bool,
};

VideoComponent.defaultProps = {
    title: '',
    namespace: '',
    firstHalf: true,
    autoPlay: false,
};

export default VideoComponent;

const videoPropsAreEqual = (prevVideo, nextVideo) => prevVideo.url === nextVideo.url;

export const MemoizedVideoComponent = React.memo(VideoComponent, videoPropsAreEqual);
