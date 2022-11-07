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
import { GET_EXTRA_QUESTIONS } from './user-actions';

export const RESET_STATE = 'RESET_STATE';
export const SYNC_DATA = 'SYNC_DATA';
export const GET_THIRD_PARTY_PROVIDERS = 'GET_THIRD_PARTY_PROVIDERS';

export const resetState = () => (dispatch) => {
  dispatch(createAction(RESET_STATE)({}));
};

export const syncData = () => async (dispatch, getState) => {
  const { userState, loggedUserState, summitState } = getState();
  const { isLoggedUser } = loggedUserState;
  const { userProfile } = userState;
  const { summit } = summitState;

  // events
  let eventsData = await bucket_getEvents(summit.id);
  if (!eventsData) eventsData = eventsBuildJson;
  // summit
  let summitData = await bucket_getSummit(summit.id);
  if (!summitData) summitData = summitBuildJson;
  //speakers
  let speakersData = await bucket_getSpeakers(summit.id);
  if (!speakersData) speakersData = speakersBuildJson;
  // extra questions
  let extraQuestionsData = await bucket_getExtraQuestions(summit.id);
  if (!extraQuestionsData) extraQuestionsData = extraQuestionsBuildJson;

  // update summit, events, speakers, extra questions
  const syncPayload = { isLoggedUser, userProfile, eventsData, summitData, speakersData, extraQuestionsData };
  dispatch(createAction(SYNC_DATA)(syncPayload));
};

export const reloadScheduleData = () => async (dispatch, getState) => {
  const { userState, loggedUserState, summitState } = getState();
  const { isLoggedUser } = loggedUserState;
  const { userProfile } = userState;
  const { summit } = summitState;

  let eventsData = await bucket_getEvents(summit.id);
  if (!eventsData) eventsData = eventsBuildJson;
  let summitData = await bucket_getSummit(summit.id);
  if (!summitData) summitData = summitBuildJson;

  dispatch(createAction(RELOAD_SCHED_DATA)({ isLoggedUser, userProfile, eventsData, summitData }));

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