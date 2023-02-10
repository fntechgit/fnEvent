import AbstractRealTimeStrategy from "./AbstractRealTimeStrategy";
import io from "socket.io-client";
import { getEnvVariable, WS_PUB_SERVER_URL } from "../../envVariables";
const WS_EVENT_NAME = 'entity_updates';

/**
 * WSRealTimeStrategy
 */
class WSRealTimeStrategy extends AbstractRealTimeStrategy {

    /**
     * @param callback
     * @param checkPastCallback
     */
    constructor(callback, checkPastCallback) {
        super(callback, checkPastCallback);
        this._wsError = false;
        this._socket = null;
    }

    /**
     * @param summitId
     * @param lastCheckForNovelties
     */
    create(summitId) {

        super.create(summitId);
        console.log('WSRealTimeStrategy::create');

        const wsServerUrl = getEnvVariable(WS_PUB_SERVER_URL);

        if(this._wsError) {
            console.log('WSRealTimeStrategy::create error state');
            return;
        }

        if(!wsServerUrl){
            console.log('WSRealTimeStrategy::create WS_PUB_SERVER_URL is not set');
            this._wsError = true;
            return;
        }

        // check if we are already connected

        if(this._socket && this._socket.connected){
            console.log('WSRealTimeStrategy::create already connected');
            return;
        }

        if(this._socket){
            this._socket.off();
            this._socket.close();
        }

        // create socket and subscribe to room
        let room = {
            summit_id : summitId,
        }

        this._socket =  io(wsServerUrl,  { query: {...room} });

        // start listening for event
        this._socket.on(WS_EVENT_NAME, (payload) => {
            console.log('WSRealTimeStrategy::create Change received WS', payload)
            this._callback(payload);
        });

        // connect handler
        this._socket.on("connect", () => {
            console.log(`WSRealTimeStrategy::create WS connected`);
            this._wsError = false;
            // RELOAD
            // check on demand ( just in case that we missed some Real time update )
            if(summitId) {
                this._checkPastCallback(summitId);
            }
            this.stopUsingFallback();
        });

        // disconnect
        this._socket.on("disconnect", (reason) => {
            if (reason === "io server disconnect") {
                // the disconnection was initiated by the server, you need to reconnect manually
                this._socket.connect();
            }
            console.log(`WSRealTimeStrategy::create WS disconnect due to ${reason}`);
            this._wsError = true;
            this.startUsingFallback(summitId);
        });

        this._socket.io.on("error", (error) => {
            if(this._wsError) return;
            console.log(`WSRealTimeStrategy::create WS error`, error);
            this._wsError = true;
            this.startUsingFallback(summitId);
        });
    }

    close() {
        super.close();
        if(this._socket){
            console.log("WSRealTimeStrategy::close");
            this._socket.off();
            this._socket.close();
            this._socket = null;
        }
    }
}

export default WSRealTimeStrategy;
