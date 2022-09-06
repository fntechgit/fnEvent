import React from "react";
import PropTypes from "prop-types";
import {navigate} from "gatsby";
import {connect} from "react-redux";
import { isEqual } from "lodash";
import Layout from "../components/Layout";
import DisqusComponent from "../components/DisqusComponent";
import AdvertiseComponent from "../components/AdvertiseComponent";
import Etherpad from "../components/Etherpad";
import { MemoizedVideoComponent as VideoComponent } from '../components/VideoComponent';
import TalkComponent from "../components/TalkComponent";
import DocumentsComponent from "../components/DocumentsComponent";
import VideoBanner from "../components/VideoBanner";
import SponsorComponent from "../components/SponsorComponent";
import NoTalkComponent from "../components/NoTalkComponent";
import HeroComponent from "../components/HeroComponent";
import UpcomingEventsComponent from "../components/UpcomingEventsComponent";
import Link from "../components/Link";
import AccessTracker, {AttendeesWidget} from "../components/AttendeeToAttendeeWidgetComponent"
import AttendanceTrackerComponent from "../components/AttendanceTrackerComponent";
import EventFeedbackComponent from '../components/EventFeedbackComponent'
import {PHASES} from '../utils/phasesUtils';
import { getEventById, setEventLastUpdate } from "../actions/event-actions";
import URI from "urijs"
import SupabaseClientBuilder from "../utils/supabaseClientBuilder";
import {
    getEnvVariable,
    SUPABASE_URL,
    SUPABASE_KEY,
} from "../utils/envVariables";
import moment from "moment-timezone";
import _ from 'lodash';
const CHECK_FOR_NOVELTIES_DELAY = 2000;

