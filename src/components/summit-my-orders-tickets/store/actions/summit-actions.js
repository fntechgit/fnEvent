/**
 * Copyright 2022
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import URI from "urijs";
import {
    getRequest,
    createAction,
    stopLoading,
    startLoading,
    authErrorHandler,
} from 'openstack-uicore-foundation/lib/utils/actions';
import history from "../history";

export const SET_SUMMIT = 'SET_SUMMIT';
export const GET_MAIN_EXTRA_QUESTIONS = 'GET_MAIN_EXTRA_QUESTIONS';
export const RECEIVE_MARKETING_SETTINGS = 'RECEIVE_MARKETING_SETTINGS';
export const CLEAR_MARKETING_SETTINGS = 'CLEAR_MARKETING_SETTINGS';

export const setSummit = (summit) => async (dispatch) => dispatch(createAction(SET_SUMMIT)(summit))

export const getMainOrderExtraQuestions = ({ summit }) => async (dispatch, getState, { apiBaseUrl, getAccessToken, loginUrl }) => {

    if (!summit) return Promise.reject();

    const accessToken = await getAccessToken().catch(_ => history.replace(loginUrl));

    if (!accessToken) return Promise.reject();

    const apiUrl = URI(`${apiBaseUrl}/api/v1/summits/${summit.id}/attendees/me/allowed-extra-questions`);

    apiUrl.addQuery('access_token', accessToken);
    apiUrl.addQuery('expand', '*sub_question_rules,*sub_question,*values');
    apiUrl.addQuery('order', 'order');
    apiUrl.addQuery('page', 1);
    apiUrl.addQuery('per_page', 100);

    dispatch(startLoading());

    return getRequest(
        null,
        createAction(GET_MAIN_EXTRA_QUESTIONS),
        `${apiUrl}`,
        authErrorHandler
    )({})(dispatch).then(() => {
        dispatch(stopLoading());
    }).catch(e => {
        console.log('ERROR: ', e);
        dispatch(stopLoading());
        return Promise.reject(e);
    });
};
