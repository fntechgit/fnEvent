import { combineReducers } from "redux";
import { isString } from "lodash";

import { VotingPeriod } from "../model/VotingPeriod";

import { START_LOADING, STOP_LOADING } from "openstack-uicore-foundation/lib/utils/actions";
import { LOGOUT_USER } from "openstack-uicore-foundation/lib/security/actions";
import { RESET_STATE, SYNC_DATA } from "../actions/base-actions-definitions";

import {
  CAST_PRESENTATION_VOTE_REQUEST,
  UNCAST_PRESENTATION_VOTE_REQUEST,
  TOGGLE_PRESENTATION_VOTE
} from "../actions/user-actions";

import {
  SET_INITIAL_DATASET,
  PRESENTATIONS_PAGE_REQUEST,
  PRESENTATIONS_PAGE_RESPONSE,
  VOTEABLE_PRESENTATIONS_UPDATE_FILTER,
  GET_PRESENTATION_DETAILS,
  GET_RECOMMENDED_PRESENTATIONS,
  VOTING_PERIODS_CREATE,
  VOTING_PERIODS_PHASE_CHANGE,
} from "../actions/presentation-actions";

import { filterEventsByAccessLevels } from "../utils/authorizedGroups";
import { randomSort } from "../utils/filterUtils";

import DEFAULT_FILTERS_STATE from "content/posters-filters.json";
import allVoteablePresentations from "data/voteable-presentations.json";

const DEFAULT_VOTEABLE_PRESENTATIONS_STATE = {
  filters: { ...DEFAULT_FILTERS_STATE },
  // collection used to create filters (read only)
  ssrPresentations : [],
  // initial value same as ssrPresentations but gets updated with fresh data
  allPresentations: [],
  // updatedPresentations filtered by applied filters from filters widget, used to feed the poster grid widget
  filteredPresentations: [],
  // stores user profile set in initial data set for future access level filtering
  detailedPresentation: null,
  recommendedPresentations: [],
  loading: false
};

const voteablePresentations = (state = DEFAULT_VOTEABLE_PRESENTATIONS_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case SYNC_DATA:
      return DEFAULT_VOTEABLE_PRESENTATIONS_STATE;
    case SET_INITIAL_DATASET: {
      const { userProfile: currentUserProfile } = action;
      // pre filter by user access levels
      const filteredEvents = randomSort(filterEventsByAccessLevels(allVoteablePresentations, currentUserProfile));
      return { ...state,
        ssrPresentations: filteredEvents,
        allPresentations: filteredEvents,
        filteredPresentations: filteredEvents,
      };
    }
    case PRESENTATIONS_PAGE_RESPONSE: {
      const { userProfile: currentUserProfile } = action;
      const { filters, allPresentations } = state;
      const { response: { data } } = payload;
      // get the new data from api bc the temporal public urls
      const oldPresentations = [...allPresentations];
      let newPresentations = [];
      data.forEach(presentation => {
        const index = allPresentations.findIndex((p) => p.id === presentation.id);
        if (index !== -1) {
          // replace presentation on index
          oldPresentations.splice(index, 1, {...oldPresentations[index], ...presentation});
        } else {
          newPresentations.push(presentation);
        }
      });
      // pre filter new presentations by user access levels
      newPresentations = filterEventsByAccessLevels(newPresentations, currentUserProfile);
      const updatedPresentations = [...oldPresentations, ...newPresentations];
      return { ...state,
        allPresentations: updatedPresentations,
        filteredPresentations: getFilteredVoteablePresentations(updatedPresentations, filters)
      };
    }
    case VOTEABLE_PRESENTATIONS_UPDATE_FILTER: {
      const { type: filterType, values } = payload;
      const { filters, allPresentations } = state;
      // update filters with new values
      const newFilters =  {
        ...filters,
        [filterType]: {
          ...filters[filterType],
          values
        }
      };
      
      return {
        ...state ,
        filters : newFilters ,
        // refilter events
        filteredPresentations : getFilteredVoteablePresentations(allPresentations, newFilters)
      };
    }
    case GET_PRESENTATION_DETAILS: {
      const presentation = payload.response || payload.poster;      
      return { ...state, detailedPresentation: presentation };
    }
    case GET_RECOMMENDED_PRESENTATIONS: {
      let recommended = [...payload.response.data.filter(e => e.id !== state.detailedPresentation.id)];
      recommended = [...recommended.slice(0, recommended.length === 5 ? -2 : -1)];
      return { ...state, loading: false, recommendedPresentations: recommended };
    }
    case START_LOADING:
      return { ...state, loading: true };
    case STOP_LOADING:
      return { ...state, loading: false };
    default:
      return state;
  }
};

