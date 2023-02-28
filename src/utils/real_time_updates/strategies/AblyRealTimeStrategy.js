import AbstractRealTimeStrategy from "./AbstractRealTimeStrategy";
import { getEnvVariable, ABLY_API_KEY } from "../../envVariables";
import * as Ably from 'ably';
/**
 * AblyRealTimeStrategy
 */
class AblyRealTimeStrategy extends AbstractRealTimeStrategy {

    /**
     * @param callback
     * @param checkPastCallback
     */
    constructor(callback, checkPastCallback) {
        super(callback, checkPastCallback);
        console.log('AblyRealTimeStrategy::constructor');
        this._client = null;
        this._wsError = false;
    }

    /**
     * @param summitId
     * @param lastCheckForNovelties
     */
    create(summitId) {

        super.create(summitId);
        console.log('AblyRealTimeStrategy::create');

        const key = getEnvVariable(ABLY_API_KEY);

        if(this._wsError) {
            console.log('AblyRealTimeStrategy::create error state');
            return;
        }

        if(!key){
            console.log('AblyRealTimeStrategy::create ABLY_KEY is not set');
            this._wsError = true;
            return;
        }

        // check if we are already connected

        if(this._client && this._client.connection){
            console.log('AblyRealTimeStrategy::create already connected');
            return;
        }

        if(this._client){
            this._client.close();
        }

        this._client = new Ably.Realtime({ key });

        // start listening for event

        const channel = this._client.channels.get(`${summitId}:*:*`);

        channel.subscribe((message) => {
            const { data : payload } = message;
            console.log('AblyRealTimeStrategy::create Change received', payload)
            this._callback(payload);
        });

        // connect handler
        this._client.connection.on((stateChange) => {
            const { current: state } = stateChange;
            console.log(`AblyRealTimeStrategy::connection WS ${state}`);
            if(state  === 'connected') {
                this._wsError = false;
                // RELOAD
                // check on demand ( just in case that we missed some Real time update )
                if (summitId) {
                    this._checkPastCallback(summitId);
                }
                this.stopUsingFallback();
                return;
            }
            if(state  === 'suspended') {
                if(!this._wsError) {
                    this._wsError = true;
                    this.startUsingFallback(summitId);
                }
                return;
            }
            if(state  === 'failed') {
                if(!this._wsError) {
                    this._wsError = true;
                    this.startUsingFallback(summitId);
                }
                return;
            }
        });
    }

    close() {
        super.close();
        if(this._client){
            console.log("AblyRealTimeStrategy::close");
            this._client.close();
            this._client = null;
        }
    }
}

export default AblyRealTimeStrategy;
