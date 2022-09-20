import AbstractRealTimeSingleEventStrategy from "./AbstractRealTimeSingleEventStrategy";
import SupabaseClientBuilder from "../../supabaseClientBuilder";
import {getEnvVariable, SUPABASE_KEY, SUPABASE_URL} from "../../envVariables";
const MAX_SUBSCRIPTION_RETRY = 3;

/**
 * SUPARealTimeSingleEventStrategy
 */
class SUPARealTimeSingleEventStrategy extends AbstractRealTimeSingleEventStrategy {

    /**
     *
     * @param callback
     * @param checkPastCallback
     */
    constructor(callback, checkPastCallback) {
        super(callback, checkPastCallback);

        this._subscription = null;
        this._supaError = false;
        this._supaBackgrounError = false;
        this._retrySubscriptionCounter = 0;

        try {
            this._supabase = SupabaseClientBuilder.getClient(getEnvVariable(SUPABASE_URL), getEnvVariable(SUPABASE_KEY));
        }
        catch (e){
            this._supabase = null;
            console.log(e);
        }
    }

    manageBackgroundErrors(){return true;}

    hasBackgroundError(){return this._supaBackgrounError;}

    /**
     *
     * @param summit
     * @param event
     * @param eventId
     * @param lastUpdate
     */
    create(summit, event, eventId, lastUpdate){
        super.create(summit, event, eventId, lastUpdate);
        console.log('SUPARealTimeSingleEventStrategy::create');

        if(this._supaError){
            console.log('SUPARealTimeSingleEventStrategy::create error state');
            return;
        }

        // check if we are already connected

        if(this._subscription && this._subscription.isJoined() ){
            console.log('SUPARealTimeSingleEventStrategy::create already connected');
            return;
        }

        this._subscription = this._supabase
            .from(`summit_entity_updates:summit_id=eq.${summit.id}`)
            .on('INSERT', (payload) => {
                console.log('SUPARealTimeSingleEventStrategy::create Change received (INSERT)', payload)
                let {new: update} = payload;
                if (update.entity_type === 'Presentation' && parseInt(update.entity_id) == parseInt(eventId)) {
                    this._callback(update);
                }
            })
            .on('UPDATE', (payload) => {
                console.log('SUPARealTimeSingleEventStrategy::create Change received (UPDATE)', payload)
                let {new: update} = payload;
                if (update.entity_type === 'Presentation' && parseInt(update.entity_id) == parseInt(eventId)) {
                    this._callback(update);
                }
            })
            .subscribe((status, e) => {
                const visibilityState = document.visibilityState;
                console.log("SUPARealTimeSingleEventStrategy::create subscribe ", status, e, visibilityState);
                if (status === "SUBSCRIPTION_ERROR") {
                    this._supaError = true;
                    // init the RT cleaning process
                    this.close();
                    if (visibilityState  === "hidden") {
                        // if page not visible mark the error for later
                        this._supaBackgrounError = true
                        return;
                    }

                    // do exponential back off on retries
                    if(this._retrySubscriptionCounter < MAX_SUBSCRIPTION_RETRY) {
                        ++this._retrySubscriptionCounter;
                        // if we are on visible state, then restart the RT
                        window.setTimeout(() => {
                            this.create(summit, event, eventId, lastUpdate)
                        }, 2 **  this._retrySubscriptionCounter  * 1000);
                        return;
                    }
                    // we spent all exp back off, try fallback
                   this.startUsingFallback(summit, event, eventId, lastUpdate);
                }
                if (status === "SUBSCRIBED") {
                    // reset counter
                    this._retrySubscriptionCounter = 0;
                    this._supaError = false;
                    this._supaBackgrounError = false;
                    // RELOAD
                    // check on demand ( just in case that we missed some Real time update )
                    if(event && eventId) {
                        this._checkPastCallback(summit.id, event, eventId, lastUpdate);
                    }
                }
            })
    }

    close(){
        super.close();
        if (this._supabase && this._subscription) {
            try {
                console.log("SUPARealTimeSingleEventStrategy::close");
                this._supabase.removeSubscription(this._subscription);
                this._subscription = null;
            }
            catch (e){
                console.log(e);
            }
        }
    }
}

export default SUPARealTimeSingleEventStrategy;