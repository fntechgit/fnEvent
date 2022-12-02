import { insertSorted, intCheck } from "../utils/arrayUtils";
import { fetchEventById } from "../actions/fetch-entities-actions";

/* eslint-disable-next-line no-restricted-globals */
self.onmessage = async ({ data: { accessToken, noveltiesArray, summit, allEvents, allIDXEvents, allSpeakers, allIDXSpeakers } }) =>  {

    noveltiesArray = JSON.parse(noveltiesArray);
    summit = JSON.parse(summit);
    allEvents = JSON.parse(allEvents);
    allIDXEvents = JSON.parse(allIDXEvents);
    allSpeakers = JSON.parse(allSpeakers);
    allIDXSpeakers = JSON.parse(allIDXSpeakers);

    console.log(`synch worker running for ${summit.id} ....`)

    for (const payload of noveltiesArray) {

        console.log(`synch worker procesing payload `, payload);

        const {entity_operator,  entity_type, entity_id} = payload;

        // micro updates logic goes here ...
        if(entity_type === 'Presentation') {

            const entity = await fetchEventById(summit.id, entity_id, accessToken);
            let eventsData = [...allEvents];

            if (entity_operator === 'UPDATE') {


                if(!entity){
                    // was deleted ( un - published)
                    // try to get from index
                    console.log(`synch worker unpublished presentation ${entity_id}`)
                    const idx =  allIDXEvents.hasOwnProperty(entity_id) ? allIDXEvents[entity_id] : -1;
                    if(idx < 0) continue; // does not exists on index ...
                    // remove it from dataset
                    eventsData.splice(idx, 1);
                    // remove it from index
                    delete allIDXEvents[entity_id];
                }
                else {
                    // entity is published

                    const idx = allIDXEvents.hasOwnProperty(entity.id) ? allIDXEvents[entity.id] : -1;
                    let formerEntity = idx > 0 ? eventsData[idx] : null;
                    if (formerEntity && formerEntity.id !== entity.id) continue; // it's not the same

                    if(!formerEntity){
                        // entity was just published ... then do insert ordering
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
                        // presentation was just updated
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
    }
};