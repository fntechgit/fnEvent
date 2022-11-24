import speakers from '../content/speakers.json';

import { START_LOADING, STOP_LOADING } from "openstack-uicore-foundation/lib/utils/actions";
import { LOGOUT_USER } from "openstack-uicore-foundation/lib/security/actions";
import {RESET_STATE, SYNC_DATA} from "../actions/base-actions";

const DEFAULT_STATE = {
  loading: false,
  speakers: speakers,
};

const speakerReducer = (state = DEFAULT_STATE, action) => {
  const { type } = action;

  switch (type) {
    case RESET_STATE:
    case SYNC_DATA:
    case LOGOUT_USER:
      return DEFAULT_STATE;
    case START_LOADING:
      return { ...state, loading: true };
    case STOP_LOADING:
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default speakerReducer
