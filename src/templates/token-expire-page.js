import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import URI from "urijs";
import { handleResetReducers } from '../actions/event-actions'
import { doLogin } from 'openstack-uicore-foundation/lib/security/methods'

import { getEnvVariable, AUTHORIZED_DEFAULT_PATH } from '../utils/envVariables'

import HeroComponent from '../components/HeroComponent'

export const TokenExpirePageTemplate = class extends React.Component {

  componentDidMount() {

    const { location, handleResetReducers, eventRedirect } = this.props;

    if (window.authExpired === undefined) {
      window.authExpired = true

      let defaultPath = eventRedirect ? `/a/event/${eventRedirect}` : getEnvVariable(AUTHORIZED_DEFAULT_PATH) ? getEnvVariable(AUTHORIZED_DEFAULT_PATH) : '/a/';
      let previousLocation = location.state?.backUrl && location.state.backUrl !== '/auth/expired' ? location.state.backUrl : defaultPath;
      let backUrl = URI.encode(previousLocation);

      setTimeout(() => {
        handleResetReducers();
        doLogin(backUrl);
      }, 1500);
    }
  }

  render() {
    return (
      <HeroComponent
        title="Checking credentials..."
      />
    )
  }
}

TokenExpirePageTemplate.propTypes = {
  loggedUser: PropTypes.object,
  location: PropTypes.object,
  handleResetReducers: PropTypes.func,
}

const TokenExpirePage = ({ loggedUser, location, handleResetReducers }) => {

  return (
    <TokenExpirePageTemplate
      loggedUser={loggedUser}
      location={location}
      handleResetReducers={handleResetReducers}
    />
  )

}

TokenExpirePage.propTypes = {
  loggedUser: PropTypes.object,
  location: PropTypes.object,
  handleResetReducers: PropTypes.func,
}

const mapStateToProps = ({ loggedUserState, settingState }) => ({
  loggedUser: loggedUserState,
  eventRedirect: settingState.siteSettings.eventRedirect,
})

export default connect(mapStateToProps, { handleResetReducers })(TokenExpirePage);
