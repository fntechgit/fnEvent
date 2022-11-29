import AbstractRealTimeStrategy from "./AbstractRealTimeStrategy";
import SupabaseClientBuilder from "../../supabaseClientBuilder";
import {getEnvVariable, SUPABASE_KEY, SUPABASE_URL} from "../../envVariables";
const MAX_SUBSCRIPTION_RETRY = 3;

/**
 *
 */
class SUPARealTimeStrategy extends AbstractRealTimeStrategy {

    /**
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
     * @param summitId
     * @param lastBuild
     */
    create(summitId, lastBuild) {
        super.create(summitId, lastBuild);

        console.log('SUPARealTimeStrategy::create');

        if(this._supaError){
            console.log('SUPARealTimeStrategy::create error state');
            return;
        }

        // check if we are already connected

        if(this._subscription && this._subscription.isJoined() ){
            console.log('SUPARealTimeStrategy::create already connected');
            return;
        }

        this._subscription = this._supabase
            .from(`summit_entity_updates:summit_id=eq.${summitId}`)
            .on('INSERT', (payload) => {
                console.log('SUPARealTimeStrategy::create Change received (INSERT)', payload)
                let {new: update} = payload;
                this._callback(update);
            })
            .on('UPDATE', (payload) => {
                console.log('SUPARealTimeStrategy::create Change received (UPDATE)', payload)
                let {new: update} = payload;
                this._callback(update);
            })
            .subscribe((status, e) => {
                const visibilityState = document.visibilityState;
                console.log("SUPARealTimeStrategy::create subscribe ", status, e, visibilityState);
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
                            this.create(summitId, lastBuild)
                        }, 2 **  this._retrySubscriptionCounter  * 1000);
                        return;
                    }
                    // we spent all exp back off, try fallback
                    this.startUsingFallback(summitId, lastBuild);
                }
                if (status === "SUBSCRIBED") {
                    // reset counter
                    this._retrySubscriptionCounter = 0;
                    this._supaError = false;
                    this._supaBackgrounError = false;
                    // RELOAD
                    // check on demand ( just in case that we missed some Real time update )
                    this._checkPastCallback(summitId, lastBuild);
                }
            })
    }

    close(){
        super.close();
        if (this._supabase && this._subscription) {
            try {
                console.log("SUPARealTimeStrategy::close");
                this._supabase.removeSubscription(this._subscription);
                this._subscription = null;
            }
            catch (e){
                console.log(e);
            }
        }
    }
}


export default SUPARealTimeStrategy;
