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
import { useMemo } from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, persistCombineReducers } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { loggedUserReducer } from "openstack-uicore-foundation/lib/security/reducers"
import baseReducer from './reducers/base-reducer'
import summitReducer from './reducers/summit-reducer'
import orderReducer from './reducers/order-reducer'
import ticketReducer from './reducers/ticket-reducer'
import timerReducer from "./reducers/timer-reducer";
import userReducer from './reducers/user-reducer';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const getStore = ({
    clientId,
    apiBaseUrl,
    idpBaseUrl,
    loginUrl,
    supportEmail,
    getAccessToken,
    getUserProfile,
    summit,
    user
}) => {
    const config = {
        key: `root_registration_${clientId}`,
        storage,
        blacklist: [
            // this will be not saved to persistent storage see
            // https://github.com/rt2zz/redux-persist#blacklist--whitelist
            'orderState',
            'summitState',
            'ticketState',
            'timerState',
            'userState'
        ]
    };

    const reducers = persistCombineReducers(config, {
        globalState: baseReducer,
        loggedUserState: loggedUserReducer,
        summitState: summitReducer,
        orderState: orderReducer,
        ticketState: ticketReducer,
        timerState: timerReducer,
        userState: userReducer
    });

    const initialState = {
        // Note: set config/env variables on the `globalState` for use in components as needed.
        globalState: {
            clientId,
            apiBaseUrl,
            idpBaseUrl,
            loginUrl,
            supportEmail
        },
        userState: user,
        summitState: { summit }
    };

    const store = createStore(
        reducers,
        // Initialize the userState with the user passed in to the widget props.
        initialState,
        composeEnhancers(
            applyMiddleware(
                thunk.withExtraArgument({
                    apiBaseUrl,
                    idpBaseUrl,
                    loginUrl,
                    supportEmail,
                    getAccessToken,
                    getUserProfile
                })
            )
        )
    );

    return store;
};

export const getPersistor = (store) => {
    const onRehydrateComplete = () => {
        const { loggedUserState } = store.getState();

        // repopulate access token on global access variable
        window.accessToken = loggedUserState?.accessToken;
        window.idToken = loggedUserState?.idToken;
        window.sessionState = loggedUserState?.sessionState;
    };

    const persistor = persistStore(store, null, onRehydrateComplete);

    return persistor;
};

export const useInitStore = (config) => {
    const store = useMemo(() => getStore(config), []);
    const persistor = useMemo(() => getPersistor(store), [store]);

    return { store, persistor };
};
