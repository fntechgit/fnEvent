import { LOGOUT_USER } from "openstack-uicore-foundation/lib/security/actions";
import { RESET_STATE } from "../actions/base-actions";
import { SET_USER } from "../actions/user-actions";
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

const DEFAULT_STATE = {};

const userReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;

    switch (type) {
        case RESET_STATE:
            return DEFAULT_STATE;
            break;
        case LOGOUT_USER:
            return DEFAULT_STATE;
        case SET_USER:
            return payload;
        default:
            return state;
    }
};

export default userReducer