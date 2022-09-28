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
import {createAction} from "openstack-uicore-foundation/lib/utils/actions";

export const UPDATE_CLOCK = 'UPDATE_CLOCK';

export const defaultCurrentTime = () => {
    // fallback, depends on user clock better than nothing
    return Math.round(+new Date() / 1000);
};

export const updateClock = (timestamp) => (dispatch) => {
    dispatch(createAction(UPDATE_CLOCK)({ timestamp }));
};

export const getNow = () => (dispatch, getState) => {
    let { timerState } = getState();
    return timerState.nowUtc == null ? defaultCurrentTime() : timerState.nowUtc;
};