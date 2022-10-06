import storage from './reduxPersistStorage';
import { persistCombineReducers, persistStore } from "redux-persist";
import { loggedUserReducer } from "openstack-uicore-foundation/lib/security/reducers";
import eventReducer from "../reducers/event-reducer";
import presentationsReducer from "../reducers/presentations-reducer";
import summitReducer from "../reducers/summit-reducer";
import userReducer from "../reducers/user-reducer";
import allSchedulesReducer from "../reducers/all-schedules-reducer";
import clockReducer from "../reducers/clock-reducer";
import speakerReducer from "../reducers/speaker-reducer";
import settingReducer from "../reducers/setting-reducer";
import sponsorReducer from "../reducers/sponsor-reducer";
import { applyMiddleware, compose, createStore } from "redux";
import thunk from "redux-thunk";
import { setSummit } from '../actions/summit-actions';
import { setEvents } from '../actions/event-actions';

import {CDN_SUMMIT_DATA_SECONDARY_STORAGE_BASE_URL, getEnvVariable, SUMMIT_ID} from "../utils/envVariables";
// get from process.env bc window is not set yet
const clientId = process.env.GATSBY_OAUTH2_CLIENT_ID;
const summitID = process.env.GATSBY_SUMMIT_ID;

const config = {
  key: `root_${clientId}_${summitID}`,
  storage: storage,
  blacklist: [
    // this will be not saved to persistent storage see
    // https://github.com/rt2zz/redux-persist#blacklist--whitelist
    'sponsorState',
    'speakerState',
    'eventState',
    'presentationsState',
    'summitState',
    'allSchedulesState',
  ]
};

const persistedReducers = persistCombineReducers(config, {
  loggedUserState: loggedUserReducer,
  settingState: settingReducer,
  userState: userReducer,
  allSchedulesState: allSchedulesReducer,
  clockState: clockReducer,
  eventState: eventReducer,
  presentationsState: presentationsReducer,
  summitState: summitReducer,
  speakerState: speakerReducer,
  sponsorState: sponsorReducer,
});

function appendLoggedUser({ getState }) {
  return next => action => {
    const { userState: { userProfile } } = getState();
    // Call the next dispatch method in the middleware chain.
    action.userProfile = userProfile;
    return next(action);
  }
}

const composeEnhancers = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

const store = createStore(persistedReducers, composeEnhancers(applyMiddleware(appendLoggedUser, thunk)));

const onRehydrateComplete = () => {

  const summitId = getEnvVariable(SUMMIT_ID)
  const cdnBaseUrl = getEnvVariable(CDN_SUMMIT_DATA_SECONDARY_STORAGE_BASE_URL);

  // reload summit data from secondary storage
  fetch(`${cdnBaseUrl}/${summitId}/summit.json`)
      .then(response => response.json())
      .then(json => {
            let {summit} = json;
            store.dispatch(setSummit(summit));
      }).catch(e => console.log(e));

  fetch(`${cdnBaseUrl}/${summitId}/events.json`)
      .then(response => response.json())
      .then(json => {
        let events = json;
        store.dispatch(setEvents(events));
      }).catch(e => console.log(e));

};

export const persistor = persistStore(store, null, onRehydrateComplete);

export default store;
