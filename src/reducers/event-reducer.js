import { START_LOADING, STOP_LOADING } from "openstack-uicore-foundation/lib/utils/actions";
import { LOGOUT_USER } from "openstack-uicore-foundation/lib/security/actions";
import { GET_EVENT_DATA, GET_EVENT_DATA_ERROR, SET_EVENT_LAST_UPDATE } from '../actions/event-actions'
import {RESET_STATE, SYNC_DATA} from "../actions/base-actions";

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
    case SYNC_DATA:
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
    default:
      return state;
  }
};

export default eventReducer;