export const EventPageTemplate = class extends React.Component {

    constructor(props) {
        super(props);

        // attributes
        this._subscription = null;
        this._subscriptionError = false;
        try {
            this._supabase = SupabaseClientBuilder.getClient(getEnvVariable(SUPABASE_URL), getEnvVariable(SUPABASE_KEY));
        }
        catch (e){
            this._supabase = null;
            console.log(e);
        }

        // binds
        this.createRealTimeSubscription = this.createRealTimeSubscription.bind(this);
        this.queryRealTimeDB = this.queryRealTimeDB.bind(this);
        this.checkForPastNovelties = this.checkForPastNovelties.bind(this);
        this.clearRealTimeSubscription = this.clearRealTimeSubscription.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
        this._checkForPastNoveltiesDebounced = _.debounce(this.checkForPastNovelties, CHECK_FOR_NOVELTIES_DELAY);
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
            console.log("EventPageTemplate::queryRealTimeDB ERROR");
            console.log(e);
        }
    }

    createRealTimeSubscription(summit, event, eventId, lastUpdate){
        this._subscriptionError = false;
        console.log("EventPageTemplate::createRealTimeSubscription");
        try {
            this._subscription = this._supabase
                .from(`summit_entity_updates:summit_id=eq.${summit.id}`)
                .on('INSERT', (payload) => {
                    console.log('EventPageTemplate::createRealTimeSubscription Change received (INSERT)', payload)
                    let {new: update} = payload;
                    if (update.entity_type === 'Presentation' && parseInt(update.entity_id) == parseInt(eventId)) {
                        this.props.setEventLastUpdate(moment.utc(update.created_at));
                        this.props.getEventById(eventId, { checkLocal: false, dispatchLoader: false });
                    }
                })
                .on('UPDATE', (payload) => {
                    console.log('EventPageTemplate::createRealTimeSubscription Change received (UPDATE)', payload)
                    let {new: update} = payload;
                    if (update.entity_type === 'Presentation' && parseInt(update.entity_id) == parseInt(eventId)) {
                        this.props.setEventLastUpdate(moment.utc(update.created_at));
                        this.props.getEventById(eventId, { checkLocal: false, dispatchLoader: false });
                    }
                })
                .subscribe((status, e) => {
                    const visibilityState = document.visibilityState;
                    console.log("EventPageTemplate::createRealTimeSubscription subscribe ", status, e, visibilityState);
                    if (status === "SUBSCRIPTION_ERROR") {
                        // init the RT cleaning process
                        this.clearRealTimeSubscription();
                        if (visibilityState  === "hidden") {
                            // if page not visible mark the error for later
                            this._subscriptionError = true
                            return;
                        }
                        // if we are on visible state, then restart the RT
                        window.setTimeout(() => {this.createRealTimeSubscription(summit, event, eventId, lastUpdate)}, 1000);
                    }
                    if (status === "SUBSCRIBED") {
                        // RELOAD
                        // check on demand ( just in case that we missed some Real time update )
                        if(event && eventId) {
                            this._checkForPastNoveltiesDebounced(summit.id, event, eventId, lastUpdate);
                        }
                    }
                })
        }
        catch (e){
            console.log("EventPageTemplate::createRealTimeSubscription ERROR");
            console.log(e);
        }
    }

    checkForPastNovelties(summitId, event, eventId, lastUpdate){
        console.log("EventPageTemplate::checkForPastNovelties", summitId, event, eventId, lastUpdate);
        this.queryRealTimeDB(summitId, parseInt(eventId)).then((res) => {
            if(!res) return;
            let {created_at: lastUpdateNovelty} = res;
            if (lastUpdateNovelty && event) {
                    lastUpdateNovelty = moment.utc(lastUpdateNovelty);
                    // then compare if the novelty date is greater than last edit date of the event
                    if (lastUpdate !== null && lastUpdateNovelty <= lastUpdate){
                        // skip it
                        console.log("EventPageTemplate::checkForPastNovelties: skipping update", lastUpdateNovelty, lastUpdate)
                        return;
                    }
            }
            console.log("EventPageTemplate::checkForPastNovelties: doing update");
            this.props.setEventLastUpdate(lastUpdateNovelty);
            this.props.getEventById(eventId, { checkLocal: false, dispatchLoader: false });

        }).catch((err) => console.log(err));
    }

    clearRealTimeSubscription(){
        if (this._supabase && this._subscription) {
            try {
                console.log("EventPageTemplate::clearRealTimeSubscription");
                this._supabase.removeSubscription(this._subscription);
                this._subscription = null;
            }
            catch (e){
                console.log(e);
            }
        }
    }

    onVisibilityChange(){
        const {eventId, event, summit, lastUpdate} = this.props;
        const visibilityState = document.visibilityState;

        console.log(`EventPage::onVisibilityChange  visibilityState ${visibilityState}`, this._subscriptionError, lastUpdate);

        if(visibilityState === "visible"){

            if(this._subscriptionError) {
                this.createRealTimeSubscription(summit, event, eventId, lastUpdate);
                return;
            }

            this._checkForPastNoveltiesDebounced(summit.id, event, eventId, lastUpdate);
        }
    }

    componentDidMount() {
        const {eventId, event, summit, lastUpdate} = this.props;
        if (parseInt(event?.id) !== parseInt(eventId)) {
            this.props.setEventLastUpdate(null);
            this.props.getEventById(eventId);
        }

        this.createRealTimeSubscription(summit, event, eventId, lastUpdate);

        document.addEventListener( "visibilitychange", this.onVisibilityChange, false)
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.onVisibilityChange)
        this.clearRealTimeSubscription();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {eventId, event} = this.props;
        const {eventId: prevEventId} = prevProps;
        // event id could come as param at uri
        if (parseInt(eventId) !== parseInt(prevEventId) || parseInt(event?.id) !== parseInt(eventId)) {
            this.props.setEventLastUpdate(null);
            this.props.getEventById(eventId);
        }
    }

    onEventChange(ev) {
        const {eventId} = this.props;
        if (parseInt(eventId) !== parseInt(ev.id)) {
            navigate(`/a/event/${ev.id}`);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const {eventId, event, eventsPhases} = this.props;
        if (eventId !== nextProps.eventId) return true;
        if (!isEqual(event, nextProps.event)) return true;
        // compare current event phase with next one
        const currentPhase = eventsPhases.find((e) => parseInt(e.id) === parseInt(eventId))?.phase;
        const nextCurrentPhase = nextProps.eventsPhases.find(
            (e) => parseInt(e.id) === parseInt(eventId)
        )?.phase;
        const finishing = (currentPhase === PHASES.DURING && nextCurrentPhase === PHASES.AFTER);
        return (currentPhase !== nextCurrentPhase && !finishing);
    }

    canRenderVideo = (currentPhase) => {
        const {event} = this.props;
        return (currentPhase >= PHASES.DURING || event.streaming_type === 'VOD') && event.streaming_url;
    };

    render() {

        const {event, user, loading, nowUtc, summit, eventsPhases, eventId, location} = this.props;
        // get current event phase
        const currentPhase = eventsPhases.find((e) => parseInt(e.id) === parseInt(eventId))?.phase;
        const firstHalf = currentPhase === PHASES.DURING ? nowUtc < ((event?.start_date + event?.end_date) / 2) : false;
        const eventQuery = event.streaming_url ? URI(event.streaming_url).search(true) : null;
        const autoPlay = eventQuery?.autoplay !== '0';
        // Start time set into seconds, first number is minutes so it multiply per 60
        const startTime = eventQuery?.start?.split(',').reduce((a, b, index) => (index === 0 ? parseInt(b) * 60 : parseInt(b)) + a, 0);

        // if event is loading or we are still calculating the current phase ...
        if (loading || currentPhase === undefined) {
            return <HeroComponent title="Loading event"/>;
        }

        if (!event) {
            return <HeroComponent title="Event not found" redirectTo="/a/schedule"/>;
        }

        return (
            <React.Fragment>
                {/* <EventHeroComponent /> */}
                <section
                    className="section px-0 py-0"
                    style={{
                        marginBottom:
                            event.class_name !== "Presentation" ||
                            currentPhase < PHASES.DURING  ||
                            !event.streaming_url
                                ? "-3rem"
                                : "",
                    }}
                >
                    <div className="columns is-gapless">
                        {this.canRenderVideo(currentPhase) ? (
                            <div className="column px-0 py-0">
                                <VideoComponent
                                    url={event.streaming_url}
                                    title={event.title}
                                    namespace={summit.name}
                                    firstHalf={firstHalf}
                                    autoPlay={autoPlay}
                                    start={startTime}
                                />
                                {event.meeting_url && <VideoBanner event={event} />}
                            </div>
                        ) : (
                            <div className="column px-0 py-0 is-full-mobile">
                                <NoTalkComponent
                                    currentEventPhase={currentPhase}
                                    event={event}
                                    summit={summit}
                                />
                            </div>
                        )}
                    </div>
                </section>
                <section className="section mt-5 px-0 pt-5 pb-0">
                    <div className="columns mx-0 my-0">
                        <div className="column is-full-mobile">
                            <div className="px-5 py-5">
                                <TalkComponent
                                    currentEventPhase={currentPhase}
                                    event={event}
                                    summit={summit}
                                />
                            </div>
                            { event.allow_feedback &&
                              <div className="px-5 py-5">
                                <EventFeedbackComponent eventId={event.id} />
                              </div>
                            }
                            <div className="px-5 py-0">
                                <SponsorComponent page="event" />
                            </div>
                            {event.etherpad_link && (
                                <div className="column">
                                    <Etherpad
                                        className="talk__etherpad"
                                        etherpad_link={event.etherpad_link}
                                        userName={user.userProfile.first_name}
                                    />
                                </div>
                            )}
                            <UpcomingEventsComponent
                                trackId={event.track ? event.track.id : null}
                                eventCount={4}
                                title={
                                    event.track
                                        ? `Up Next on ${event.track.name}`
                                        : "Up Next"
                                }
                                renderEventLink={(event) => <Link to={`/a/event/${event.id}`}>{event.title}</Link>}
                                allEventsLink={
                                    <Link to={event.track ? `/a/schedule#track=${event.track.id}` : "/a/schedule"}>
                                        View all <span className="sr-only">events</span>
                                    </Link>
                                }
                            />
                            <AccessTracker />
                        </div>
                    </div>
                </section>
            </React.Fragment>
        );
    }
};

