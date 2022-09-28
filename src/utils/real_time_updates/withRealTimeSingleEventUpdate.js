import React from "react";
import _ from 'lodash';
import SupabaseClientBuilder from "../supabaseClientBuilder";
import { getEnvVariable, SUPABASE_KEY, SUPABASE_URL, REAL_TIME_UPDATES_STRATEGY } from "../envVariables";
import moment from "moment-timezone";
import RealTimeSingleEventStrategyFactory from "./strategies/RealTimeSingleEventStrategyFactory";
import PropTypes from 'prop-types';


const CHECK_FOR_NOVELTIES_DELAY = 2000;

/**
 *
 * @param WrappedComponent
 * @returns {{new(*): {createRealTimeSubscription(*, *, *, *): void, checkForPastNovelties(*, *, *, *): void, render: {(): *, (): React.ReactNode}, queryRealTimeDB(*, *): Promise<boolean|*|undefined>, componentWillUnmount: {(): void, (): void}, onVisibilityChange(): void, componentDidUpdate: {(*, *, *): void, (prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void}, clearRealTimeSubscription(): void, componentDidMount: {(): void, (): void}, shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean, componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void, getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any, componentWillMount?(): void, UNSAFE_componentWillMount?(): void, componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, context: any, setState<K extends keyof S>(state: (((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | Pick<S, K> | S | null), callback?: () => void): void, forceUpdate(callback?: () => void): void, readonly props: Readonly<P> & Readonly<{children?: React.ReactNode | undefined}>, state: Readonly<S>, refs: {[p: string]: React.ReactInstance}}, contextType?: React.Context<any> | undefined, new<P, S>(props: (Readonly<P> | P)): {createRealTimeSubscription(*, *, *, *): void, checkForPastNovelties(*, *, *, *): void, render: {(): *, (): React.ReactNode}, queryRealTimeDB(*, *): Promise<boolean|*|undefined>, componentWillUnmount: {(): void, (): void}, onVisibilityChange(): void, componentDidUpdate: {(*, *, *): void, (prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void}, clearRealTimeSubscription(): void, componentDidMount: {(): void, (): void}, shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean, componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void, getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any, componentWillMount?(): void, UNSAFE_componentWillMount?(): void, componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, context: any, setState<K extends keyof S>(state: (((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | Pick<S, K> | S | null), callback?: () => void): void, forceUpdate(callback?: () => void): void, readonly props: Readonly<P> & Readonly<{children?: React.ReactNode | undefined}>, state: Readonly<S>, refs: {[p: string]: React.ReactInstance}}, new<P, S>(props: P, context: any): {createRealTimeSubscription(*, *, *, *): void, checkForPastNovelties(*, *, *, *): void, render: {(): *, (): React.ReactNode}, queryRealTimeDB(*, *): Promise<boolean|*|undefined>, componentWillUnmount: {(): void, (): void}, onVisibilityChange(): void, componentDidUpdate: {(*, *, *): void, (prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void}, clearRealTimeSubscription(): void, componentDidMount: {(): void, (): void}, shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean, componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void, getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any, componentWillMount?(): void, UNSAFE_componentWillMount?(): void, componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, context: any, setState<K extends keyof S>(state: (((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | Pick<S, K> | S | null), callback?: () => void): void, forceUpdate(callback?: () => void): void, readonly props: Readonly<P> & Readonly<{children?: React.ReactNode | undefined}>, state: Readonly<S>, refs: {[p: string]: React.ReactInstance}}, prototype: {createRealTimeSubscription(*, *, *, *): void, checkForPastNovelties(*, *, *, *): void, render: {(): *, (): React.ReactNode}, queryRealTimeDB(*, *): Promise<boolean|*|undefined>, componentWillUnmount: {(): void, (): void}, onVisibilityChange(): void, componentDidUpdate: {(*, *, *): void, (prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void}, clearRealTimeSubscription(): void, componentDidMount: {(): void, (): void}, shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean, componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void, getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any, componentWillMount?(): void, UNSAFE_componentWillMount?(): void, componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void, componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void, context: any, setState<K extends keyof S>(state: (((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | Pick<S, K> | S | null), callback?: () => void): void, forceUpdate(callback?: () => void): void, readonly props: Readonly<P> & Readonly<{children?: React.ReactNode | undefined}>, state: Readonly<S>, refs: {[p: string]: React.ReactInstance}}}}
 */
