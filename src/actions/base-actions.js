import {
  createAction,
  getRequest,
  startLoading,
  stopLoading
} from 'openstack-uicore-foundation/lib/utils/actions';
import { customErrorHandler } from '../utils/customErrorHandler';
import summitBuildJson from '../content/summit.json';
import eventsBuildJson from '../content/events.json';
import speakersBuildJson from '../content/speakers.json';
import extraQuestionsBuildJson from '../content/extra-questions.json';
import {
  bucket_getEvents,
  bucket_getExtraQuestions,
  bucket_getSummit,
  bucket_getSpeakers
} from "./update-data-actions";
import {RELOAD_SCHED_DATA, RELOAD_USER_PROFILE} from "./schedule-actions";

export const RESET_STATE = 'RESET_STATE';
export const SYNC_DATA = 'SYNC_DATA';
export const GET_THIRD_PARTY_PROVIDERS = 'GET_THIRD_PARTY_PROVIDERS';

export const resetState = () => (dispatch) => {
  dispatch(createAction(RESET_STATE)({}));
};

/**
 *
 * @param eventsData
 * @param summitData
 * @param speakersData
 * @param extraQuestionsData
 * @returns {(function(*, *): Promise<void>)|*}
 */
export const syncData = (
    eventsData, summitData, speakersData, extraQuestionsData, eventsIDXData, speakersIXData
) => async (dispatch, getState) => {
  const { userState, loggedUserState } = getState();
  const { isLoggedUser } = loggedUserState;
  const { userProfile } = userState;
  const syncPayload = { isLoggedUser, userProfile, eventsData, summitData, speakersData, extraQuestionsData, eventsIDXData, speakersIXData };
  dispatch(createAction(SYNC_DATA)(syncPayload));

  if(isLoggedUser)
    dispatch(createAction(RELOAD_USER_PROFILE)({ isLoggedUser, userProfile }));
};

export const reloadScheduleData = (eventsData, summitData, eventsIDXData ) => async (dispatch, getState) => {
  const { userState, loggedUserState, summitState } = getState();
  const { isLoggedUser } = loggedUserState;
  const { userProfile } = userState;
  const { summit } = summitState;

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