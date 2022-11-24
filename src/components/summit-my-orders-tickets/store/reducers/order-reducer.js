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

import { START_LOADING, STOP_LOADING } from "openstack-uicore-foundation/lib/utils/actions";
import { LOGOUT_USER } from "openstack-uicore-foundation/lib/security/actions";
import { RESET_STATE } from "../actions/base-actions";

import {
    GET_USER_ORDERS,
    REFUND_ORDER,
} from "../actions/order-actions";

const DEFAULT_ENTITY = {
    first_name: '',
    last_name: '',
    email: '',
    company: {
        name: '',
        id: null
    },
    billing_country: '',
    billing_address: '',
    billing_address_two: '',
    billing_city: '',
    billing_state: '',
    billing_zipcode: '',
    currentStep: null,
    tickets: [],
    reservation: {},
    checkout: {},
}

const DEFAULT_STATE = {
    purchaseOrder: DEFAULT_ENTITY,
    memberOrders: [],
    errors: {},
    stripeForm: false,
    loaded: false,
    loading: false,
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0,
}

const orderReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action

    switch (type) {
        case RESET_STATE:
            return DEFAULT_STATE;
            break;
        case LOGOUT_USER:
            return { ...DEFAULT_STATE, purchaseOrder: { ...state.purchaseOrder } };
            break;
        case START_LOADING:
            return { ...state, loading: true };
            break;
        case STOP_LOADING:
            return { ...state, loading: false };
            break;
        case GET_USER_ORDERS:
            let { data, current_page, total, last_page } = payload.response;
            return { ...state, memberOrders: data, current_page, total, last_page };
            break;
        case REFUND_ORDER:
            return { ...state }
        default:
            return state;
            break;
    }
}

export default orderReducer
