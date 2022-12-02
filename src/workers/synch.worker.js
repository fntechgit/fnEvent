import { insertSorted, intCheck } from "../utils/arrayUtils";
import { fetchEventById } from "../actions/fetch-entities-actions";

/* eslint-disable-next-line no-restricted-globals */
self.onmessage = async ({ data: { accessToken, payload, summit, allEvents, allIDXEvents, allSpeakers, allIDXSpeakers } }) =>  {

    payload = JSON.parse(payload);
    summit = JSON.parse(summit);
    allEvents = JSON.parse(allEvents);
    allIDXEvents = JSON.parse(allIDXEvents);
    allSpeakers = JSON.parse(allSpeakers);
    allIDXSpeakers = JSON.parse(allIDXSpeakers);

    console.log(`synch worker running for ${summit.id} ....`)

    const {entity_operator,  entity_type, entity_id} = payload;

    // micro updates logic goes here ...
    if(entity_type === 'Presentation') {

        const entity = await fetchEventById(summit.id, entity_id, accessToken);
        let eventsData = [...allEvents];
        if (entity_operator === 'UPDATE') {
            // try to get from index
            if(!entity){
                // was deleted
                const idx =  allIDXEvents.hasOwnProperty(entity_id) ? allIDXEvents[entity_id] : -1;
                console.log(`synch worker deleted presentation ${entity_id}`)
                if(idx < 0) return; // does not exists ...
                // publishing dates changed, we need to remove and do ordered re-insert
                // remove it first

                eventsData.splice(idx, 1);
            }
            else {
                const idx = allIDXEvents.hasOwnProperty(entity.id) ? allIDXEvents[entity.id] : -1;
                let formerEntity = idx > 0 ? eventsData[idx] : null;
                if (formerEntity && formerEntity.id !== entity.id) return; // it's not the same

                if(!formerEntity){
                    // then do insert ordering
                    allIDXEvents[entity.id] = insertSorted(eventsData, entity, (a, b) => {
                        // multi-criteria sort

                        if (a.start_date === b.start_date) {

                            if (a.end_date === b.end_date) {
                                return intCheck(a.id, b.id);
                            }

                            return intCheck(a.end_date, b.end_date);
                        }

                        return intCheck(a.start_date, b.start_date);
                    });
                }
                else if
                (
                    formerEntity.start_date === entity.start_date &&
                    formerEntity.end_date === entity.end_date
                ) {
                    console.log(`synch worker updating presentation ${entity.id}`)
                    eventsData[idx] = entity;
                } else {
                    // publishing dates changed, we need to remove and do ordered re-insert
                    // remove it first
                    eventsData.splice(idx, 1);
                    // then do insert ordering
                    allIDXEvents[entity.id] = insertSorted(eventsData, entity, (a, b) => {
                        // multi-criteria sort

                        if (a.start_date === b.start_date) {

                            if (a.end_date === b.end_date) {
                                return intCheck(a.id, b.id);
                            }

                            return intCheck(a.end_date, b.end_date);
                        }

                        return intCheck(a.start_date, b.start_date);
                    });
                }
            }

            /* eslint-disable-next-line no-restricted-globals */
            self.postMessage({
                entity,
                eventsData,
                allIDXEvents,
                allSpeakers,
                allIDXSpeakers
            });
        }
    }
};