import React from "react";
import PropTypes from "prop-types";
import {navigate} from "gatsby";
import {connect} from "react-redux";
import Layout from "../components/Layout";
import DisqusComponent from "../components/DisqusComponent";
import AdvertiseComponent from "../components/AdvertiseComponent";
import Etherpad from "../components/Etherpad";
import VideoComponent from "../components/VideoComponent";
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
import {PHASES} from '../utils/phasesUtils';
import {getEventById} from "../actions/event-actions";
import URI from "urijs"
import SupabaseClientBuilder from "../utils/supabaseClientBuilder";
import {
    getEnvVariable,
    SUPABASE_URL,
    SUPABASE_KEY,
} from "../utils/envVariables";
import moment from "moment-timezone";

export const EventPageTemplate = class extends React.Component {

    constructor(props) {
        super(props);

        // attributes
        this._subscription = null;

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
    }

    async queryRealTimeDB(summitId, eventId) {

        if(!this._supabase) return Promise.resolve();

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
    }

    createRealTimeSubscription(summit, eventId){

        if (this._subscription && this._subscription.state === 'joined') {
            return
        }

        console.log("EventPageTemplate::createRealTimeSubscription");
        this._subscription = this._supabase
            .from(`summit_entity_updates:summit_id=eq.${summit.id}`)
            .on('INSERT', (payload) => {
                console.log('EventPageTemplate::createRealTimeSubscription Change received (INSERT)', payload)
                let {new: update} = payload;
                if (update.entity_type === 'Presentation' && parseInt(update.entity_id) == parseInt(eventId)) {
                    this.props.getEventById(eventId, false);
                }
            })
            .on('UPDATE', (payload) => {
                console.log('EventPageTemplate::createRealTimeSubscription Change received (UPDATE)', payload)
                let {new: update} = payload;
                if (update.entity_type === 'Presentation' && parseInt(update.entity_id) == parseInt(eventId)) {
                    this.props.getEventById(eventId, false);
                }
            })
            .subscribe()
    }

    checkForPastNovelties(summitId, event, eventId){
        this.queryRealTimeDB(summitId, parseInt(eventId)).then((res) => {
            // has record on db ( novelty )
            const DeltaSeconds = 60;
            let {created_at: lastUpdateNovelty} = res;
            if (lastUpdateNovelty) {
                if (event && event.hasOwnProperty('last_edited')) {
                    let {last_edited} = event;
                    last_edited = moment.unix(last_edited).utc();
                    lastUpdateNovelty = moment.utc(lastUpdateNovelty);
                    // then compare if the novelty date is greater than last edit date of the event
                    if (
                        (lastUpdateNovelty <= last_edited) ||

                        (lastUpdateNovelty > last_edited && lastUpdateNovelty.diff(last_edited, 'seconds') <= DeltaSeconds)) {
                        // skip it
                        console.log("EventPageTemplate::checkForPastNovelties: skipping update")
                        return;
                    }
                }
            }

            console.log("EventPageTemplate::checkForPastNovelties: doing update");
            this.props.getEventById(eventId, false);

        }).catch((err) => console.log(err));
    }

    clearRealTimeSubscription(){
        if (this._supabase && this._subscription) {
            console.log("EventPageTemplate::clearRealTimeSubscription");
            this._supabase.removeSubscription(this._subscription);
            this._subscription = null;
        }
    }

    componentDidMount() {
        const {eventId, event, summit} = this.props;
        if (parseInt(event?.id) !== parseInt(eventId))
            this.props.getEventById(eventId);

        // check on demand ( just in case that we missed some Real time update )
        if(event && eventId) {
           this.checkForPastNovelties(summit.id, event, eventId);
        }

        this.createRealTimeSubscription(summit, eventId);

    }

    componentWillUnmount() {
        this.clearRealTimeSubscription();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {eventId, event} = this.props;
        const {eventId: prevEventId} = prevProps;
        // event id could come as param at uri
        if (parseInt(eventId) !== parseInt(prevEventId) || parseInt(event?.id) !== parseInt(eventId)) {
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
        const {loading, eventId, event, eventsPhases} = this.props;
        if (loading !== nextProps.loading) return true;
        if (eventId !== nextProps.eventId) return true;
        if (event?.id !== nextProps.event?.id) return true;
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
                            currentPhase < PHASES.DURING ||
                            !event.streaming_url
                                ? "-3rem"
                                : "",
                    }}
                >
                    <div className="columns is-gapless">
                        {this.canRenderVideo(currentPhase) ? (
                            <div className="column is-three-quarters px-0 py-0">
                                <VideoComponent
                                    url={event.streaming_url}
                                    title={event.title}
                                    namespace={summit.name}
                                    firstHalf={firstHalf}
                                    autoPlay={autoPlay}
                                    start={startTime}
                                />
                                {event.meeting_url && <VideoBanner event={event}/>}
                            </div>
                        ) : (
                            <div className="column is-three-quarters px-0 py-0 is-full-mobile">
                                <NoTalkComponent
                                    currentEventPhase={currentPhase}
                                    event={event}
                                    summit={summit}
                                />
                            </div>
                        )}
                        <div
                            className="column is-hidden-mobile"
                            style={{
                                position: "relative",
                                borderBottom: "1px solid #d3d3d3",
                            }}
                        >
                            <DisqusComponent
                                hideMobile={true}
                                event={event}
                                title="Public Conversation"
                            />
                        </div>
                    </div>
                </section>
                <section className="section px-0 pt-5 pb-0">
                    <div className="columns mx-0 my-0">
                        <div className="column is-three-quarters is-full-mobile">
                            <div className="px-5 py-5">
                                <TalkComponent
                                    currentEventPhase={currentPhase}
                                    event={event}
                                    summit={summit}
                                />
                            </div>
                            <div className="px-5 py-0">
                                <SponsorComponent page="event"/>
                            </div>
                            <div className="is-hidden-tablet">
                                <DisqusComponent
                                    hideMobile={false}
                                    event={event}
                                    title="Public Conversation"
                                />
                                ∆
                            </div>
                            {event.etherpad_link && (
                                <div className="column is-three-quarters">
                                    <Etherpad
                                        className="talk__etherpad"
                                        etherpad_link={event.etherpad_link}
                                        userName={user.userProfile.first_name}
                                    />
                                </div>
                            )}
                            <UpcomingEventsComponent
                                trackId={event.track ? event.track.id : null}
                                eventCount={3}
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
                        </div>
                        <div className="column px-0 py-0 is-one-quarter is-full-mobile">
                            <DocumentsComponent event={event}/>
                            <AccessTracker/>
                            <AttendeesWidget user={user} event={event}/>
                            <AdvertiseComponent section="event" column="right"/>
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
                       getEventById
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
            />
        </Layout>
    );
};

EventPage.propTypes = {
    loading: PropTypes.bool,
    event: PropTypes.object,
    eventId: PropTypes.string,
    user: PropTypes.object,
    eventsPhases: PropTypes.array,
    getEventById: PropTypes.func,
};

EventPageTemplate.propTypes = {
    event: PropTypes.object,
    loading: PropTypes.bool,
    eventId: PropTypes.string,
    user: PropTypes.object,
    eventsPhases: PropTypes.array,
    getEventById: PropTypes.func,
};

const mapStateToProps = ({eventState, summitState, userState, clockState}) => ({
    loading: eventState.loading,
    event: eventState.event,
    user: userState,
    summit: summitState.summit,
    eventsPhases: clockState.events_phases,
    nowUtc: clockState.nowUtc,
});

export default connect(mapStateToProps, {
    getEventById
})(EventPage);