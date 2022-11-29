import React from "react";
import PropTypes from "prop-types";

const withFeedsWorker = WrappedComponent => {

    return class extends React.Component {

        static propTypes = {
            summit : PropTypes.object.isRequired,
            syncData : PropTypes.func.isRequired,
            staticJsonFilesBuildTime : PropTypes.array.isRequired,
        }

        static defaultProps = {}

        constructor(props) {
            super(props);
        }

        componentDidMount() {
            const worker = new Worker(new URL('../workers/feeds.worker.js', import.meta.url), {type: 'module'});

            const { summit, syncData, staticJsonFilesBuildTime } = this.props;

            worker.postMessage({
                summitId : parseInt(summit.id),
                staticJsonFilesBuildTime: JSON.stringify(staticJsonFilesBuildTime)
            });

            worker.onmessage = ({ data: {  eventsData, summitData, speakersData, extraQuestionsData, eventsIDXData, speakersIXData } }) => {
                syncData( eventsData, summitData, speakersData, extraQuestionsData, eventsIDXData, speakersIXData);
                worker.terminate();
            };
        }

        render() {
            return (
                <WrappedComponent {...this.props} />
            );
        }
    }
};

export default withFeedsWorker;