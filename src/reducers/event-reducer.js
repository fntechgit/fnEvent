import { START_LOADING, STOP_LOADING } from "openstack-uicore-foundation/lib/utils/actions";
import { LOGOUT_USER } from "openstack-uicore-foundation/lib/security/actions";
import {GET_EVENT_DATA, GET_EVENT_DATA_ERROR, RELOAD_EVENT_STATE, SET_EVENT_LAST_UPDATE} from '../actions/event-actions-definitions'
import {RESET_STATE} from "../actions/base-actions";

const DEFAULT_STATE = {
  loading: false,
  event: null,
  lastUpdate: null
};

const eventReducer = (state = DEFAULT_STATE, action) => {
  const { type, payload } = action

  switch (type) {
    case RESET_STATE:
    case LOGOUT_USER:
    {
      return DEFAULT_STATE;
    }
    case SET_EVENT_LAST_UPDATE:{
      return {...state, lastUpdate: payload};
    }
    case START_LOADING:
      return { ...state, loading: true };
    case STOP_LOADING:
      return { ...state, loading: false };
    case GET_EVENT_DATA:
      const event = payload?.response ?? payload.event;
      // check if we need to update the current event or do we need to just use the new one
      const updatedEvent = event.id  === state?.event?.id ? {...state, ...event} : event;
      return { ...state, loading: false, event: updatedEvent };
    case GET_EVENT_DATA_ERROR: {
      return { ...state, loading: false, event: null }
    }
    // reload event state
    case RELOAD_EVENT_STATE:{
      return {...state, loading:false, event: payload};
    }
    default:
      return state;
  }
};

export default eventReducer;