const votingPeriods = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case RESET_STATE:
    case LOGOUT_USER:
    case SYNC_DATA:
      return {};
    case VOTING_PERIODS_CREATE: {
      var newState = { ...state };
      for (const { trackGroupId, votingPeriod } of payload) {
        newState = {
          ...newState,
          [trackGroupId]: votingPeriod
        };
      }
      return newState;
    }
    case VOTING_PERIODS_PHASE_CHANGE: {
      var newState = { ...state };
      for (const { trackGroupId, phase } of payload) {
        newState = {
          ...newState,
          [trackGroupId]: {
            ...newState[trackGroupId], 
            phase
          }
        };
      }
      return newState;
    }
    case CAST_PRESENTATION_VOTE_REQUEST:
    case UNCAST_PRESENTATION_VOTE_REQUEST:
    case TOGGLE_PRESENTATION_VOTE: {
      const { presentation: { track: { track_groups: trackGroups } }, isVoted, reverting } = payload;
      const updatedTrackGroupVotingPeriods = {};
      trackGroups.forEach(trackGroupId => {
        const votingPeriod = state[trackGroupId];
        if (votingPeriod) {
          const updatedVotedPeriod = VotingPeriod({ ...votingPeriod });
          if (type === CAST_PRESENTATION_VOTE_REQUEST) {
            updatedVotedPeriod.addVotes = 1;
          } else if (type === UNCAST_PRESENTATION_VOTE_REQUEST ||
                    // case below is when we are reverting a vote because a vote was casted above limit allowance
                    (type === TOGGLE_PRESENTATION_VOTE && (isVoted !== reverting !== undefined) && (!isVoted && reverting))) {
            updatedVotedPeriod.substractVotes = 1;
          }
          updatedTrackGroupVotingPeriods[trackGroupId] = { ...updatedVotedPeriod };
        }
      });
      return {
        ...state,
        ...updatedTrackGroupVotingPeriods
      };
    }
    default:
      return state;
  }
}

const pages = (pages = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case SYNC_DATA:
      return {};
    case PRESENTATIONS_PAGE_REQUEST:
      const { page } = payload;
      return {
        ...pages,
        [page]: {
          ids: [],
          fetching: true,
        }
      };
    case PRESENTATIONS_PAGE_RESPONSE:
      const { response: { current_page, data } } = payload;
      return {
        ...pages,
        [current_page]: {
          ids: data.map(p => p.id),
          fetching: false,
        }
      };
    default:
      return pages;
  }
};

const currentPage = (currentPage = 1, action) => {
  const { type, payload } = action;
  return type === PRESENTATIONS_PAGE_REQUEST ? payload.page : currentPage;
};

const lastPage = (lastPage = null, action) => {
  const { type, payload } = action;
  return type === PRESENTATIONS_PAGE_RESPONSE ? payload.response.last_page : lastPage;
};

const pagination = combineReducers({
  pages,
  currentPage,
  lastPage
});

export default combineReducers({
  voteablePresentations,
  votingPeriods,
  pagination,
});

/**
 * local filtering
 * @param events
 * @param filters
 * @returns {*}
 */
export const getFilteredVoteablePresentations = (events, filters) => {
  return events.filter((ev) => {
    let valid = true;

    if (filters.track?.values.length > 0) {
      valid = filters.track.values.includes(ev.track.id);
      if (!valid) return false;
    }

    if (filters.speakers?.values.length > 0) {
      valid = ev.speakers?.some((s) => {
        return filters.speakers.values.some((v) => v === s.id);
      });
      if (!valid) return false;
    }

    if (filters.tags?.values.length > 0) {
      valid = ev.tags?.some((t) => filters.tags.values.includes(t.id));
      if (!valid) return false;
    }

    if (filters.abstract?.values && isString(filters.abstract.values)) {
      valid = ev.description
          .toLowerCase()
          .includes(filters.abstract.values.toLowerCase());
      if (!valid) return false;
    }

    if (filters.custom_order?.values && parseInt(filters.custom_order.values) > 0) {
      valid = parseInt( ev.custom_order)  === parseInt(filters.custom_order.values)
      if (!valid) return false;
    }

    return true;
  });
};
