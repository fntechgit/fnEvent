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
            if(!entity) return Promise.reject('SpeakerSynchStrategy::process entity not retrieved.');
            let idx = this.allIDXSpeakers.hasOwnProperty(entity_id) ? this.allIDXSpeakers[entity_id] : -1;
            let formerEntity = idx === -1 ? null : ( ( this.allSpeakers.length - 1 ) >= idx ? this.allSpeakers[idx] : null);
            if (formerEntity && formerEntity.id !== entity_id) {
                console.log('SpeakerSynchStrategy::process entities are not the same.'); // it's not the same
                formerEntity = this.allSpeakers.find((e, index) => {
                    let res = e.id == entity.id;
                    if(res){
                        console.log(`SpeakerSynchStrategy::process entity id ${entity.id} found at idx ${index}`);
                        idx = index;
                    }
                    return res;
                });
                if(!formerEntity){
                    return Promise.reject(`SpeakerSynchStrategy::process entity id ${entity.id} not found`);
                }
            }
            const updatedSpeaker =  formerEntity ? {...formerEntity, ...entity} : entity;
            if(idx === -1){
                console.log(`SpeakerSynchStrategy::process entity does not exists, inserting it at end`, updatedSpeaker);
                this.allSpeakers.push(updatedSpeaker);
                this.allIDXSpeakers[updatedSpeaker.id] = this.allSpeakers.length - 1;
            }
            else {
                console.log(`SpeakerSynchStrategy::process updating speaker at idx ${idx}`, updatedSpeaker);
                this.allSpeakers[idx] = updatedSpeaker;
            }

            // check presentations
            if (entity && entity.hasOwnProperty('presentations')) {
                for (const publishedEventId of entity.presentations) {
                    const eventIdx = this.allIDXEvents.hasOwnProperty(publishedEventId) ? this.allIDXEvents[publishedEventId] : -1;
                    let formerEntity = eventIdx === -1 ? null : ( (eventsData.length - 1) >= eventIdx ? eventsData[eventIdx] : null);
                    if(formerEntity === null){
                        console.log(`SpeakerSynchStrategy::process presentations activity ${publishedEventId} not found on data set`);
                        continue;
                    }
                    if (formerEntity && formerEntity.id !== publishedEventId) continue;
                    // check if speakers collection
                    let speakers = formerEntity.speakers.map( s => {
                        if(s.id === entity_id){
                            return updatedSpeaker;
                        }
                        return s;
                    })
                    eventsData[eventIdx] = {...formerEntity, speakers: speakers};
                }
            }

            // check moderated presentations
            if(entity && entity.hasOwnProperty('moderated_presentations')){
                for (const publishedEventId of entity.moderated_presentations) {
                    const eventIdx = this.allIDXEvents.hasOwnProperty(publishedEventId) ? this.allIDXEvents[publishedEventId] : -1;
                    let formerEntity = eventIdx === -1 ? null : ( (eventsData.length - 1 ) >= eventIdx ? eventsData[eventIdx] : null);
                    if(formerEntity === null) {
                        console.log(`SpeakerSynchStrategy::process  moderated_presentations activity ${publishedEventId} not found on data set`);
                        continue;
                    }
                    if (formerEntity && formerEntity.id !== publishedEventId) continue; // it's not the same
                    // check if speakers collection
                    eventsData[eventIdx] = {...formerEntity, moderator: updatedSpeaker};
                }
            }

            // update files on cache
            console.log(`SpeakerSynchStrategy::process updating cache files`);

            try {
                const localNowUtc = Date.now();

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