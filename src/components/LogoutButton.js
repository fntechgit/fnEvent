import React from 'react'
import { navigate } from "gatsby"
import {triggerOnInitLogout} from "../utils/customEvents";

export default class
  LogoutButton extends React.Component {

  onClickLogout() {
    triggerOnInitLogout();
    navigate('/auth/logout', {
      state: {
        backUrl: window.location.pathname
      }
    })
  }

  render() {
    let { isLoggedUser, styles } = this.props;

    if (isLoggedUser) {
      return (

        <div className={styles.buttons}>
          <button className={`link ${styles.userIcon}`} title="Logout" onClick={() => this.onClickLogout()}>
            <i className="fa fa-sign-out icon is-medium" style={{fontSize: '1.5rem'}} />
          </button>
        </div>
      );
    } else {
      return null;
    }
  }
}