const withRealTimeSingleEventUpdate = WrappedComponent => {

    return class extends React.Component {

        static propTypes = {
            eventId: PropTypes.any,
            event: PropTypes.object,
            summit: PropTypes.object,
            lastUpdate: PropTypes.any,
            setEventLastUpdate:PropTypes.func,
            getEventById :PropTypes.func,
        }

        static defaultProps = {

        }

        constructor(props) {
            super(props);

            // binds

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
            this._currentStrategy = RealTimeSingleEventStrategyFactory.build
            (
                getEnvVariable(REAL_TIME_UPDATES_STRATEGY),
                (payload) => {
                    const {eventId, setEventLastUpdate, getEventById} = this.props;
                    setEventLastUpdate(moment.utc(payload.created_at));
                    getEventById(eventId, { checkLocal: false, dispatchLoader: false });
                },
                this._checkForPastNoveltiesDebounced
            );
        }

        async queryRealTimeDB(summitId, eventId) {

            if(!this._supabase) return Promise.resolve(false);

            try {
                const res = await this._supabase
                    .from('summit_entity_updates')
                    .select('id,created_at,summit_id,entity_id,entity_type,entity_op')
                    .eq('summit_id', summitId)
                    .eq('entity_id', eventId)
                    .eq('entity_type', 'Presentation')
                    .order('id', {ascending: false})
                    .limit(1);

                if (res.error) throw new Error(res.error)

                if (res.data && res.data.length > 0) {
                    return res.data[0];
                }
                return false;
            }
            catch (e){
                console.log("withRealTimeSingleEventUpdate::queryRealTimeDB ERROR");
                console.log(e);
            }
        }

        /**
         *
         * @param summit
         * @param event
         * @param eventId
         * @param lastUpdate
         */
        createRealTimeSubscription(summit, event, eventId, lastUpdate){

            console.log("withRealTimeSingleEventUpdate::createRealTimeSubscription");

            try {
                this._currentStrategy.create(summit, event, eventId, lastUpdate);
                // always check for novelty bc to avoid former updates emitted before RT subscription
                if(event && eventId) {
                    this._checkForPastNoveltiesDebounced(summit.id, event, eventId, lastUpdate);
                }
            }
            catch (e){
                console.log("withRealTimeSingleEventUpdate::createRealTimeSubscription ERROR");
                console.log(e);
            }
        }

        /**
         *
         * @param summitId
         * @param event
         * @param eventId
         * @param lastUpdate
         */
        checkForPastNovelties(summitId, event, eventId, lastUpdate){
            console.log("withRealTimeSingleEventUpdate::checkForPastNovelties", summitId, event, eventId, lastUpdate);
            this.queryRealTimeDB(summitId, parseInt(eventId)).then((res) => {
                if(!res) return;
                let {created_at: lastUpdateNovelty} = res;
                if (lastUpdateNovelty && event) {
                    lastUpdateNovelty = moment.utc(lastUpdateNovelty);
                    // then compare if the novelty date is greater than last edit date of the event
                    if (lastUpdate !== null && lastUpdateNovelty <= lastUpdate){
                        // skip it
                        console.log("withRealTimeSingleEventUpdate::checkForPastNovelties: skipping update", lastUpdateNovelty, lastUpdate)
                        return;
                    }
                }
                console.log("withRealTimeSingleEventUpdate::checkForPastNovelties: doing update");
                this.props.setEventLastUpdate(lastUpdateNovelty);
                this.props.getEventById(eventId, { checkLocal: false, dispatchLoader: false });

            }).catch((err) => console.log(err));
        }

        clearRealTimeSubscription(){
            console.log("withRealTimeSingleEventUpdate::clearRealTimeSubscription");

           if(this._currentStrategy)
               this._currentStrategy.close();
        }

        onVisibilityChange(){

            const {eventId, event, summit, lastUpdate} = this.props;
            const visibilityState = document.visibilityState;

            console.log(`withRealTimeSingleEventUpdate::onVisibilityChange visibilityState ${visibilityState}`);

            if(visibilityState === "visible" && this._currentStrategy && this._currentStrategy.manageBackgroundErrors()){

                if(this._currentStrategy.hasBackgroundError()) {
                    this.createRealTimeSubscription(summit, event, eventId, lastUpdate);
                    return;
                }

                this._checkForPastNoveltiesDebounced(summit.id, event, eventId, lastUpdate);
            }
        }

        componentDidMount() {
            const {eventId, event, summit, lastUpdate, setEventLastUpdate} = this.props;

            if (parseInt(event?.id) !== parseInt(eventId)) {
                setEventLastUpdate(null);
            }

            this.createRealTimeSubscription(summit, event, eventId, lastUpdate);

            document.addEventListener( "visibilitychange", this.onVisibilityChange, false)
        }

        componentDidUpdate(prevProps, prevState, snapshot) {
            const {eventId, event, setEventLastUpdate} = this.props;
            const {eventId: prevEventId} = prevProps;
            // event id could come as param at uri
            if (parseInt(eventId) !== parseInt(prevEventId) || parseInt(event?.id) !== parseInt(eventId)) {
                // reset state
                setEventLastUpdate(null);
            }
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

export default withRealTimeSingleEventUpdate;