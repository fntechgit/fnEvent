/**
 * @param bucket
 * @param key
 * @param value
 * @param isJson
 * @returns {Promise<void>}
 */
export const putOnCache = async (bucket, key, value, isJson = false) => {
    if(typeof caches !== 'undefined') {
        const cache = await caches.open(bucket);
        const response = new Response(isJson ? JSON.stringify(value) : value);
        await cache.put(`/${key}.json`, response);
        console.log(`stored on local bucket ${bucket} key ${key}`);
    }
}

/**
 * @param bucket
 * @param key
 * @param isJson
 * @returns {Promise<any|string>}
 */
export const getFromCache = async (bucket, key, isJson = false) => {
    if(typeof caches !== 'undefined') {
        const cache = await caches.open(bucket);
        const item = await cache.match(`/${key}.json`);
        if (!item) return null;
        const data = isJson ? await item.json() : await item.text();
        console.log(`retrieve  from local bucket ${bucket} key ${key}`);
        return data;
    }
    return null;
}

/**
 *
 * @param bucket
 * @returns {Promise<boolean>}
 */
export const deleteFromCache =  (bucket) => {
    return caches.delete(bucket);
}

/**
 *
 * @param summit
 * @returns {`novelties_queue_${string}}`}
 */
export const getNoveltiesBucketKey = (summit) => {
    return `novelties_queue_${summit.id}}`;
}