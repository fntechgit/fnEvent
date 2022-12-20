import {
  createAction,
  getRequest,
  startLoading,
  stopLoading
} from 'openstack-uicore-foundation/lib/utils/actions';
import { customErrorHandler } from '../utils/customErrorHandler';

import {RELOAD_SCHED_DATA, RELOAD_USER_PROFILE} from "./schedule-actions";

import {RESET_STATE, SYNC_DATA, GET_THIRD_PARTY_PROVIDERS, UPDATE_LAST_CHECK_FOR_NOVELTIES } from './base-actions-definitions';

export const resetState = () => (dispatch) => {
  dispatch(createAction(RESET_STATE)({}));
};

export const updateLastCheckForNovelties = (date) => (dispatch) => {
  dispatch(createAction(UPDATE_LAST_CHECK_FOR_NOVELTIES)(date));
}
/**
 *
 * @param eventsData
 * @param summitData
 * @param speakersData
 * @param extraQuestionsData
 * @param eventsIDXData
 * @param speakersIDXData
 * @returns {(function(*, *): Promise<void>)|*}
 */
export const syncData = (
    eventsData, summitData, speakersData, extraQuestionsData, eventsIDXData, speakersIDXData
) => async (dispatch, getState) => {
  const { userState, loggedUserState } = getState();
  const { isLoggedUser } = loggedUserState;
  const { userProfile } = userState;
  const syncPayload = { isLoggedUser, userProfile, eventsData, summitData, speakersData, extraQuestionsData, eventsIDXData, allIDXSpeakers: speakersIDXData };
  dispatch(createAction(SYNC_DATA)(syncPayload));

  if(isLoggedUser)
    dispatch(createAction(RELOAD_USER_PROFILE)({ isLoggedUser, userProfile }));
};

export const reloadScheduleData = (eventsData, summitData, eventsIDXData ) => async (dispatch, getState) => {
  const { userState, loggedUserState } = getState();
  const { isLoggedUser } = loggedUserState;
  const { userProfile } = userState;

  dispatch(createAction(RELOAD_SCHED_DATA)({ isLoggedUser, userProfile, eventsData, summitData, eventsIDXData }));

  if(isLoggedUser)
    dispatch(createAction(RELOAD_USER_PROFILE)({ isLoggedUser, userProfile }));
};

export const getThirdPartyProviders = () => (dispatch) => {
  dispatch(startLoading());

  return getRequest(
    null,
    createAction(GET_THIRD_PARTY_PROVIDERS),
    `${window.IDP_BASE_URL}/oauth2/.well-known/openid-configuration`,
    customErrorHandler
  )({})(dispatch).then(payload => {
    dispatch(stopLoading());
    return (payload)
  }).catch(e => {
    dispatch(stopLoading());
    return (e);
  });
}