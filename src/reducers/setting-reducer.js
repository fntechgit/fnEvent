import settings from '../content/settings.json';
import colors from '../content/colors.json';
import marketing_site from '../content/marketing-site.json';
import disqus_settings from '../content/disqus-settings.json';
import home_settings from '../content/home-settings.json';
import poster_pages from '../content/poster-pages.json';

import { START_LOADING, STOP_LOADING } from "openstack-uicore-foundation/lib/utils/actions";
import { LOGOUT_USER } from "openstack-uicore-foundation/lib/security/actions";
import { RESET_STATE, SYNC_DATA, UPDATE_LAST_CHECK_FOR_NOVELTIES } from "../actions/base-actions-definitions";


const DEFAULT_STATE = {
  lastBuild: settings.lastBuild,
  lastCheckForNovelties:settings.lastBuild,
  staticJsonFilesBuildTime: settings.staticJsonFilesBuildTime,
  favicons: settings.favicons,
  widgets: settings.widgets,
  colorSettings: colors,
  siteSettings: marketing_site,
  disqusSettings: disqus_settings,
  homeSettings: home_settings,
  posterPagesSettings: poster_pages,
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
