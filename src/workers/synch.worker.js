import { insertSorted, intCheck } from "../utils/arrayUtils";
import {fetchEventById, fetchLocationById, fetchSpeakerById, fetchSummitById} from "../actions/fetch-entities-actions";
import {
    getKey,
    BUCKET_EVENTS_DATA_KEY,
    BUCKET_EVENTS_IDX_DATA_KEY,
    BUCKET_SPEAKERS_DATA_KEY,
    BUCKET_SPEAKERS_IDX_DATA_KEY,
    BUCKET_SUMMIT_DATA_KEY,
    storeData,
    isSummitEventDataUpdate,
} from '../utils/dataUpdatesUtils';

import {putOnCache} from "../utils/cacheUtils";

/* eslint-disable-next-line no-restricted-globals */
self.onmessage = async ({ data: { accessToken, noveltiesArray, summit, allEvents, allIDXEvents, allSpeakers, allIDXSpeakers } }) =>  {

    noveltiesArray = JSON.parse(noveltiesArray);
    summit = JSON.parse(summit);
    allEvents = JSON.parse(allEvents);
    allIDXEvents = JSON.parse(allIDXEvents);
    allSpeakers = JSON.parse(allSpeakers);
    allIDXSpeakers = JSON.parse(allIDXSpeakers);

    console.log(`synch worker running for ${summit.id} ....`)

    let eventsData = [...allEvents];

    let lastPayload = null;

    for (const payload of noveltiesArray) {

        console.log(`synch worker processing payload `, payload);

        const {entity_operator,  entity_type, entity_id} = payload;

        if(
            lastPayload &&
            lastPayload.entity_type === entity_type &&
            lastPayload.entity_operator === entity_operator &&
            lastPayload.entity_id === entity_id)
        {
            console.log('synch worker skipping payload (already processed)');
            continue;
        }

        // micro updates logic goes here ...
        if(isSummitEventDataUpdate(entity_type)) {

            const entity = await fetchEventById(summit.id, entity_id, accessToken);

            if (entity_operator === 'UPDATE') {

                if(!entity){
                    // was deleted ( un - published)
                    // try to get from index
                    console.log(`synch worker unpublished presentation ${entity_id}`)
                    const idx =  allIDXEvents.hasOwnProperty(entity_id) ? allIDXEvents[entity_id] : -1;
                    if(idx === -1) continue; // does not exists on index ...
                    // remove it from dataset
                    eventsData.splice(idx, 1);
                    // remove it from index
                    delete allIDXEvents[entity_id];
                }
                else {
                    // entity is published

                    const idx = allIDXEvents.hasOwnProperty(entity.id) ? allIDXEvents[entity.id] : -1;
                    let formerEntity = idx === -1 ? null : eventsData[idx];
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

                // update files on cache

                console.log(`synch worker updating cache files`);

                try{
                    const localNowUtc = Math.round(+new Date() / 1000);
                    await storeData(summit.id, getKey(summit.id, BUCKET_EVENTS_DATA_KEY), eventsData);
                    await putOnCache(`files_${summit.id}`,  getKey(summit.id, `${BUCKET_EVENTS_DATA_KEY}_LAST_MODIFIED`), localNowUtc);
                    await storeData(summit.id, getKey(summit.id, BUCKET_EVENTS_IDX_DATA_KEY), allIDXEvents);
                    await putOnCache(`files_${summit.id}`,  getKey(summit.id, `${BUCKET_EVENTS_IDX_DATA_KEY}_LAST_MODIFIED`), localNowUtc);
                    await storeData(summit.id, getKey(summit.id, BUCKET_SPEAKERS_DATA_KEY), allSpeakers);
                    await putOnCache(`files_${summit.id}`,  getKey(summit.id, `${BUCKET_SPEAKERS_DATA_KEY}_LAST_MODIFIED`), localNowUtc);
                    await storeData(summit.id, getKey(summit.id, BUCKET_SPEAKERS_IDX_DATA_KEY), allIDXSpeakers);
                    await putOnCache(`files_${summit.id}`,  getKey(summit.id, `${BUCKET_SPEAKERS_IDX_DATA_KEY}_LAST_MODIFIED`), localNowUtc);
                }
                catch (e){
                    console.log(e);
                }

                // post a message per entity
                console.log(`synch worker postMessage`);
                /* eslint-disable-next-line no-restricted-globals */
                self.postMessage({
                    payload,
                    entity,
                    summit,
                    eventsData,
                    allIDXEvents,
                    allSpeakers,
                    allIDXSpeakers
                });
            }
        }
        if(entity_type === 'SummitVenueRoom'){
            const entity = await fetchLocationById(summit.id, entity_id, 'floor,venue' , accessToken);
            if (entity_operator === 'UPDATE') {

                if (entity && entity.hasOwnProperty('published_events')) {
                    for (const publishedEventId of entity.published_events) {
                        const idx = allIDXEvents.hasOwnProperty(publishedEventId) ? allIDXEvents[publishedEventId] : -1;
                        let formerEntity = idx === -1 ? null : eventsData[idx];
                        if (formerEntity && formerEntity.id !== publishedEventId) continue; // it's not the same
                        eventsData[idx] = {...formerEntity, location: entity};
                    }

                    // update files on cache
                    console.log(`synch worker updating cache files`);
                    try {
                        const localNowUtc = Math.round(+new Date() / 1000);

                        await storeData(summit.id, getKey(summit.id, BUCKET_EVENTS_DATA_KEY), eventsData);
                        await putOnCache(`files_${summit.id}`, getKey(summit.id, `${BUCKET_EVENTS_DATA_KEY}_LAST_MODIFIED`), localNowUtc);
                        await storeData(summit.id, getKey(summit.id, BUCKET_EVENTS_IDX_DATA_KEY), allIDXEvents);
                        await putOnCache(`files_${summit.id}`, getKey(summit.id, `${BUCKET_EVENTS_IDX_DATA_KEY}_LAST_MODIFIED`), localNowUtc);
                        await storeData(summit.id, getKey(summit.id, BUCKET_SPEAKERS_DATA_KEY), allSpeakers);
                        await putOnCache(`files_${summit.id}`, getKey(summit.id, `${BUCKET_SPEAKERS_DATA_KEY}_LAST_MODIFIED`), localNowUtc);
                        await storeData(summit.id, getKey(summit.id, BUCKET_SPEAKERS_IDX_DATA_KEY), allIDXSpeakers);
                        await putOnCache(`files_${summit.id}`, getKey(summit.id, `${BUCKET_SPEAKERS_IDX_DATA_KEY}_LAST_MODIFIED`), localNowUtc);
                    }
                    catch (e){
                        console.log(e);
                    }

                    // post a message per entity
                    console.log(`synch worker postMessage`);
                    /* eslint-disable-next-line no-restricted-globals */
                    self.postMessage({
                        payload,
                        entity,
                        summit,
                        eventsData,
                        allIDXEvents,
                        allSpeakers,
                        allIDXSpeakers
                    });
                }
            }
        }
        if(entity_type === 'PresentationSpeaker') {
            const entity = await fetchSpeakerById(summit.id, entity_id, accessToken);
            if (entity_operator === 'UPDATE') {
                if(!entity) continue;
                const idx = allIDXSpeakers.hasOwnProperty(entity_id) ? allIDXSpeakers[entity_id] : -1;
                let formerEntity = idx === -1 ? null : allSpeakers[idx];
                if (formerEntity && formerEntity.id !== entity_id) continue; // it's not the same
                const updatedSpeaker =  {...formerEntity, ...entity};
                allSpeakers[idx] = updatedSpeaker;

                // check presentations
                if (entity && entity.hasOwnProperty('presentations')) {
                    for (const publishedEventId of entity.presentations) {
                        const idx = allIDXEvents.hasOwnProperty(publishedEventId) ? allIDXEvents[publishedEventId] : -1;
                        let formerEntity = idx === -1 ? null : eventsData[idx];
                        if (formerEntity && formerEntity.id !== publishedEventId) continue; // it's not the same
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
                        const idx = allIDXEvents.hasOwnProperty(publishedEventId) ? allIDXEvents[publishedEventId] : -1;
                        let formerEntity = idx === -1 ? null : eventsData[idx];
                        if (formerEntity && formerEntity.id !== publishedEventId) continue; // it's not the same
                        // check if speakers collection
                        eventsData[idx] = {...formerEntity, moderator: updatedSpeaker};
                    }
                }
                // update files on cache
                console.log(`synch worker updating cache files`);
                try {
                    const localNowUtc = Math.round(+new Date() / 1000);

                    await storeData(summit.id, getKey(summit.id, BUCKET_EVENTS_DATA_KEY), eventsData);
                    await putOnCache(`files_${summit.id}`, getKey(summit.id, `${BUCKET_EVENTS_DATA_KEY}_LAST_MODIFIED`), localNowUtc);
                    await storeData(summit.id, getKey(summit.id, BUCKET_EVENTS_IDX_DATA_KEY), allIDXEvents);
                    await putOnCache(`files_${summit.id}`, getKey(summit.id, `${BUCKET_EVENTS_IDX_DATA_KEY}_LAST_MODIFIED`), localNowUtc);
                    await storeData(summit.id, getKey(summit.id, BUCKET_SPEAKERS_DATA_KEY), allSpeakers);
                    await putOnCache(`files_${summit.id}`, getKey(summit.id, `${BUCKET_SPEAKERS_DATA_KEY}_LAST_MODIFIED`), localNowUtc);
                    await storeData(summit.id, getKey(summit.id, BUCKET_SPEAKERS_IDX_DATA_KEY), allIDXSpeakers);
                    await putOnCache(`files_${summit.id}`, getKey(summit.id, `${BUCKET_SPEAKERS_IDX_DATA_KEY}_LAST_MODIFIED`), localNowUtc);
                }
                catch (e){
                    console.log(e);
                }

                // post a message per entity
                console.log(`synch worker postMessage`);
                /* eslint-disable-next-line no-restricted-globals */
                self.postMessage({
                    payload,
                    entity,
                    summit,
                    eventsData,
                    allIDXEvents,
                    allSpeakers,
                    allIDXSpeakers
                });
            }
        }
        if(entity_type === 'Summit'){
            const entity = await fetchSummitById(summit.id, accessToken);
            if (entity_operator === 'UPDATE') {
                if (!entity) continue;

                console.log(`synch worker updating cache files`);
                try {
                    const localNowUtc = Math.round(+new Date() / 1000);
                    await storeData(summit.id, getKey(summit.id, BUCKET_SUMMIT_DATA_KEY), entity);
                    await putOnCache(`files_${summit.id}`, getKey(summit.id, `${BUCKET_SUMMIT_DATA_KEY}_LAST_MODIFIED`), localNowUtc);
                }
                catch (e){
                    console.log(e);
                }

                console.log(`synch worker postMessage`);
                /* eslint-disable-next-line no-restricted-globals */
                self.postMessage({
                    payload,
                    entity,
                    summit: entity,
                    eventsData,
                    allIDXEvents,
                    allSpeakers,
                    allIDXSpeakers
                });
            }
        }

        lastPayload = payload;
    }
};