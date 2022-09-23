import { START_LOADING, STOP_LOADING, LOGOUT_USER } from "openstack-uicore-foundation/lib/utils/actions";
import { UPDATE_CLOCK } from '../actions/timer-actions';

const localNowUtc = Math.round(+new Date() / 1000);
// calculate on initial state the nowUtc ( local ) and the summit phase using the json data
const DEFAULT_STATE = {
  loading: false,
  nowUtc: localNowUtc,
};

const clockReducer = (state = DEFAULT_STATE, action) => {
  const { type, payload } = action;

  switch (type) {
    case LOGOUT_USER:
      return DEFAULT_STATE;
    case START_LOADING:
      return { ...state, loading: true };
    case STOP_LOADING:
      return { ...state, loading: false };
    case UPDATE_CLOCK: {
      const { timestamp } = payload;
      return { ...state, nowUtc: timestamp };
    }
    default:
      return state;
  }
};

export default clockReducer;
