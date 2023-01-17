import React from "react";
import _ from 'lodash';
import SupabaseClientBuilder from "../supabaseClientBuilder";
import {getEnvVariable, REAL_TIME_UPDATES_STRATEGY, SUPABASE_KEY, SUPABASE_URL} from "../envVariables";
import RealTimeStrategyFactory from "./strategies/RealTimeStrategyFactory";
import PropTypes from "prop-types";
import { synchEntityData } from "../../actions/update-data-actions";
import { updateLastCheckForNovelties } from "../../actions/base-actions";
import {connect} from 'react-redux'
import { getAccessToken } from "openstack-uicore-foundation/lib/security/methods";

const CHECK_FOR_NOVELTIES_DELAY = 2000;

/**
 * @param WrappedComponent
 * @returns {{propTypes: {}, defaultProps: {}, new(*): {render: {(): *, (): React.ReactNode}, componentWillUnmount: {(), (): void}, componentDidMount: {(), (): void}, shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean, componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void, getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any, componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void, componentWillMount?(): void, UNSAFE_componentWillMount?(): void, componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, context: any, setState<K extends keyof S>(state: (((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | Pick<S, K> | S | null), callback?: () => void): void, forceUpdate(callback?: () => void): void, readonly props: Readonly<P> & Readonly<{children?: React.ReactNode | undefined}>, state: Readonly<S>, refs: {[p: string]: React.ReactInstance}}, contextType?: React.Context<any> | undefined, new<P, S>(props: (Readonly<P> | P)): {render: {(): *, (): React.ReactNode}, componentWillUnmount: {(), (): void}, componentDidMount: {(), (): void}, shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean, componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void, getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any, componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void, componentWillMount?(): void, UNSAFE_componentWillMount?(): void, componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, context: any, setState<K extends keyof S>(state: (((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | Pick<S, K> | S | null), callback?: () => void): void, forceUpdate(callback?: () => void): void, readonly props: Readonly<P> & Readonly<{children?: React.ReactNode | undefined}>, state: Readonly<S>, refs: {[p: string]: React.ReactInstance}}, new<P, S>(props: P, context: any): {render: {(): *, (): React.ReactNode}, componentWillUnmount: {(), (): void}, componentDidMount: {(), (): void}, shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean, componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void, getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any, componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void, componentWillMount?(): void, UNSAFE_componentWillMount?(): void, componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, context: any, setState<K extends keyof S>(state: (((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | Pick<S, K> | S | null), callback?: () => void): void, forceUpdate(callback?: () => void): void, readonly props: Readonly<P> & Readonly<{children?: React.ReactNode | undefined}>, state: Readonly<S>, refs: {[p: string]: React.ReactInstance}}, prototype: {render: {(): *, (): React.ReactNode}, componentWillUnmount: {(), (): void}, componentDidMount: {(), (): void}, shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean, componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void, getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any, componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void, componentWillMount?(): void, UNSAFE_componentWillMount?(): void, componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, context: any, setState<K extends keyof S>(state: (((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | Pick<S, K> | S | null), callback?: () => void): void, forceUpdate(callback?: () => void): void, readonly props: Readonly<P> & Readonly<{children?: React.ReactNode | undefined}>, state: Readonly<S>, refs: {[p: string]: React.ReactInstance}}}}
 */
