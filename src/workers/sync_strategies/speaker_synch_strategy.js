import AbstractSynchStrategy from "./abstract_synch_strategy";
import {fetchSpeakerById} from "../../actions/fetch-entities-actions";
import {
    BUCKET_EVENTS_DATA_KEY,
    BUCKET_EVENTS_IDX_DATA_KEY,
    BUCKET_SPEAKERS_DATA_KEY,
    BUCKET_SPEAKERS_IDX_DATA_KEY,
    saveFile
} from "../../utils/dataUpdatesUtils";

/**
 * SpeakerSynchStrategy
 */
class SpeakerSynchStrategy extends AbstractSynchStrategy{
    async process(payload) {

        console.log(`SpeakerSynchStrategy::process`, payload);

        const {entity_operator, entity_id} = payload;

        const entity = await fetchSpeakerById(this.summit.id, entity_id, this.accessToken);

        let eventsData = [...this.allEvents];

        if (entity_operator === 'UPDATE') {
            if(!entity) return Promise.reject();
            const idx = this.allIDXSpeakers.hasOwnProperty(entity_id) ? this.allIDXSpeakers[entity_id] : -1;
            let formerEntity = idx === -1 ? null : this.allSpeakers[idx];
            if (formerEntity && formerEntity.id !== entity_id) return Promise.reject(); // it's not the same
            const updatedSpeaker =  {...formerEntity, ...entity};
            this.allSpeakers[idx] = updatedSpeaker;

            // check presentations
            if (entity && entity.hasOwnProperty('presentations')) {
                for (const publishedEventId of entity.presentations) {
                    const idx = this.allIDXEvents.hasOwnProperty(publishedEventId) ? this.allIDXEvents[publishedEventId] : -1;
                    let formerEntity = idx === -1 ? null : eventsData[idx];
                    if (formerEntity && formerEntity.id !== publishedEventId) return Promise.reject(); // it's not the same
                    // check if speakers collection
                    let speakers = formerEntity.speakers.map( s => {
                        if(s.id === entity_id){
                            return updatedSpeaker;
                        }
                        return s;
                    })
                    eventsData[idx] = {...formerEntity, speakers: speakers};
                }
            }

            if(entity && entity.hasOwnProperty('moderated_presentations')){
                for (const publishedEventId of entity.moderated_presentations) {
                    const idx = this.allIDXEvents.hasOwnProperty(publishedEventId) ? this.allIDXEvents[publishedEventId] : -1;
                    let formerEntity = idx === -1 ? null : eventsData[idx];
                    if (formerEntity && formerEntity.id !== publishedEventId) return Promise.reject(); // it's not the same
                    // check if speakers collection
                    eventsData[idx] = {...formerEntity, moderator: updatedSpeaker};
                }
            }

            // update files on cache
            console.log(`SpeakerSynchStrategy::process updating cache files`);

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

            console.log(`SpeakerSynchStrategy::process done`, res);

            return Promise.resolve(res);


        }
    }
}

export default SpeakerSynchStrategy;