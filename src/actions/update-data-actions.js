import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import { createAction } from "openstack-uicore-foundation/lib/utils/actions";
import { RELOAD_SCHED_DATA, RELOAD_USER_PROFILE } from "./schedule-actions";
import { getFromCache, putOnCache } from "../utils/cacheUtils";

const BUCKET_EVENTS_ETAG_KEY = 'eventsETAG';
const BUCKET_EVENTS_DATA_KEY = 'eventsJSON';
const BUCKET_EVENTS_IDX_ETAG_KEY = 'eventsIDXETAG';
const BUCKET_EVENTS_IDX_DATA_KEY = 'eventsIDXJSON';
const BUCKET_SUMMIT_ETAG_KEY = 'summitETAG';
const BUCKET_SUMMIT_DATA_KEY = 'summitJSON';
const BUCKET_SPEAKERS_ETAG_KEY = 'speakersETAG';
const BUCKET_SPEAKERS_DATA_KEY = 'speakersJSON';
const BUCKET_SPEAKERS_IDX_ETAG_KEY = 'speakersIDXETAG';
const BUCKET_SPEAKERS_IDX_DATA_KEY = 'speakersIDXJSON';
const BUCKET_EXTRA_QUESTIONS_ETAG_KEY = 'extraQuestionsETAG';
const BUCKET_EXTRA_QUESTIONS_DATA_KEY = 'extraQuestionsJSON';
const BUCKET_VOTABLE_PRES_ETAG_KEY = 'votablePresETAG';
const BUCKET_VOTABLE_PRES_DATA_KEY = 'votablePresJSON';

const getKey = (summitId, tag) => {
  return `${tag}_${summitId}`;
}

const getUrl = (summitId, fileName) => {
  if(!process.env.GATSBY_BUCKET_BASE_URL) return null;
  return `${process.env.GATSBY_BUCKET_BASE_URL}/${summitId}/${fileName}`;
}

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
  if(!url) return Promise.reject();
  const eTagKey = getKey(summitId, etagKeyPre);
  const dataKey = getKey(summitId, dataKeyPre);
  const eTag = await getFromCache('files', eTagKey);

  if (eTag) headers.headers = {'If-None-Match': eTag};

  return fetch(url, {
    method: 'GET',
    ...headers
  }).then(async (response) => {
    if ([304, 404].includes(response.status)) {
      // retrieve data from localStorage
      const storedData = await getFromCache('files', dataKey);
      if (storedData) {
        const data = decompressFromUTF16(storedData);
        return JSON.parse(data);
      } else {
        console.log(`Fetching updates: no data found in localStorage for ${fileName}.`)
      }
    } else if (response.status === 200) {
      const data = await response.json();

      // store etag
      const resETag = response.headers.get('etag');
      const lastModified = response.headers.get('last-modified');
      if (resETag) {
        await putOnCache('files', eTagKey, resETag);
      }

      if(lastModified && lastBuildTime){
        const lastModifiedEpoch = Date.parse(lastModified) / 1000;
        console.log(`${fileName} last modified ${lastModifiedEpoch} lastBuildTime ${lastBuildTime}`);
        if(lastModifiedEpoch < lastBuildTime){
          return null;
        }
      }

      if (data) {
        // store data
        const compressedData = compressToUTF16(JSON.stringify(data));
        await putOnCache('files',dataKey, compressedData);
        return data;
      } else {
        console.log('Error fetching updates: no data in response.');
      }

    } else {
      console.log('Error fetching updates: unknown response code: ', response?.status?.code);
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
  }).catch( e => null);
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
    }).catch( e => null);
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
    }).catch( e => null);
}

/**
 *
 * @param summitId
 * @param lastBuildTime
 * @returns {Promise<Response>}
 */
export const bucket_getExtraQuestions = (summitId, lastBuildTime = null) => {

  return fetchBucket(BUCKET_EXTRA_QUESTIONS_ETAG_KEY, BUCKET_EXTRA_QUESTIONS_DATA_KEY, 'extra-questions.json', summitId, lastBuildTime)
    .then(data => {
      return data;
    }).catch( e => null);
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
    }).catch( e => null);
}

export const bucket_getEventsIDX = (summitId, lastBuildTime = null) => {
  return fetchBucket(BUCKET_EVENTS_IDX_ETAG_KEY, BUCKET_EVENTS_IDX_DATA_KEY, 'events.idx.json', summitId, lastBuildTime)
      .then(data => {
        return data;
      }).catch( e => null);
}

export const bucket_getSpeakersIDX = (summitId, lastBuildTime = null) => {
  return fetchBucket(BUCKET_SPEAKERS_IDX_ETAG_KEY, BUCKET_SPEAKERS_IDX_DATA_KEY, 'speakers.idx.json', summitId, lastBuildTime)
      .then(data => {
        return data;
      }).catch( e => null);
}

/**
 *
 * @param payload
 * @param entity
 * @returns {(function(*, *): void)|*}
 */
export const synchEntityData = (payload, entity) => (dispatch, getState ) => {

  const { userState, loggedUserState, summitState, allSchedulesState } = getState();
  const { isLoggedUser } = loggedUserState;
  const { userProfile } = userState;
  const { summit } = summitState;
  const { allEvents, allIDXEvents} = allSchedulesState;

  const worker = new Worker(new URL('../workers/synch.worker.js', import.meta.url), {type: 'module'});

  worker.postMessage({
    payload: JSON.stringify(payload),
    entity: JSON.stringify(entity),
    summit: JSON.stringify(summit),
    allEvents: JSON.stringify(allEvents),
    allIDXEvents: JSON.stringify(allIDXEvents),
  });

  worker.onmessage = ({ data: { eventsData, allIDXEvents} }) => {

    console.log('calling synch worker on message ');

    dispatch(createAction(RELOAD_SCHED_DATA)({ isLoggedUser, userProfile, eventsData, summitData:summit, eventsIDXData: allIDXEvents }));

    if(isLoggedUser)
      dispatch(createAction(RELOAD_USER_PROFILE)({ isLoggedUser, userProfile }));

    worker.terminate();
  };
}