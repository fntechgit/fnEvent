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
import {LOGOUT_USER} from "openstack-uicore-foundation/lib/security/actions";
import { RESET_STATE } from "../actions/base-actions";
import { RECEIVE_MARKETING_SETTINGS, CLEAR_MARKETING_SETTINGS } from '../actions/summit-actions';

const DEFAULT_STATE = {
    loading: false,
    marketingSettings: null,
    favicon: null,
}

const baseReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action

    switch (type) {
        case RESET_STATE:
            return { ...state, ...DEFAULT_STATE };
            break;
        case LOGOUT_USER:
            return { ...state, ...DEFAULT_STATE };
        case START_LOADING:
            return { ...state, loading: true };
            break;
        case STOP_LOADING:
            return { ...state, loading: false };
            break;
        case CLEAR_MARKETING_SETTINGS: {
            // reset state we are getting new summits
            return { ...state, marketingSettings: [], favicon: window.DEFAULT_FAV_ICON };
        }
        case RECEIVE_MARKETING_SETTINGS: {
            const { data } = payload.response;
            // default one
            let favicon = window.DEFAULT_FAV_ICON;
            // set color vars
            if (typeof document !== 'undefined') {
                data.forEach(setting => {
                    if (getComputedStyle(document.documentElement).getPropertyValue(`--${setting.key}`)) {
                        document.documentElement.style.setProperty(`--${setting.key}`, setting.value);
                        document.documentElement.style.setProperty(`--${setting.key}50`, `${setting.value}50`);
                    }
                    if (setting.key === 'favicon') {
                        favicon = setting.file;
                    }
                });
            }
            return { ...state, marketingSettings: data, favicon };
        }
        default:
            return state;
    }
}

export default baseReducer
