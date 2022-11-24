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
import { GET_MAIN_EXTRA_QUESTIONS, SET_SUMMIT } from "../actions/summit-actions";

const DEFAULT_STATE = {
    loading: true,
    summit: null,
    extra_questions: []
};

const summitReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;

    switch (type) {
        case RESET_STATE:
            return DEFAULT_STATE;
            break;
        case LOGOUT_USER:
            return DEFAULT_STATE;
        case START_LOADING:
            return { ...state, loading: true };
            break;
        case STOP_LOADING:
            return { ...state, loading: false };
            break;
        case SET_SUMMIT:
            return { ...state, summit: payload };
            break;
        case GET_MAIN_EXTRA_QUESTIONS: {
            const extraQuestions = payload.response.data;
            return { ...state, loading: false, extra_questions: extraQuestions }
        }
        default:
            return state;
            break;
    }
};

export default summitReducer
