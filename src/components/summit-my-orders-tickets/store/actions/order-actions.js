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

import {
    authErrorHandler,
    getRequest,
    deleteRequest,
    createAction,
    stopLoading,
    startLoading
} from 'openstack-uicore-foundation/lib/utils/actions';
import history from '../history';

export const GET_USER_ORDERS = 'GET_ORDERS';
export const REFUND_ORDER = 'REFUND_ORDER';

export const getUserOrders = ({ page = 1, perPage = 5 }) => async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const { summitState: { summit } } = getState();

    const accessToken = await getAccessToken().catch(_ => history.replace(loginUrl));

    if (!accessToken) return;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        order: '-id',
        filter: 'status==Paid',
        relations: 'none',
        page: page,
        per_page: perPage
    };

    return getRequest(
        null,
        createAction(GET_USER_ORDERS),
        `${apiBaseUrl}/api/v1/summits/${summit.id}/orders/me`,
        authErrorHandler
    )(params)(dispatch).then(() => {
        dispatch(stopLoading());
    }).catch(e => {
        dispatch(stopLoading());
        return (e);
    });
}

export const cancelOrder = ({ order }) => async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const { orderState: { current_page } } = getState();

    const accessToken = await getAccessToken().catch(_ => history.replace(loginUrl));

    if (!accessToken) return;

    dispatch(startLoading());

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(REFUND_ORDER),
        `${apiBaseUrl}/api/v1/summits/all/orders/${order.id}/refund`,
        {},
        authErrorHandler
    )(params)(dispatch).then((payload) => {
        dispatch(getUserOrders({ page: current_page }));
        dispatch(stopLoading());
    }).catch(e => {
        dispatch(stopLoading());
        throw (e);
    });
};