const withRealTimeUpdates = WrappedComponent => {

    class HOC extends React.Component {

        static propTypes = {
            summit: PropTypes.object.isRequired,
        }

        static defaultProps = {}

        constructor(props) {
            super(props);


            let _this = this;
            this.createRealTimeSubscription = this.createRealTimeSubscription.bind(this);
            this.queryRealTimeDB = this.queryRealTimeDB.bind(this);
            this.checkForPastNovelties = this.checkForPastNovelties.bind(this);
            this.clearRealTimeSubscription = this.clearRealTimeSubscription.bind(this);
            this.onVisibilityChange = this.onVisibilityChange.bind(this);
            this.processUpdates = this.processUpdates.bind(this);

            this._checkForPastNoveltiesDebounced = _.debounce(this.checkForPastNovelties, CHECK_FOR_NOVELTIES_DELAY);

            try {
                this._supabase = SupabaseClientBuilder.getClient(getEnvVariable(SUPABASE_URL), getEnvVariable(SUPABASE_KEY));
            } catch (e) {
                this._supabase = null;
                console.log(e);
            }

            // attributes
            this._currentStrategy = RealTimeStrategyFactory.build
            (
                getEnvVariable(REAL_TIME_UPDATES_STRATEGY),
                (payload) => {
                        return _this.processUpdates([payload]);
                },
                this._checkForPastNoveltiesDebounced
            );
        }

        /**
         *
         * @param updates
         * @returns {Promise<void>}
         */
        async processUpdates(updates) {

            const {summit, allEvents, allIDXEvents, allSpeakers, allIDXSpeakers, synchEntityData} = this.props;

            let accessToken = null;
            try {
                accessToken = await getAccessToken();
            } catch (e) {
                console.log('withRealTimeUpdates::processUpdates getAccessToken error: ', e);
            }

            const worker = new Worker(new URL('../../workers/synch.worker.js', import.meta.url), {type: 'module'});

            worker.postMessage({
                accessToken: accessToken,
                noveltiesArray: JSON.stringify(updates),
                summit: JSON.stringify(summit),
                allEvents: JSON.stringify(allEvents),
                allIDXEvents: JSON.stringify(allIDXEvents),
                allSpeakers: JSON.stringify(allSpeakers),
                allIDXSpeakers: JSON.stringify(allIDXSpeakers),
            });

            worker.onerror = (event) => {
                console.log('withRealTimeUpdates::processUpdates There is an error with your worker!', event);
                alert(event.message + " (" + event.filename + ":" + event.lineno + ")");
            }

            worker.onmessage = ({
                                    data: {
                                        payload,
                                        entity,
                                        summit,
                                        eventsData,
                                        allIDXEvents: newAllIDXEvents,
                                        allSpeakers: newAllSpeakers,
                                        allIDXSpeakers: newAllIDXSpeakers
                                    }
                                }) => {

                console.log('withRealTimeUpdates::processUpdates calling synch worker on message ');

                synchEntityData
                (
                    payload,
                    entity,
                    summit,
                    eventsData,
                    newAllIDXEvents,
                    newAllSpeakers,
                    newAllIDXSpeakers
                )
                console.log('withRealTimeUpdates::processUpdates terminating worker');
                worker.terminate();
            }
        }

        /**
         *
         * @param summitId
         * @param lastCheckForNovelties
         * @returns {Promise<*|boolean>}
         */
        async queryRealTimeDB(summitId, lastCheckForNovelties) {

            if (!this._supabase) return Promise.resolve(false);

            try {
                const res = await this._supabase
                    .from('summit_entity_updates')
                    .select('id,created_at,summit_id,entity_id,entity_type,entity_operator')
                    .eq('summit_id', summitId)
                    .gt('created_at', lastCheckForNovelties)
                    .order('id', {ascending: true});

                if (res.error)
                    throw new Error(res.error)

                if (res.data && res.data.length > 0) {
                    return res.data;
                }

                return false;
            } catch (e) {
                console.log("withRealTimeUpdates::queryRealTimeDB ERROR");
                console.log(e);
            }
        }


        /**
         * @param summitId
         * @param lastCheckForNovelties
         */
        createRealTimeSubscription(summitId, lastCheckForNovelties) {
            try {
                console.log(`withRealTimeUpdates::createRealTimeSubscription summitId ${summitId} lastCheckForNovelties ${lastCheckForNovelties}`);
                this._currentStrategy?.create(summitId, lastCheckForNovelties);
                // always check for novelty bc to avoid former updates emitted before RT subscription
                this._checkForPastNoveltiesDebounced(summitId, lastCheckForNovelties);
            } catch (e) {
                console.log('withRealTimeUpdates::createRealTimeSubscription', e);
            }
        }

        /**
         * @param summitId
         * @param lastCheckForNovelties
         */
        checkForPastNovelties(summitId, lastCheckForNovelties) {
            console.log("withRealTimeUpdates::checkForPastNovelties", summitId, lastCheckForNovelties);
            const _this = this;
            this.queryRealTimeDB(summitId, lastCheckForNovelties).then((res) => {
                if (!res) return;

                console.log('queryRealTimeDB::callback', res);

                const {updateLastCheckForNovelties} = _this.props;

                _this.processUpdates(res);

                const lastP = res.pop();
                let {created_at: lastUpdateNovelty} = lastP;
                if (lastUpdateNovelty) {
                    // update lastCheckForNovelties
                    console.log("withRealTimeUpdates::checkForPastNovelties updateLastCheckForNovelties", lastUpdateNovelty);
                    updateLastCheckForNovelties(lastUpdateNovelty);
                }

            }).catch((err) => console.log(err));
        }

        clearRealTimeSubscription() {
            console.log("withRealTimeUpdates::clearRealTimeSubscription");

            if (this._currentStrategy)
                this._currentStrategy.close();
        }

        onVisibilityChange() {
            const {summit, lastCheckForNovelties} = this.props;
            const visibilityState = document.visibilityState;

            if (visibilityState === "visible" && this._currentStrategy && this._currentStrategy.manageBackgroundErrors()) {

                if (this._currentStrategy.hasBackgroundError()) {
                    this.createRealTimeSubscription(summit?.id, lastCheckForNovelties);
                    return;
                }

                this._checkForPastNoveltiesDebounced(summit?.id, lastCheckForNovelties);
            }
        }

        componentDidMount() {
            const {summit, lastCheckForNovelties} = this.props;

            this.createRealTimeSubscription(summit?.id, lastCheckForNovelties);

            document.addEventListener("visibilitychange", this.onVisibilityChange, false)
        }

        componentWillUnmount() {
            document.removeEventListener("visibilitychange", this.onVisibilityChange)
            this.clearRealTimeSubscription();
        }

        render() {
            return (
                <WrappedComponent {...this.props} />
            );
        }
    }

    const mapStateToProps = ({speakerState, allSchedulesState, settingState, summitState}) => ({
        summit: summitState?.summit,
        staticJsonFilesBuildTime: settingState.staticJsonFilesBuildTime,
        lastCheckForNovelties: settingState.lastCheckForNovelties,
        allEvents: allSchedulesState.allEvents,
        allIDXEvents: allSchedulesState.allIDXEvents,
        allSpeakers: speakerState.speakers,
        allIDXSpeakers: speakerState.allIDXSpeakers,
    });

    return connect(mapStateToProps, {
        synchEntityData,
        updateLastCheckForNovelties,
    })(HOC);
};

export default withRealTimeUpdates;