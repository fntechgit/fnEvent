import WSRealTimeStrategy from "./WSRealTimeStrategy";

const STRATEGY_SUPA = 'SUPA';
const STRATEGY_WS = 'WS';

/**
 * RealTimeStrategyFactory
 */
class RealTimeStrategyFactory {

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

        console.log(`RealTimeStrategyFactory::build ${type}`);

        if(type === STRATEGY_SUPA){
        }

        if(type === STRATEGY_WS){
            main = new WSRealTimeStrategy(callback, checkPastCallback);
            fallback = new WSRealTimeStrategy(callback, checkPastCallback);
        }

        if(main && fallback) {
            main.setFallback(fallback);
            fallback.setFallback(main);
        }

        return main;
    }
}

export default RealTimeStrategyFactory;