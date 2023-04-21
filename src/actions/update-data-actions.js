import {createAction} from "openstack-uicore-foundation/lib/utils/actions";
import {RELOAD_USER_PROFILE} from "./schedule-actions";
import {getFromCache, putOnCache, deleteFromCache} from "../utils/cacheUtils";
import {SYNC_DATA } from './base-actions-definitions';
import {RELOAD_EVENT_STATE} from './event-actions-definitions';
import {
    getKey,
    getUrl,
    storeData,
    loadData,
    BUCKET_EVENTS_ETAG_KEY,
    BUCKET_EVENTS_DATA_KEY,
    BUCKET_EVENTS_IDX_ETAG_KEY,
    BUCKET_EVENTS_IDX_DATA_KEY,
    BUCKET_SUMMIT_ETAG_KEY,
    BUCKET_SUMMIT_DATA_KEY,
    BUCKET_SPEAKERS_ETAG_KEY,
    BUCKET_SPEAKERS_DATA_KEY,
    BUCKET_SPEAKERS_IDX_ETAG_KEY,
    BUCKET_SPEAKERS_IDX_DATA_KEY,
    BUCKET_VOTABLE_PRES_ETAG_KEY,
    BUCKET_VOTABLE_PRES_DATA_KEY,
    isSummitEventDataUpdate,
} from '../utils/dataUpdatesUtils';

/**
 *
 * @param etagKeyPre
 * @param dataKeyPre
 * @param fileName
 * @param summitId
 * @param lastBuildTime
 * @returns {Promise<Response>}
 */
const fetchBucket = async (etagKeyPre, dataKeyPre, fileName, summitId, lastBuildTime) => {


    const headers = {};
    const url = getUrl(summitId, fileName);
    const eTagKey = getKey(summitId, etagKeyPre);
    const dataKey = getKey(summitId, dataKeyPre);
    const lastModifiedKey = getKey(summitId, `${dataKeyPre}_LAST_MODIFIED`);
    const eTag = await getFromCache(`files_${summitId}`, eTagKey);
    const lastModifiedStored = await getFromCache(`files_${summitId}`, lastModifiedKey);

    if (eTag) headers.headers = {'If-None-Match': eTag};

    console.log(`fetchBucket ${url} eTag ${eTag} lastModifiedStored ${lastModifiedStored} lastBuildTime ${lastBuildTime}`);

    return fetch(url, {
        method: 'GET',
        ...headers
    }).then(async (response) => {
        console.log(`fetchBucket ${url} response.status ${response.status}`);
        if ([304, 404].includes(response.status)) {
            // retrieve data from localStorage if its newer than we have on SSR
            if(lastModifiedStored < lastBuildTime){
                console.log(`fetchBucket ${url} lastBuildTime ${lastBuildTime} is recent than what we have stored ${lastModifiedStored}, we will use SSR files`);
                await deleteFromCache(`files_${summitId}`, dataKey);
                return null;
            }
            const file = await loadData(summitId, dataKey);
            return {file, lastModified : lastModifiedStored ? parseInt(lastModifiedStored) : 0};
        } else if (response.status === 200) {
            const data = await response.json();

            // store etag
            const resETag = response.headers.get('etag');
            const resLastModified = response.headers.get('last-modified');

            if (resETag) {
                await putOnCache(`files_${summitId}`, eTagKey, resETag);
            }

            if (resLastModified && lastBuildTime) {
                const lastModifiedFieldEpoch = Date.parse(resLastModified);
                console.log(`fetchBucket ${url} ${fileName} last modified ${lastModifiedFieldEpoch} lastBuildTime ${lastBuildTime}`);
                if (lastModifiedFieldEpoch < lastBuildTime) {
                    console.log(`fetchBucket ${url} lastBuildTime is recent, we will use SSR files`);
                    await deleteFromCache(`files_${summitId}`, dataKey);
                    return null;
                }
                // set the last modified from remove
                await putOnCache(`files_${summitId}`,lastModifiedKey, lastModifiedFieldEpoch);
            }

            if (data) {
                const file = await storeData(summitId, dataKey, data);
                return {file, lastModified : resLastModified ? Date.parse(resLastModified) : 0} ;
            }

            console.log(`fetchBucket ${url} Error fetching updates: no data in response.`);
        } else {
            console.log(`fetchBucket ${url} Error fetching updates: unknown response code: `, response?.status?.code);
        }

        return null;

    });
}

