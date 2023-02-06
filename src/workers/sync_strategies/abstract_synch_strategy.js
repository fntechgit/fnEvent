/**
 * AbstractSynchStrategy
 */
class AbstractSynchStrategy {

    /**
     * @param summit
     * @param allEvents
     * @param allIDXEvents
     * @param allSpeakers
     * @param allIDXSpeakers
     * @param accessToken
     */
    constructor(summit, allEvents, allIDXEvents, allSpeakers, allIDXSpeakers, accessToken) {
        this.summit = summit;
        this.allEvents = allEvents;
        this.allIDXEvents = allIDXEvents;
        this.allSpeakers = allSpeakers;
        this.allIDXSpeakers = allIDXSpeakers;
        this.accessToken = accessToken;
    }

    async process(payload){
        throw new Error('not implemented');
    }

}

export default AbstractSynchStrategy;