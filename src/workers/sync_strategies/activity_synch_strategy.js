import AbstractSynchStrategy from "./abstract_synch_strategy";
import {fetchEventById} from "../../actions/fetch-entities-actions";
import {insertSorted, intCheck} from "../../utils/arrayUtils";
import {
    BUCKET_EVENTS_DATA_KEY,
    BUCKET_EVENTS_IDX_DATA_KEY,
    BUCKET_SPEAKERS_DATA_KEY, BUCKET_SPEAKERS_IDX_DATA_KEY,
    saveFile
} from "../../utils/dataUpdatesUtils";

/**
 * ActivitySynchStrategy
 */
class ActivitySynchStrategy extends AbstractSynchStrategy{

    async process(payload){

        console.log(`ActivitySynchStrategy::process`, payload);

        const {entity_operator, entity_id} = payload;

        const entity = await fetchEventById(this.summit.id, entity_id, this.accessToken);
        let eventsData = [...this.allEvents];

        if (entity_operator === 'UPDATE') {

            if(!entity){
                // was deleted ( un - published)
                // try to get from index
                const idx =  this.allIDXEvents.hasOwnProperty(entity_id) ? this.allIDXEvents[entity_id] : -1;
                console.log(`ActivitySynchStrategy::process unpublished presentation ${entity_id} idx ${idx}`);

                if(idx === -1)
                    return Promise.reject('ActivitySynchStrategy::process unpublished idx === -1.'); // does not exists on index ...
                // remove it from dataset
                eventsData.splice(idx, 1);
                // remove it from index
                delete this.allIDXEvents[entity_id];
            }
            else {
                // entity is published

                const idx = this.allIDXEvents.hasOwnProperty(entity.id) ? this.allIDXEvents[entity.id] : -1;
                console.log(`ActivitySynchStrategy::process entity is published got idx ${idx} eventsData length ${eventsData.length}`);
                let formerEntity = idx === -1 ? null : ( (eventsData.length - 1 ) >= idx ? eventsData[idx] : null ) ;
                console.log(`ActivitySynchStrategy::process entity is published`, formerEntity, entity, idx);
                if (formerEntity && formerEntity.id !== entity.id)
                    return Promise.reject('ActivitySynchStrategy::process entity is published entities are not the same.');// it's not the same
                if(!formerEntity){
                    console.log('ActivitySynchStrategy::process former entity does not exists, inserting new one', entity);
                    // entity was just published ... then do insert ordering
                    this.allIDXEvents[entity.id] = insertSorted(eventsData, entity, (a, b) => {
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
                    console.log(`ActivitySynchStrategy::process updating presentation ${entity.id}`)
                    eventsData[idx] = entity;
                } else {
                    // publishing dates changed, we need to remove and do ordered re-insert
                    // remove it first

                    console.log('ActivitySynchStrategy::process publishing dates had changed', entity);
                    eventsData.splice(idx, 1);
                    // then do insert ordering
                    this.allIDXEvents[entity.id] = insertSorted(eventsData, entity, (a, b) => {
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

            // update files on cache

            // update files on cache
            console.log(`ActivitySynchStrategy::process updating cache files`);

            try {
                const localNowUtc = Math.round(+new Date() / 1000);

                await saveFile(this.summit.id, BUCKET_EVENTS_DATA_KEY, eventsData, localNowUtc);

                await saveFile(this.summit.id, BUCKET_EVENTS_IDX_DATA_KEY, this.allIDXEvents, localNowUtc);

                await saveFile(this.summit.id, BUCKET_SPEAKERS_DATA_KEY, this.allSpeakers, localNowUtc);

                await saveFile(this.summit.id, BUCKET_SPEAKERS_IDX_DATA_KEY, this.allIDXSpeakers, localNowUtc);

            }
            catch (e){
                console.log(e);
            }

            let res = {
                payload,
                entity,
                summit : this.summit,
                eventsData,
                allIDXEvents : this.allIDXEvents,
                allSpeakers : this.allSpeakers,
                allIDXSpeakers : this.allIDXSpeakers
            };

            console.log(`ActivitySynchStrategy::process done`, res);

            return Promise.resolve(res);
        }
    }
}

export default ActivitySynchStrategy;