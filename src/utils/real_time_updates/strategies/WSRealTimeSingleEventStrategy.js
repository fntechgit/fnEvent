import AbstractRealTimeSingleEventStrategy from "./AbstractRealTimeSingleEventStrategy";
import io from "socket.io-client";
import { getEnvVariable, WS_PUB_SERVER_URL } from "../../envVariables";
const WS_EVENT_NAME = 'entity_updates';

/**
 * WSRealTimeSingleEventStrategy
 */
class WSRealTimeSingleEventStrategy extends AbstractRealTimeSingleEventStrategy {

    /**
     *
     * @param callback
     * @param checkPastCallback
     */
    constructor(callback, checkPastCallback) {
        super(callback, checkPastCallback);
        this._wsError = false;
        this._socket = null;
    }

    /**
     *
     * @param summit
     * @param event
     * @param eventId
     * @param lastUpdate
     */
    create(summit, event, eventId, lastUpdate) {

        super.create(summit, event, eventId, lastUpdate);
        console.log('WSRealTimeSingleEventStrategy::create');

        const wsServerUrl = getEnvVariable(WS_PUB_SERVER_URL);

        if(this._wsError) {
            console.log('WSRealTimeSingleEventStrategy::create error state');
            return;
        }

        if(!wsServerUrl){
            console.log('WSRealTimeSingleEventStrategy::create WS_PUB_SERVER_URL is not set');
            this._wsError = true;
            return;
        }

        // check if we are already connected

        if(this._socket && this._socket.connected){
            console.log('WSRealTimeSingleEventStrategy::create already connected');
            return;
        }

        if(this._socket){
            this._socket.off();
            this._socket.close();
        }

        // create socket and subscribe to room
        let room = {
            entity_type: "Presentation",
            summit_id : summit.id,
            entity_id : parseInt(eventId),
        }

        this._socket =  io(wsServerUrl,  { query: {...room} });

        // start listening for event
        this._socket.on(WS_EVENT_NAME, (payload) => {
            console.log('WSRealTimeSingleEventStrategy::create Change received WS', payload)
            this._callback(payload);
        });

        // connect handler
        this._socket.on("connect", () => {
            console.log(`WSRealTimeSingleEventStrategy::create WS connected`);
            this._wsError = false;
            // RELOAD
            // check on demand ( just in case that we missed some Real time update )
            if(event && eventId) {
                this._checkPastCallback(summit.id, event, eventId, lastUpdate);
            }
            this.stopUsingFallback();
        });

        // disconnect
        this._socket.on("disconnect", (reason) => {
            if (reason === "io server disconnect") {
                // the disconnection was initiated by the server, you need to reconnect manually
                this._socket.connect();
            }
            console.log(`WSRealTimeSingleEventStrategy::create WS disconnect due to ${reason}`);
            this._wsError = true;
            this.startUsingFallback(summit, event, eventId, lastUpdate);
        });

        this._socket.io.on("error", (error) => {
            if(this._wsError) return;
            console.log(`WSRealTimeSingleEventStrategy::create WS error`, error);
            this._wsError = true;
            this.startUsingFallback(summit, event, eventId, lastUpdate);
        });
    }

    close() {
        super.close();
        if(this._socket){
            console.log("WSRealTimeSingleEventStrategy::close");
            this._socket.off();
            this._socket.close();
            this._socket = null;
        }
    }
}

export default WSRealTimeSingleEventStrategy;
