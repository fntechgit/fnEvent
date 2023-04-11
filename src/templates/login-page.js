import React, {useMemo} from 'react'
import { connect } from 'react-redux'
import { navigate } from "gatsby"

import Layout from '../components/Layout'
import LoginButton from '../components/LoginButton'

import { getDefaultLocation } from '../utils/loginUtils'
import {userHasAccessLevel, VirtualAccessLevel} from "../utils/authorizedGroups";


export const LoginPageTemplate = ({ loggedUserState, eventRedirect, location, userProfile }) => {

  // we store this calculation to use it later
  const hasVirtualBadge = useMemo(() =>
          userProfile ? userHasAccessLevel(userProfile.summit_tickets, VirtualAccessLevel) : false,
      [userProfile]);

  if (loggedUserState.isLoggedUser) {
    let defaultPath = getDefaultLocation(eventRedirect, hasVirtualBadge);
    navigate(defaultPath);
    return null
  }

  return (
    <React.Fragment>
      <LoginButton location={location} eventRedirect={eventRedirect} hasVirtualBadge={hasVirtualBadge}/>
    </React.Fragment>
  )
}

const LoginPage = ({ loggedUserState, location, userProfile }) => {
  return (
    <Layout>
      <LoginPageTemplate
        loggedUserState={loggedUserState}
        location={location}
        userProfile={userProfile}
      />
    </Layout>
  )
}

export default connect(state => ({
  loggedUserState: state.loggedUserState,
  // TODO: move to site settings i/o marketing page settings
  eventRedirect: state.settingState.marketingPageSettings.eventRedirect,
  userProfile: state.userState.userProfile,
}), null)(LoginPage)