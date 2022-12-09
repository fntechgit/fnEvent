/**
 * AbstractRealTimeSingleEventStrategy
 */
class AbstractRealTimeStrategy {

    constructor(callback, checkPastCallback) {
        this._fallback = null;
        this._callback = callback;
        this._checkPastCallback = checkPastCallback;
        this._usingFallback = false;
    }

    /**
     *
     * @param fallback
     */
    setFallback(fallback){
        this._fallback = fallback;
    }

    /**
     * @param summitId
     * @param lastCheckForNovelties
     */
    startUsingFallback(summitId, lastCheckForNovelties){
        if(this._fallback) {
            this._usingFallback = true;
            this._fallback.create(summitId, lastCheckForNovelties);
        }
    }

    stopUsingFallback(){
        if(this._fallback) {
            this._usingFallback = false;
            this._fallback.close();
        }
    }

    /**
     * @param summitId
     * @param lastCheckForNovelties
     */
    create(summitId, lastCheckForNovelties){}

    close(){}

    /**
     * @returns {*|boolean|boolean}
     */
    manageBackgroundErrors(){
        if(this._usingFallback){
            return this._fallback.manageBackgroundErrors();
        }
        return false;
    }

    /**
     *
     * @returns {*|boolean|boolean}
     */
    hasBackgroundError(){
        if(this._usingFallback){
            return this._fallback.hasBackgroundError();
        }
        return false;
    }
}

export default AbstractRealTimeStrategy;