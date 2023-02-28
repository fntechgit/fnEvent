import { START_LOADING, STOP_LOADING } from "openstack-uicore-foundation/lib/utils/actions";
import { LOGOUT_USER } from "openstack-uicore-foundation/lib/security/actions";

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
import {RESET_STATE, SYNC_DATA} from "../actions/base-actions-definitions";

import {getEventPhase, getSummitPhase} from '../utils/phasesUtils';

const localNowUtc = Math.round(+new Date() / 1000);

// calculate on initial state the nowUtc ( local ) and the summit phase using the json data
const DEFAULT_STATE = {
  loading: false,
  nowUtc: localNowUtc,
  summit_phase:  getSummitPhase(summitData, localNowUtc),
  events_phases: [],
};

const clockReducer = (state = DEFAULT_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case RESET_STATE:
    case LOGOUT_USER:
      return DEFAULT_STATE;
    case SYNC_DATA: {
      const {eventsData, summitData, eventsIDXData } = payload;
      // recalculate existent event phases
      let oldEventPhases = state.events_phases;
      let newEventPhases = oldEventPhases.filter((oldEvent) => {
        return eventsIDXData.hasOwnProperty(oldEvent.id) &&
            (eventsData.length - 1) >= eventsIDXData[oldEvent.id] &&
        eventsData[eventsIDXData[oldEvent.id]].id == oldEvent.id;
      }).map(oldEvent => {

        let idx = eventsIDXData[oldEvent.id];
        let e = eventsData[idx];

        let newEvent = {
          id: e.id,
          start_date: e.start_date,
          end_date: e.end_date,
          phase: null
        };

        const newPhase = getEventPhase(newEvent, state.nowUtc);

        return {...newEvent, phase: newPhase}
      });

      return {...state, summit_phase: getSummitPhase(summitData, state.nowUtc), events_phases:newEventPhases };
    }
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
