import React from "react";
import {connect} from "react-redux";
import { syncData, updateLastCheckForNovelties } from '../actions/base-actions';

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
            this._worker = null;
        }

        componentDidMount() {

            if(this._worker){
                this._worker.terminate();
            }

            this._worker = new Worker(new URL('../workers/feeds.worker.js', import.meta.url), {type: 'module'});

            this._worker.onerror = (event) => {
                console.log('withFeedsWorker::componentDidMount There is an error with your worker!', event);
                alert(event.message + " (" + event.filename + ":" + event.lineno + ")");
            }

            const { summit, syncData, staticJsonFilesBuildTime, updateLastCheckForNovelties } = this.props;

            this._worker.postMessage({
                summitId : parseInt(summit.id),
                staticJsonFilesBuildTime: JSON.stringify(staticJsonFilesBuildTime)
            });

            this._worker.onmessage = ({ data: {
                eventsData,
                summitData,
                speakersData,
                eventsIDXData,
                speakersIXData,
                lastModified} }) => {

                if(lastModified > 0){
                    console.log(`withFeedsWorker::componentDidMount setting lastModified ${lastModified}`);
                    updateLastCheckForNovelties(lastModified);
                }
                syncData( eventsData, summitData, speakersData, eventsIDXData, speakersIXData);
                this._worker.terminate();
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
        updateLastCheckForNovelties,
    })(HOC);
};

export default withFeedsWorker;