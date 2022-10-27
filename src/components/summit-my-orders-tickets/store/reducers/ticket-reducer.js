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

import { START_LOADING, STOP_LOADING, LOGOUT_USER } from "openstack-uicore-foundation/lib/utils/actions";
import { RESET_STATE } from "../actions/base-actions";
import {
    GET_TICKETS,
    REMOVE_TICKET_ATTENDEE,
    ASSIGN_TICKET,
    GET_TICKETS_BY_ORDER,
    GET_TICKET_DETAILS,
    GET_ORDER_TICKET_DETAILS
} from "../actions/ticket-actions";

const DEFAULT_STATE = {
    loading: false,
    orderTickets: {
        total: 0,
        per_page: 5,
        current_page: 1,
        last_page: 1,
        tickets: []
    },
    selectedTicket: null,
    memberTickets: [],
    errors: {},
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0,
}

const ticketReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action

    switch (type) {
        case RESET_STATE:
            return DEFAULT_STATE;
            break;
        case LOGOUT_USER:
            return DEFAULT_STATE;
        case START_LOADING:
            return { ...state, loading: true };
        case STOP_LOADING:
            return { ...state, loading: false };
        case GET_TICKETS:
            let { data, current_page, total, last_page } = payload.response;
            const lastEditedTicket = state.selectedTicket;
            if (lastEditedTicket) {
                const ticketToUpdate = data.find(t => t.id === lastEditedTicket.id)
                data = [...data.filter(t => t.id !== lastEditedTicket.id), {...ticketToUpdate, ...lastEditedTicket}];
            }
            return { ...state, memberTickets: data, current_page, total, last_page, selectedTicket: null };
        case ASSIGN_TICKET:
            return { ...state, selectedTicket: payload.response };
        case REMOVE_TICKET_ATTENDEE:
            return { ...state, selectedTicket: payload.response };
        case GET_TICKETS_BY_ORDER: {
            const { total, per_page, current_page, last_page, data } = payload.response;
            return { ...state, orderTickets: { total, per_page, current_page, last_page, tickets: data } }
        }
        case GET_ORDER_TICKET_DETAILS: {
            const ticket = payload.response;
            const oldTicket = state.orderTickets.tickets.find(t => t.id === ticket.id);
            const updatedTicket = { ...oldTicket, ...ticket };
            const orderTickets = [...state.orderTickets.tickets.filter(t => t.id !== ticket.id), updatedTicket].sort((a, b) => b.id - a.id);
            return { ...state, orderTickets: { ...state.orderTickets, tickets: orderTickets} }
        }
        case GET_TICKET_DETAILS: {
            const ticket = payload.response;
            const oldTicket = state.memberTickets.find(t => t.id === ticket.id);
            const updatedTicket = { ...oldTicket, ...ticket };
            const memberTickets = [...state.memberTickets.filter(t => t.id !== ticket.id), updatedTicket].sort((a, b) => b.id - a.id);
            return { ...state, memberTickets }
        }
        default:
            return state;
    }
}

export default ticketReducer;