/**
 *
 * @param summitId
 * @param lastBuildTime
 * @returns {Promise<Response>}
 */
export const bucket_getEvents = async (summitId, lastBuildTime = null) => {
    return fetchBucket(BUCKET_EVENTS_ETAG_KEY, BUCKET_EVENTS_DATA_KEY, 'events.json', summitId, lastBuildTime).then(data => {
        return data;
    }).catch(e => null);
}

/**
 *
 * @param summitId
 * @param lastBuildTime
 * @returns {Promise<Response>}
 */
export const bucket_getSummit = (summitId, lastBuildTime = null) => {

    return fetchBucket(BUCKET_SUMMIT_ETAG_KEY, BUCKET_SUMMIT_DATA_KEY, 'summit.json', summitId, lastBuildTime)
        .then(data => {
            return data;
        }).catch(e => null);
}

/**
 *
 * @param summitId
 * @param lastBuildTime
 * @returns {Promise<Response>}
 */
export const bucket_getSpeakers = (summitId, lastBuildTime = null) => {

    return fetchBucket(BUCKET_SPEAKERS_ETAG_KEY, BUCKET_SPEAKERS_DATA_KEY, 'speakers.json', summitId, lastBuildTime)
        .then(data => {
            return data;
        }).catch(e => null);
}

/**
 *
 * @param summitId
 * @param lastBuildTime
 * @returns {Promise<Response>}
 */
export const bucket_getVotablePresentations = (summitId, lastBuildTime = null) => {

    return fetchBucket(BUCKET_VOTABLE_PRES_ETAG_KEY, BUCKET_VOTABLE_PRES_DATA_KEY, 'voteable-presentations.json', summitId, lastBuildTime)
        .then(data => {
            return data;
        }).catch(e => null);
}

export const bucket_getEventsIDX = (summitId, lastBuildTime = null) => {
    return fetchBucket(BUCKET_EVENTS_IDX_ETAG_KEY, BUCKET_EVENTS_IDX_DATA_KEY, 'events.idx.json', summitId, lastBuildTime)
        .then(data => {
            return data;
        }).catch(e => null);
}

export const bucket_getSpeakersIDX = (summitId, lastBuildTime = null) => {
    return fetchBucket(BUCKET_SPEAKERS_IDX_ETAG_KEY, BUCKET_SPEAKERS_IDX_DATA_KEY, 'speakers.idx.json', summitId, lastBuildTime)
        .then(data => {
            return data;
        }).catch(e => null);
}

/**
 *
 * @param payload
 * @param entity
 * @param summit
 * @param eventsData
 * @param allIDXEvents
 * @param allSpeakers
 * @param allIDXSpeakers
 * @returns {(function(*, *): void)|*}
 */
export const synchEntityData = (
    payload,
    entity,
    summit,
    eventsData,
    allIDXEvents,
    allSpeakers,
    allIDXSpeakers
) => (dispatch, getState) => {

    const {userState, loggedUserState, eventState} = getState();
    const {isLoggedUser} = loggedUserState;
    const {userProfile} = userState;
    const {event} = eventState;

    // we need to redefine the action to avoid including import { navigate } from "gatsby";
    // introduced by dependency of src/utils/expiredToken.js
    dispatch(createAction(SYNC_DATA)({
        isLoggedUser,
        userProfile,
        eventsData,
        summitData: summit,
        eventsIDXData: allIDXEvents,
        speakersData: allSpeakers,
        allIDXSpeakers: allIDXSpeakers,
    }));

    if (isLoggedUser)
        dispatch(createAction(RELOAD_USER_PROFILE)({isLoggedUser, userProfile}));

    const {entity_operator, entity_type} = payload;

    // check if it's a presentation to reload event state
    if (entity && isSummitEventDataUpdate(entity_type) && entity_operator === 'UPDATE' && event && event?.id === entity?.id) {
        // we need to redefine the action to avoid including import { navigate } from "gatsby";
        // introduced by dependency of src/utils/expiredToken.js
        dispatch(createAction(RELOAD_EVENT_STATE)(entity));
    }

}