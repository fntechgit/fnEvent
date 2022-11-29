import React from "react";
import _ from 'lodash';
import SupabaseClientBuilder from "../supabaseClientBuilder";
import { getEnvVariable, SUPABASE_KEY, SUPABASE_URL, REAL_TIME_UPDATES_STRATEGY } from "../envVariables";
import moment from "moment-timezone";
import RealTimeStrategyFactory from "./strategies/RealTimeStrategyFactory";
import ProcessEntityUpdateStrategyFactory from "./strategies/ProcessEntityUpdateStrategyFactory";
import PropTypes from "prop-types";
const CHECK_FOR_NOVELTIES_DELAY = 2000;

/**
 *
 * @param WrappedComponent
 * @returns {{propTypes: {}, defaultProps: {}, new(*): {render: {(): *, (): React.ReactNode}, componentWillUnmount: {(), (): void}, componentDidMount: {(), (): void}, shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean, componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void, getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any, componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void, componentWillMount?(): void, UNSAFE_componentWillMount?(): void, componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, context: any, setState<K extends keyof S>(state: (((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | Pick<S, K> | S | null), callback?: () => void): void, forceUpdate(callback?: () => void): void, readonly props: Readonly<P> & Readonly<{children?: React.ReactNode | undefined}>, state: Readonly<S>, refs: {[p: string]: React.ReactInstance}}, contextType?: React.Context<any> | undefined, new<P, S>(props: (Readonly<P> | P)): {render: {(): *, (): React.ReactNode}, componentWillUnmount: {(), (): void}, componentDidMount: {(), (): void}, shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean, componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void, getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any, componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void, componentWillMount?(): void, UNSAFE_componentWillMount?(): void, componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, context: any, setState<K extends keyof S>(state: (((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | Pick<S, K> | S | null), callback?: () => void): void, forceUpdate(callback?: () => void): void, readonly props: Readonly<P> & Readonly<{children?: React.ReactNode | undefined}>, state: Readonly<S>, refs: {[p: string]: React.ReactInstance}}, new<P, S>(props: P, context: any): {render: {(): *, (): React.ReactNode}, componentWillUnmount: {(), (): void}, componentDidMount: {(), (): void}, shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean, componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void, getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any, componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void, componentWillMount?(): void, UNSAFE_componentWillMount?(): void, componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, context: any, setState<K extends keyof S>(state: (((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | Pick<S, K> | S | null), callback?: () => void): void, forceUpdate(callback?: () => void): void, readonly props: Readonly<P> & Readonly<{children?: React.ReactNode | undefined}>, state: Readonly<S>, refs: {[p: string]: React.ReactInstance}}, prototype: {render: {(): *, (): React.ReactNode}, componentWillUnmount: {(), (): void}, componentDidMount: {(), (): void}, shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean, componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void, getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any, componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void, componentWillMount?(): void, UNSAFE_componentWillMount?(): void, componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, context: any, setState<K extends keyof S>(state: (((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | Pick<S, K> | S | null), callback?: () => void): void, forceUpdate(callback?: () => void): void, readonly props: Readonly<P> & Readonly<{children?: React.ReactNode | undefined}>, state: Readonly<S>, refs: {[p: string]: React.ReactInstance}}}}
 */
const withRealTimeUpdates = WrappedComponent => {

    return class extends React.Component {

        static propTypes = {
            summit : PropTypes.object.isRequired,
            synchEntityData: PropTypes.func.isRequired,
        }

        static defaultProps = {

        }

        constructor(props) {
            super(props);

            this.createRealTimeSubscription = this.createRealTimeSubscription.bind(this);
            this.queryRealTimeDB = this.queryRealTimeDB.bind(this);
            this.checkForPastNovelties = this.checkForPastNovelties.bind(this);
            this.clearRealTimeSubscription = this.clearRealTimeSubscription.bind(this);
            this.onVisibilityChange = this.onVisibilityChange.bind(this);
            this._checkForPastNoveltiesDebounced = _.debounce(this.checkForPastNovelties, CHECK_FOR_NOVELTIES_DELAY);

            try {
                this._supabase = SupabaseClientBuilder.getClient(getEnvVariable(SUPABASE_URL), getEnvVariable(SUPABASE_KEY));
            }
            catch (e){
                this._supabase = null;
                console.log(e);
            }

            // attributes
            this._currentStrategy = RealTimeStrategyFactory.build
            (
                getEnvVariable(REAL_TIME_UPDATES_STRATEGY),
                (payload) => {
                        console.log('withRealTimeUpdates::callback', payload);

                     const strategy = ProcessEntityUpdateStrategyFactory.build(this.props, payload);
                     if(strategy == null) return;

                     strategy.process(payload);

                    },
                this._checkForPastNoveltiesDebounced
            );
        }

        /**
         *
         * @param summitId
         * @param lastBuild
         * @returns {Promise<*|boolean>}
         */
        async queryRealTimeDB(summitId, lastBuild) {

            if(!this._supabase) return Promise.resolve(false);

            try {
                const res = await this._supabase
                    .from('summit_entity_updates')
                    .select('id,created_at,summit_id,entity_id,entity_type,entity_op')
                    .eq('summit_id', summitId)
                    .gte('created_at', new Date(lastBuild).toUTCString())
                    .order('id', {ascending: false})
                    .limit(1);

                if (res.error)
                    throw new Error(res.error)

                if (res.data && res.data.length > 0) {
                    return res.data[0];
                }
                return false;
            }
            catch (e){
                console.log("withRealTimeUpdates::queryRealTimeDB ERROR");
                console.log(e);
            }
        }


        /**
         * @param summitId
         * @param lastBuild
         */
        createRealTimeSubscription(summitId, lastBuild){
            try {
                this._currentStrategy?.create(summitId, lastBuild);
                // always check for novelty bc to avoid former updates emitted before RT subscription
                this._checkForPastNoveltiesDebounced(summitId, lastBuild);
            }
            catch (e){
                console.log('withRealTimeUpdates::createRealTimeSubscription', e);
            }
        }

        /**
         * @param summitId
         * @param lastBuild
         */
        checkForPastNovelties(summitId, lastBuild){
            console.log("withRealTimeUpdates::checkForPastNovelties", summitId, lastBuild);
            this.queryRealTimeDB(summitId, lastBuild).then((res) => {
                if(!res) return;
                let {created_at: lastUpdateNovelty} = res;
                if (lastUpdateNovelty) {
                    lastUpdateNovelty = moment.utc(lastUpdateNovelty);
                    // update last build time

                }
                console.log("withRealTimeUpdates::checkForPastNovelties: doing update", res);

            }).catch((err) => console.log(err));
        }

        clearRealTimeSubscription(){
            console.log("withRealTimeUpdates::clearRealTimeSubscription");

            if(this._currentStrategy)
                this._currentStrategy.close();
        }

        onVisibilityChange() {
            const { summit , lastBuild } = this.props;
            const visibilityState = document.visibilityState;

            if(visibilityState === "visible" && this._currentStrategy && this._currentStrategy.manageBackgroundErrors()){

                if(this._currentStrategy.hasBackgroundError()) {
                    this.createRealTimeSubscription(summit?.id, lastBuild);
                    return;
                }

                this._checkForPastNoveltiesDebounced(summit?.id, lastBuild);
            }
        }

        componentDidMount() {
            const { summit, lastBuild } = this.props;

            this.createRealTimeSubscription(summit?.id, lastBuild);

            document.addEventListener( "visibilitychange", this.onVisibilityChange, false)
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
};

export default withRealTimeUpdates;