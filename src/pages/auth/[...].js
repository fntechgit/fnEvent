import React from "react"
import { Router } from "@reach/router"
import { connect } from 'react-redux'

import { onUserAuth, doLogout, getUserInfo } from "openstack-uicore-foundation/lib/security/actions";
import { doLoginBasicLogin } from 'openstack-uicore-foundation/lib/security/methods';
import TokenExpirePage from "../../templates/token-expire-page"

import AuthorizationCallbackRoute from "../../routes/authorization-callback-route"
import LogOutCallbackRoute from "../../routes/logout-callback-route"
import LogInCallbackRoute from "../../routes/login-callback-route";

const Auth = class extends React.Component {

  render() {

    let { onUserAuth, doLogout, getUserInfo, location } = this.props;

    return (
      <Router basepath="/auth">
        <AuthorizationCallbackRoute onUserAuth={onUserAuth} path='/callback' getUserInfo={getUserInfo} />
        <LogOutCallbackRoute doLogout={doLogout} path='/logout' />
        <LogInCallbackRoute doLogin={doLoginBasicLogin} path='/login'/>
        <TokenExpirePage path="/expired" location={location} />
      </Router>
    )
  }
}

const mapStateToProps = ({ loggedUserState }) => ({
  backUrl: loggedUserState.backUrl,
})

export default connect(mapStateToProps, {
  onUserAuth,
  doLogout,
  getUserInfo,
})(Auth)
