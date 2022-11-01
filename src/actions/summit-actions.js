import {
    getAccessToken,
    clearAccessToken,
} from 'openstack-uicore-foundation/lib/security/methods';

import {
    getRequest,
    createAction,
    startLoading,
    stopLoading,
} from 'openstack-uicore-foundation/lib/utils/actions';

import URI from "urijs";

import { customErrorHandler } from '../utils/customErrorHandler';

export const GET_EXTRA_QUESTIONS = 'GET_EXTRA_QUESTIONS';

export const getExtraQuestions = () => async (dispatch, getState) => {

    dispatch(startLoading());

    let accessToken;
    try {
        accessToken = await getAccessToken();
    } catch (e) {
        console.log('getAccessToken error: ', e);
        return Promise.reject(e);
    }

    let apiUrl = URI(`${window.API_BASE_URL}/api/v1/summits/${window.SUMMIT_ID}/order-extra-questions`);
    apiUrl.addQuery('filter[]', 'class==MainQuestion');
    apiUrl.addQuery('filter[]', 'usage==Ticket');
    apiUrl.addQuery('expand', '*sub_question_rules,*sub_question,*values')
    apiUrl.addQuery('access_token', accessToken);
    apiUrl.addQuery('order', 'order');
    apiUrl.addQuery('page', 1);
    apiUrl.addQuery('per_page', 100);

    return getRequest(
        null,
        createAction(GET_EXTRA_QUESTIONS),
        `${apiUrl}`,
        customErrorHandler
    )({})(dispatch).then(() => {
        dispatch(stopLoading());
    }).catch(e => {
        console.log('ERROR: ', e);
        clearAccessToken();
        dispatch(stopLoading());
        return Promise.reject(e);
    });
}

export const changeSummitTitle = () => (dispatch, getState) => {
    dispatch(createAction('CHANGE_TITLE')({}));
}