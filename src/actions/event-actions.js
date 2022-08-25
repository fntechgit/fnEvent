import {
    getRequest,
    createAction,
    stopLoading,
    startLoading,
} from 'openstack-uicore-foundation/lib/utils/actions';

import {
    getAccessToken,
    clearAccessToken,
} from 'openstack-uicore-foundation/lib/security/methods';

import {customErrorHandler} from '../utils/customErrorHandler';

import {LOGOUT_USER} from "openstack-uicore-foundation/lib/utils/actions";
import moment from "moment-timezone";
export const GET_EVENT_DATA = 'GET_EVENT_DATA';
export const GET_EVENT_DATA_ERROR = 'GET_EVENT_DATA_ERROR';
export const SET_EVENT_LAST_UPDATE = 'SET_EVENT_LAST_UPDATE';

export const handleResetReducers = () => (dispatch) => {
    dispatch(createAction(LOGOUT_USER)({}));
};

export const setEventLastUpdate = (lastUpdate) => (dispatch) => {
    dispatch(createAction(SET_EVENT_LAST_UPDATE)(lastUpdate));
}

/**
 *
 * @param eventId
 * @param checkLocal
 * @returns {(function(*, *): Promise<*>)|*}
 */
export const getEventById = (eventId, checkLocal = true) => async (dispatch, getState) => {

    dispatch(startLoading());

    if(checkLocal) {
        // if we have it on the reducer , provide that first
        let {allSchedulesState: {allEvents}} = getState();
        const event = allEvents.find(ev => ev.id === parseInt(eventId));

        if (event) {
            dispatch(createAction(GET_EVENT_DATA)({event}));
        }
    }

    // then refresh from api

    let accessToken;
    try {
        accessToken = await getAccessToken();
    } catch (e) {
        console.log('getAccessToken error: ', e);
        dispatch(stopLoading());
        return Promise.reject();
    }

    let params = {
        access_token: accessToken,
        expand: 'slides, links, videos, media_uploads, type, track, track.allowed_access_levels, location, location.venue, location.floor, speakers, moderator, sponsors, current_attendance, groups, rsvp_template, tags'
    };

    return getRequest(
        null,
        createAction(GET_EVENT_DATA),
        `${window.SUMMIT_API_BASE_URL}/api/v1/summits/${window.SUMMIT_ID}/events/${eventId}/published`,
        customErrorHandler
    )(params)(dispatch).then(() => {
        dispatch(stopLoading());
    }).catch(e => {
        dispatch(stopLoading());
        dispatch(createAction(GET_EVENT_DATA_ERROR)(e));
        console.log('ERROR: ', e);
        clearAccessToken();
        return (e);
    });

};