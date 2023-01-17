import SynchStrategyFactory from "./sync_strategies/synch_strategy_factory";

/* eslint-disable-next-line no-restricted-globals */
self.onmessage = async ({
                            data: {
                                accessToken,
                                noveltiesArray,
                                summit,
                                allEvents,
                                allIDXEvents,
                                allSpeakers,
                                allIDXSpeakers
                            }
                        }) => {

    noveltiesArray = JSON.parse(noveltiesArray);
    summit = JSON.parse(summit);
    allEvents = JSON.parse(allEvents);
    allIDXEvents = JSON.parse(allIDXEvents);
    allSpeakers = JSON.parse(allSpeakers);
    allIDXSpeakers = JSON.parse(allIDXSpeakers);

    console.log(`synch worker running for ${summit.id} ....`)

    let lastPayload = null;

    for (const payload of noveltiesArray) {

        console.log(`synch worker processing payload `, payload);

        const {entity_operator, entity_type, entity_id} = payload;

        if (
            lastPayload &&
            lastPayload.entity_type === entity_type &&
            lastPayload.entity_operator === entity_operator &&
            lastPayload.entity_id === entity_id) {
            console.log('synch worker skipping payload (already processed)');
            continue;
        }

        // micro updates logic goes here ...
        console.log(`synch worker trying to create process strategy for payload `, payload);

        let s = SynchStrategyFactory.build(summit, allEvents, allIDXEvents, allSpeakers, allIDXSpeakers, accessToken, payload);
        lastPayload = payload;
        if (s === null) {
            console.log(`synch worker missing process strategy for payload`, payload);
            continue;
        }

        s.process(payload).then((res) => {
            console.log(`synch worker postMessage`);
            /* eslint-disable-next-line no-restricted-globals */
            self.postMessage(res);
        }).catch(e => console.log(e));

    }
};