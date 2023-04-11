import * as React from "react";
import { connect } from "react-redux";
import Navbar from './Navbar';

const Header = ({
  location,
  summit,
  isLoggedUser,
  idpProfile,
  idpLoading
}) => (
  <header>
    <Navbar
      isLoggedUser={isLoggedUser}
      idpProfile={idpProfile}
      idpLoading={idpLoading}
      location={location}
      logo={summit?.logo}
    />
  </header>
);

const mapStateToProps = ({
  summitState,
  loggedUserState,
  userState
}) => ({
  summit: summitState.summit,
  isLoggedUser: loggedUserState.isLoggedUser,
  idpProfile: userState.idpProfile,
  idpLoading: userState.loadingIDP
})

export default connect(mapStateToProps)(Header);