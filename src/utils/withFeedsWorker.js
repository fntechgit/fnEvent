import React from "react";
import {connect} from "react-redux";
import { syncData } from '../actions/base-actions';

/**
 * @param WrappedComponent
 * @returns {ConnectedComponent<HOC, DistributiveOmit<GetLibraryManagedProps<HOC>, keyof Shared<{staticJsonFilesBuildTime: *, summit: *} & ResolveThunks<{syncData: ((function(*, *, *, *, *, *): ((function(*, *): Promise<void>)|*))|*)}>, GetLibraryManagedProps<HOC>>>>}
 */
const withFeedsWorker = WrappedComponent => {

    class HOC extends React.Component {

        static propTypes = {
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

            worker.onerror = (event) => {
                console.log('There is an error with your worker!', event);
            }

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

    const mapStateToProps = ({ settingState, summitState}) => ({
        summit: summitState?.summit,
        staticJsonFilesBuildTime: settingState.staticJsonFilesBuildTime,
    });

    return connect(mapStateToProps, {
        syncData,
    })(HOC);
};

export default withFeedsWorker;