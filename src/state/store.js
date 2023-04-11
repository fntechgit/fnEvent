import { applyMiddleware, compose, createStore } from "redux";
import { persistCombineReducers, persistStore } from "redux-persist";
import thunk from "redux-thunk";
import storage from "./reduxPersistStorage";

import { loggedUserReducer } from "openstack-uicore-foundation/lib/security/reducers";
import settingReducer from "../reducers/setting-reducer";
import userReducer from "../reducers/user-reducer";
import clockReducer from "../reducers/clock-reducer";
import summitReducer from "../reducers/summit-reducer";
import allSchedulesReducer from "../reducers/all-schedules-reducer";
import presentationsReducer from "../reducers/presentations-reducer";
import eventReducer from "../reducers/event-reducer";
import speakerReducer from "../reducers/speaker-reducer";
import sponsorReducer from "../reducers/sponsor-reducer";

// get from process.env bc window is not set yet
const clientId = process.env.GATSBY_OAUTH2_CLIENT_ID;
const summitID = process.env.GATSBY_SUMMIT_ID;

const config = {
  key: `root_${clientId}_${summitID}`,
  storage: storage,
  blacklist: [
    // this will be not saved to persistent storage see
    // https://github.com/rt2zz/redux-persist#blacklist--whitelist
    'summitState',
    'allSchedulesState',
    'presentationsState',
    'eventState',
    'speakerState',
    'sponsorState',
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

const onRehydrateComplete = () => {};

export const persistor = persistStore(store, null, onRehydrateComplete);

export default store;
