import AbstractSynchStrategy from "./abstract_synch_strategy";
import { fetchLocationById } from "../../actions/fetch-entities-actions";
import {
    BUCKET_EVENTS_DATA_KEY,
    BUCKET_EVENTS_IDX_DATA_KEY,
    BUCKET_SPEAKERS_DATA_KEY,
    BUCKET_SPEAKERS_IDX_DATA_KEY,
    saveFile,
} from "../../utils/dataUpdatesUtils";

/**
 * VenueRoomSynchStrategy
 */
class VenueRoomSynchStrategy extends AbstractSynchStrategy{

    async process(payload){

        console.log(`VenueRoomSynchStrategy::process`, payload);

        const {entity_operator, entity_id} = payload;

        const entity = await fetchLocationById(this.summit.id, entity_id, 'floor,venue' , this.accessToken);

        let eventsData = [...this.allEvents];

        if (entity_operator === 'UPDATE') {

            if (entity && entity.hasOwnProperty('published_events')) {

                for (const publishedEventId of entity.published_events) {
                    const idx = this.allIDXEvents.hasOwnProperty(publishedEventId) ? this.allIDXEvents[publishedEventId] : -1;
                    let formerEntity = idx === -1 ? null : eventsData[idx];
                    if (formerEntity && formerEntity.id !== publishedEventId) return Promise.reject(); // it's not the same
                    eventsData[idx] = {...formerEntity, location: entity};
                }

                // update files on cache
                console.log(`VenueRoomSynchStrategy::process updating cache files`);

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

                console.log(`VenueRoomSynchStrategy::process done`, res);

                return Promise.resolve(res);
            }
        }
    }
}

export default VenueRoomSynchStrategy;