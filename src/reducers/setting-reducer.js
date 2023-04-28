import { START_LOADING, STOP_LOADING } from "openstack-uicore-foundation/lib/utils/actions";
import { LOGOUT_USER } from "openstack-uicore-foundation/lib/security/actions";
import { RESET_STATE, SYNC_DATA, UPDATE_LAST_CHECK_FOR_NOVELTIES } from "../actions/base-actions-definitions";

// TODO: dont store build timestamps in site-settings, use another file
import settings from "content/site-settings/index.json";
import colors from "content/colors.json";
// TODO: rename to lobby page settings?
import homeSettings from "content/home-settings.json";
// TODO: should this live in reducer or should be accessed though graphql?
import marketingPageSettings from "content/marketing-page/index.json";
import postersPages from "content/posters-pages.json";

console.log(`settingReducer DEFAULT_STATE settings.lastBuild ${settings.lastBuild}`);

const DEFAULT_STATE = {
  lastBuild: settings.lastBuild,
  lastCheckForNovelties: settings.lastBuild,
  staticJsonFilesBuildTime: settings.staticJsonFilesBuildTime,
  favicons: settings.favicons,
  widgets: settings.widgets,
  colorSettings: colors,
  marketingPageSettings: marketingPageSettings,
  homeSettings: homeSettings,
  posterPagesSettings: postersPages,
  // this keeps tracks of last data synch
  lastDataSync: settings.lastBuild,
};

const settingReducer = (state = DEFAULT_STATE, action) => {
  const { type, payload } = action;

  switch (type) {
    case RESET_STATE:
    case LOGOUT_USER:
      return DEFAULT_STATE;
    case SYNC_DATA:
      return {...DEFAULT_STATE,
        lastBuild: settings.lastBuild,
        staticJsonFilesBuildTime: settings.staticJsonFilesBuildTime,
        lastDataSync: Date.now(),
        lastCheckForNovelties: state.lastCheckForNovelties,
      };
    case  UPDATE_LAST_CHECK_FOR_NOVELTIES:{
      let newLastCheckForNovelties = payload;
      if(newLastCheckForNovelties < state.lastCheckForNovelties)
        newLastCheckForNovelties = state.lastCheckForNovelties;
      console.log(`settingReducer UPDATE_LAST_CHECK_FOR_NOVELTIES newLastCheckForNovelties ${newLastCheckForNovelties}`);
      return {...state, lastCheckForNovelties: newLastCheckForNovelties};
    }
    case START_LOADING:
      return { ...state, loading: true };
    case STOP_LOADING:
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default settingReducer
