import SUPARealTimeSingleEventStrategy from "./SUPARealTimeSingleEventStrategy";
import WSRealTimeSingleEventStrategy from "./WSRealTimeSingleEventStrategy";

const STRATEGY_SUPA = 'SUPA';
const STRATEGY_WS = 'WS';

/**
 * RealTimeSingleEventStrategyFactory
 */
class RealTimeSingleEventStrategyFactory {

    /**
     *
     * @param type
     * @param callback
     * @param checkPastCallback
     * @returns {null}
     */
    static build(type, callback, checkPastCallback){
        let main = null;
        let fallback = null;

        console.log(`RealTimeSingleEventStrategyFactory::build ${type}`);

        if(type === STRATEGY_SUPA){
            main =  new SUPARealTimeSingleEventStrategy(callback, checkPastCallback);
            fallback = new WSRealTimeSingleEventStrategy(callback, checkPastCallback);
        }

        if(type === STRATEGY_WS){
            main =  new WSRealTimeSingleEventStrategy(callback, checkPastCallback);
            fallback = new SUPARealTimeSingleEventStrategy(callback, checkPastCallback);
        }

        if(main && fallback) {
            main.setFallback(fallback);
            fallback.setFallback(main);
        }

        return main;
    }
}

export default RealTimeSingleEventStrategyFactory;