import {compressToBase64, decompressFromBase64} from "lz-string";
import {getFromCache, putOnCache} from "./cacheUtils";

export const getKey = (summitId, tag) => {
    return `${tag}_${summitId}`;
}

export const getUrl = (summitId, fileName) => {
    if(!process.env.GATSBY_BUCKET_BASE_URL) return null;
    return `${process.env.GATSBY_BUCKET_BASE_URL}/${summitId}/${fileName}`;
}

export const BUCKET_EVENTS_ETAG_KEY = 'eventsETAG';
export const BUCKET_EVENTS_DATA_KEY = 'eventsJSON';
export const BUCKET_EVENTS_IDX_ETAG_KEY = 'eventsIDXETAG';
export const BUCKET_EVENTS_IDX_DATA_KEY = 'eventsIDXJSON';
export const BUCKET_SUMMIT_ETAG_KEY = 'summitETAG';
export const BUCKET_SUMMIT_DATA_KEY = 'summitJSON';
export const BUCKET_SPEAKERS_ETAG_KEY = 'speakersETAG';
export const BUCKET_SPEAKERS_DATA_KEY = 'speakersJSON';
export const BUCKET_SPEAKERS_IDX_ETAG_KEY = 'speakersIDXETAG';
export const BUCKET_SPEAKERS_IDX_DATA_KEY = 'speakersIDXJSON';
export const BUCKET_VOTABLE_PRES_ETAG_KEY = 'votablePresETAG';
export const BUCKET_VOTABLE_PRES_DATA_KEY = 'votablePresJSON';

export const storeData = async (summitId, dataKey, data) => {
    // store data
    const options = {
        headers: {
            'Content-Type': 'text/plain; charset=UTF-16'
        }
    }
    const jsonStr = JSON.stringify(data);
    const compressedData = compressToBase64(jsonStr);
    await putOnCache(`files_${summitId}`, dataKey, compressedData, false, options);
    return data;
}

export const loadData = async (summitId, dataKey) => {
    const storedData = await getFromCache(`files_${summitId}`, dataKey);
    if (storedData) {
        const jsonStr = decompressFromBase64(storedData);
        return JSON.parse(jsonStr);
    }
    return null;
}

export const isSummitEventDataUpdate = (entity_type) => {
    return entity_type === 'Presentation' || entity_type === 'SummitEvent';
}

/**
 * @param summitId
 * @param bucketKey
 * @param data
 * @param lastModified
 * @returns {Promise<void>}
 */
export const saveFile = async (summitId, bucketKey , data, lastModified) => {
    try {
        await storeData(summitId, getKey(summitId, bucketKey), data);
        await putOnCache(`files_${summitId}`, getKey(summitId, `${bucketKey}_LAST_MODIFIED`), lastModified);
    }
    catch (e){
        console.log(e);
        return Promise.reject();
    }
    return Promise.resolve();
}