/**
 * Copyright 2019
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

import { default as t } from '../../i18n';
import IdTokenVerifier from 'idtoken-verifier';
import Swal from 'sweetalert2';
import history from '../history';
import {
    authErrorHandler,
    getRequest,
    putRequest,
    deleteRequest,
    createAction,
    stopLoading,
    startLoading
} from 'openstack-uicore-foundation/lib/utils/actions';
import { objectToQueryString } from 'openstack-uicore-foundation/lib/utils/methods';
import { getIdToken } from 'openstack-uicore-foundation/lib/security/methods';
import { getUserOrders } from "./order-actions";
import { updateProfile } from "./user-actions";

export const GET_TICKETS = 'GET_TICKETS';
export const SELECT_TICKET = 'SELECT_TICKET';
export const ASSIGN_TICKET = 'ASSIGN_TICKET';
export const REMOVE_TICKET_ATTENDEE = 'REMOVE_TICKET_ATTENDEE';
export const REFUND_TICKET = 'REFUND_TICKET';
export const RESEND_NOTIFICATION = 'RESEND_NOTIFICATION';

const customFetchErrorHandler = (response) => {
    let code = response.status;
    let msg = response.statusText;

    switch (code) {
        case 403:
            Swal.fire("ERROR", t("errors.user_not_authz"), "warning");
            break;
        case 401:
            Swal.fire("ERROR", t("errors.session_expired"), "error");
            break;
        case 412:
            msg = '';
            for (var [key, value] of Object.entries(response.errors)) {
                if (isNaN(key)) {
                    msg += key + ': ';
                }

                msg += value + '<br>';
            }
            Swal.fire("Validation error", msg, "warning");
            break;
        case 500:
            Swal.fire("ERROR", t("errors.server_error"), "error");
    }
};

export const getUserTickets = (ticketRefresh, page = 1, per_page = 5) => async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const { userState: { userProfile }, summitState: { summit } } = getState();

    const accessToken = await getAccessToken().catch(_ => history.replace(loginUrl));

    if (!accessToken) return;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        expand: 'order, owner, owner.extra_questions, order, badge, badge.features, refund_requests',
        order: '-id',
        'filter[]': [`status==Confirmed,status==Paid,status==Error`, `order_owner_id<>${userProfile.id}`],
        page: page,
        per_page: per_page,
    };

    return getRequest(
        null,
        createAction(GET_TICKETS),
        `${apiBaseUrl}/api/v1/summits/${summit.id}/orders/all/tickets/me`,
        authErrorHandler
    )(params)(dispatch).catch(e => {
        dispatch(stopLoading());
        return (e);
    });
};

export const assignAttendee = ({
    ticket,
    order,
    data: {
        attendee_email,
        attendee_first_name,
        attendee_last_name,
        attendee_company,
        disclaimer_accepted,
        extra_questions,
        reassignOrderId = null,
        refreshTickets = false
    }
}) => async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const accessToken = await getAccessToken().catch(_ => history.replace(loginUrl));

    if (!accessToken) return;

    dispatch(startLoading());

    const {
        orderState: { current_page: orderPage },
        ticketState: { current_page: ticketPage }
    } = getState();

    const params = {
        access_token: accessToken,
        expand: 'owner, owner.extra_questions'
    };

    const normalizedEntity =
        (!attendee_first_name & !attendee_last_name)
            ? { attendee_email }
            : {
                attendee_email,
                attendee_first_name,
                attendee_last_name,
                attendee_company,
                extra_questions,
                disclaimer_accepted
            }

    const orderId = reassignOrderId ? reassignOrderId : order.id;

    return putRequest(
        null,
        createAction(ASSIGN_TICKET),
        `${apiBaseUrl}/api/v1/summits/all/orders/${orderId}/tickets/${ticket.id}/attendee`,
        normalizedEntity,
        authErrorHandler
    )(params)(dispatch).then(() => {
        if (reassignOrderId) {
            refreshTickets ? dispatch(getUserTickets(ticket.id, ticketPage)) : dispatch(getUserOrders(order.id, orderPage));
            dispatch(getUserTickets(ticket.id, ticketPage))
        } else {
            dispatch(getUserOrders(order.id, orderPage));
        }
    }
    ).catch(e => {
        dispatch(stopLoading());
        return (e);
    });
}


export const editOwnedTicket = ({
    ticket,
    order,
    data: {
        attendee_email,
        attendee_first_name,
        attendee_last_name,
        attendee_company,
        disclaimer_accepted,
        extra_questions,
        updateOrder = false
    }
}) => async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const accessToken = await getAccessToken().catch(_ => history.replace(loginUrl));

    if (!accessToken) return;

    dispatch(startLoading());

    const {
        userState: { userProfile },
        orderState: { current_page: orderPage },
        ticketState: { current_page: ticketPage }
    } = getState();

    const params = {
        access_token: accessToken,
        expand: 'owner, owner.extra_questions'
    };

    const idToken = getIdToken();
    let company = '';
    if (idToken) {
        try {
            const verifier = new IdTokenVerifier();
            let jwt = verifier.decode(idToken);
            company = jwt.payload.company;
        }
        catch (e) {
            console.log('error', e);
        }
    }

    const normalizedEntity = {
        attendee_email,
        attendee_first_name,
        attendee_last_name,
        attendee_company,
        disclaimer_accepted,
        extra_questions
    };

    return putRequest(
        null,
        createAction(ASSIGN_TICKET),
        `${apiBaseUrl}/api/v1/summits/all/orders/all/tickets/${ticket.id}`,
        normalizedEntity,
        authErrorHandler
    )(params)(dispatch).then(() => {
        // Check if there's changes in the ticket data to update the profile
        if (attendee_company !== company || attendee_first_name !== userProfile.first_name || attendee_last_name !== userProfile.last_name) {
            const newProfile = {
                first_name: attendee_first_name,
                last_name: attendee_last_name,
                company: attendee_company
            };
            dispatch(updateProfile(newProfile));
        }
        updateOrder ? dispatch(getUserOrders(order.id, orderPage)) : dispatch(getUserTickets(null, ticketPage));
    }
    ).catch(e => {
        dispatch(stopLoading());
        return (e);
    });
};

export const resendNotification = ({ ticket }) => async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const accessToken = await getAccessToken().catch(_ => history.replace(loginUrl));

    if (!accessToken) return;

    dispatch(startLoading());

    const orderId = ticket.order ? ticket.order.id : ticket.order_id;

    const params = {
        access_token: accessToken
    };

    return putRequest(
        null,
        createAction(RESEND_NOTIFICATION),
        `${apiBaseUrl}/api/v1/summits/all/orders/${orderId}/tickets/${ticket.id}/attendee/reinvite`,
        authErrorHandler
    )(params)(dispatch).then(() => {
        dispatch(stopLoading());
    }).catch(e => {
        dispatch(stopLoading());
        return (e);
    });
};

export const removeAttendee = ({
    ticket,
    order,
    data: { attendee_email, fromTicket = false }
}) => async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const accessToken = await getAccessToken().catch(_ => history.replace(loginUrl));

    if (!accessToken) return;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        expand: 'order, owner, owner.extra_questions, order.summit'
    };

    const orderId = ticket.order ? ticket.order.id : ticket.order_id;

    return deleteRequest(
        null,
        createAction(REMOVE_TICKET_ATTENDEE),
        `${apiBaseUrl}/api/v1/summits/all/orders/${orderId}/tickets/${ticket.id}/attendee`,
        {},
        authErrorHandler
    )(params)(dispatch).then(() => {
        dispatch(assignAttendee({
            ticket,
            order,
            data: {
                attendee_email,
                attendee_first_name: '',
                attendee_last_name: '',
                attendee_company: '',
                disclaimer_accepted: false,
                extra_questions: [],
                reassignOrderId: orderId,
                refreshTickets: fromTicket
            }
        }));
    }).catch((e) => {
        console.log('error', e)
        dispatch(stopLoading());
        return (e);
    });
};

export const getTicketPDF = ({ ticket }) => async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const accessToken = await getAccessToken().catch(_ => history.replace(loginUrl));

    if (!accessToken) return;

    dispatch(startLoading());

    const params = {
        access_token: accessToken
    };

    const orderId = ticket.order ? ticket.order.id : ticket.order_id;

    const queryString = objectToQueryString(params);
    const apiUrl = `${apiBaseUrl}/api/v1/summits/all/orders/${orderId}/tickets/${ticket.id}/pdf?${queryString}`;

    return fetch(apiUrl, { responseType: 'Blob', headers: { 'Content-Type': 'application/pdf' } })
        .then((response) => {
            if (!response.ok) {
                dispatch(stopLoading());
                throw response;
            } else {
                return response.blob();
            }
        })
        .then((pdf) => {
            dispatch(stopLoading());
            let link = document.createElement('a');
            const url = window.URL.createObjectURL(pdf);
            link.href = url;
            link.download = 'ticket.pdf';
            link.dispatchEvent(new MouseEvent('click'));
        })
        .catch(customFetchErrorHandler);
};

export const refundTicket = ({ ticket, order }) => async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const accessToken = await getAccessToken().catch(_ => history.replace(loginUrl));

    if (!accessToken) return;

    dispatch(startLoading());

    const {
        orderState: { current_page: orderPage },
        ticketState: { current_page: ticketPage }
    } = getState();

    const orderId = ticket.order ? ticket.order.id : ticket.order_id;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(REFUND_TICKET),
        `${apiBaseUrl}/api/v1/summits/all/orders/${orderId}/tickets/${ticket.id}/refund`,
        {},
        authErrorHandler
    )(params)(dispatch).then((payload) => {
        dispatch(stopLoading());
        if (ticket.order_id) {
            dispatch(getUserOrders(order.id, orderPage));
        } else {
            dispatch(getUserTickets(ticket.id, ticketPage));
        }
    }
    ).catch(e => {
        dispatch(stopLoading());
        throw (e);
    });
};