const EventPage = ({
                       summit,
                       location,
                       loading,
                       event,
                       eventId,
                       user,
                       eventsPhases,
                       nowUtc,
                       getEventById,
                       setEventLastUpdate,
                       lastUpdate,
                   }) => {
    return (
        <Layout location={location}>
            {event && event.id && (
                <AttendanceTrackerComponent
                    key={`att-tracker-${event.id}`}
                    sourceId={event.id}
                    sourceName="EVENT"
                />
            )}
            <EventPageTemplate
                summit={summit}
                event={event}
                eventId={eventId}
                loading={loading}
                user={user}
                eventsPhases={eventsPhases}
                nowUtc={nowUtc}
                location={location}
                getEventById={getEventById}
                setEventLastUpdate={setEventLastUpdate}
                lastUpdate={lastUpdate}
            />
        </Layout>
    );
};

EventPage.propTypes = {
    loading: PropTypes.bool,
    event: PropTypes.object,
    lastUpdate: PropTypes.object,
    eventId: PropTypes.string,
    user: PropTypes.object,
    eventsPhases: PropTypes.array,
    getEventById: PropTypes.func,
    setEventLastUpdate: PropTypes.func,
};

EventPageTemplate.propTypes = {
    event: PropTypes.object,
    lastUpdate: PropTypes.object,
    loading: PropTypes.bool,
    eventId: PropTypes.string,
    user: PropTypes.object,
    eventsPhases: PropTypes.array,
    getEventById: PropTypes.func,
    setEventLastUpdate: PropTypes.func,
};

const mapStateToProps = ({eventState, summitState, userState, clockState}) => ({
    loading: eventState.loading,
    event: eventState.event,
    user: userState,
    summit: summitState.summit,
    eventsPhases: clockState.events_phases,
    nowUtc: clockState.nowUtc,
    lastUpdate: eventState.lastUpdate,
});

export default connect(mapStateToProps, {
    getEventById,
    setEventLastUpdate,
})(EventPage);