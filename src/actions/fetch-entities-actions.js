import URI from "urijs";

/**
 * @param summitId
 * @param eventId
 * @param accessToken
 * @returns {Promise<Response>}
 */
export const fetchEventById = async (summitId, eventId, accessToken = null) => {

    let apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/public/v1/summits/${summitId}/events/${eventId}/published`);
    if(accessToken){
        apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/v1/summits/${summitId}/events/${eventId}/published`);
        apiUrl.addQuery('access_token', accessToken);
    }

    apiUrl.addQuery('expand', 'slides, links, videos, media_uploads, type, track, track.allowed_access_levels, location, location.venue, location.floor, speakers, moderator, sponsors, current_attendance, groups, rsvp_template, tags');

    return fetch(apiUrl.toString(), {
        method: 'GET'
    }).then(async (response) => {
        if (response.status === 200) {
            return await response.json();
        }
        return null;
    });
}

/**
 *
 * @param summitId
 * @param locationId
 * @param expand
 * @param accessToken
 * @returns {Promise<Response>}
 */
export const fetchLocationById = async(summitId, locationId, expand, accessToken = null) => {

    let apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/public/v1/summits/${summitId}/locations/${locationId}`);
    if(accessToken){
        apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/v1/summits/${summitId}/locations/${locationId}`);
        apiUrl.addQuery('access_token', accessToken);
    }

    if(expand)
        apiUrl.addQuery('expand', expand);

    return fetch(apiUrl.toString(), {
        method: 'GET'
    }).then(async (response) => {
        if (response.status === 200) {
            return await response.json();
        }
        return null;
    });
}

/**
 *
 * @param summitId
 * @param speakerId
 * @param accessToken
 * @returns {Promise<Response>}
 */
export const fetchSpeakerById = async(summitId, speakerId, accessToken = null) => {

    let apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/public/v1/summits/${summitId}/speakers/${speakerId}`);

    if(accessToken){
        apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/v1/summits/${summitId}/speaker/${speakerId}`);
        apiUrl.addQuery('access_token', accessToken);
    }

    return fetch(apiUrl.toString(), {
        method: 'GET'
    }).then(async (response) => {
        if (response.status === 200) {
            return await response.json();
        }
        return null;
    });
}