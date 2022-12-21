import {compressToUTF16} from "lz-string";
import {putOnCache} from "./cacheUtils";

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
export const BUCKET_EXTRA_QUESTIONS_ETAG_KEY = 'extraQuestionsETAG';
export const BUCKET_EXTRA_QUESTIONS_DATA_KEY = 'extraQuestionsJSON';
export const BUCKET_VOTABLE_PRES_ETAG_KEY = 'votablePresETAG';
export const BUCKET_VOTABLE_PRES_DATA_KEY = 'votablePresJSON';

export const storeData = async (summitId, dataKey, data) => {
    // store data
    const compressedData = compressToUTF16(JSON.stringify(data));
    await putOnCache(`files_${summitId}`, dataKey, compressedData);
    return data;
}

export const isSummitEventDataUpdate = (entity_type) => {
    return entity_type === 'Presentation' || entity_type === 'SummitEvent';
}