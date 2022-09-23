import { START_LOADING, STOP_LOADING, LOGOUT_USER } from "openstack-uicore-foundation/lib/utils/actions";

import {
  UPDATE_CLOCK,
  SUMMIT_PHASE_AFTER,
  SUMMIT_PHASE_DURING,
  SUMMIT_PHASE_BEFORE,
  EVENT_PHASE_AFTER,
  EVENT_PHASE_DURING,
  EVENT_PHASE_BEFORE,
  EVENT_PHASE_ADD
} from '../actions/clock-actions';
import summitData from '../content/summit.json';
import {RESET_STATE, SYNC_DATA} from "../actions/base-actions";

import { getSummitPhase } from '../utils/phasesUtils';

const localNowUtc = Math.round(+new Date() / 1000);
const {summit} = summitData;
// calculate on initial state the nowUtc ( local ) and the summit phase using the json data
const DEFAULT_STATE = {
  loading: false,
  nowUtc: localNowUtc,
  summit_phase:  getSummitPhase(summit, localNowUtc),
  events_phases: [],
};

const clockReducer = (state = DEFAULT_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case RESET_STATE:
    case LOGOUT_USER:
    case SYNC_DATA:
      return DEFAULT_STATE;
    case START_LOADING:
      return { ...state, loading: true };
    case STOP_LOADING:
      return { ...state, loading: false };
    case UPDATE_CLOCK: {
      const { timestamp } = payload;
      return { ...state, nowUtc: timestamp };
    }
    case SUMMIT_PHASE_AFTER: {
      return { ...state, summit_phase: payload };
    }
    case SUMMIT_PHASE_DURING: {
      return { ...state, summit_phase: payload };
    }
    case SUMMIT_PHASE_BEFORE: {
      return { ...state, summit_phase: payload };
    }
    case EVENT_PHASE_ADD: {
      return { ...state, events_phases: [...state.events_phases, payload] };
    }
    case EVENT_PHASE_AFTER: {
      let eventsPhases = [...new Set(state.events_phases.filter(s => s.id !== payload.id))];
      return { ...state, events_phases: [...eventsPhases, payload] };
    }
    case EVENT_PHASE_DURING: {
      let eventsPhases = [...new Set(state.events_phases.filter(s => s.id !== payload.id))];
      return { ...state, events_phases: [...eventsPhases, payload] };
    }
    case EVENT_PHASE_BEFORE: {
      let eventsPhases = [...new Set(state.events_phases.filter(s => s.id !== payload.id))];
      return { ...state, events_phases: [...eventsPhases, payload] };
    }
    default:
      return state;
  }
};

export default clockReducer;
