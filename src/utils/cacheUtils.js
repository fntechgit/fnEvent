/**
 *
 * @param bucket
 * @param key
 * @param value
 * @param isJson
 * @param options
 * @returns {Promise<void>}
 */
export const putOnCache = async (bucket, key, value, isJson = false, options = {}) => {
    if(typeof caches !== 'undefined') {
        const cache = await caches.open(bucket);
        const response = new Response(isJson ? JSON.stringify(value) : value, options);
        await cache.put(`/${key}.json`, response);
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
        return data;
    }
    return null;
}

/**
 * @param bucket
 * @param key
 * @returns {Promise<null|boolean>}
 */
export const deleteFromCache = async (bucket, key) => {
    if(typeof caches !== 'undefined') {
        caches.open(bucket).then((cache) => {
            cache.delete(`/${key}.json`).then((response) => {
                return true;
            });
        });
    }
}