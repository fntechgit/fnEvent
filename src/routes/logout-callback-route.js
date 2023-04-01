/**
 * Copyright 2020
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import React from 'react';
import { connect } from 'react-redux';
import { navigate } from "gatsby"
import { Redirect } from "@gatsbyjs/reach-router";
import URI from "urijs"
import { initLogOut } from 'openstack-uicore-foundation/lib/security/methods'
import { doLogout } from 'openstack-uicore-foundation/lib/security/actions'
import { getFromLocalStorage } from 'openstack-uicore-foundation/lib/utils/methods'

export class LogOutCallbackRoute extends React.Component {

    constructor(props) {
        super(props);

        // initial state
        this.state = {
            error: null,
            error_description: null,
        };
    }

    componentDidMount() {
        let {location} = this.props;

        let postLogoutState = getFromLocalStorage('post_logout_state', true);
        if (postLogoutState) {
            // if we have the nonce we alredy start a logout process
            let query = URI.parseQuery(location.search);
            // compare the state and perform the final logout
            if (query.hasOwnProperty("state") && query["state"] === postLogoutState) {
                this.props.doLogout();
                let backUrl = getFromLocalStorage('post_logout_redirect_path', true);
                navigate(backUrl ? backUrl : '/');
                return;
            }
            // error
            this.setState({...this.state, error: 'Invalid Nonce', error_description:'There was an error on logout process. Please try again.'})
            return;
        }
        // starts logout process
        let backUrl = location.state?.backUrl ? location.state.backUrl : '/';
        window.localStorage.setItem('post_logout_redirect_path', backUrl);
        initLogOut();
    }

    render() {
        let { error, error_description } = this.state;
        if(error){
            return <Redirect to={`/error?error=${error}&error_description=${error_description}`} noThrow/>;
        }
        return null;
    }
}

export default connect(
    null,
    {
        doLogout
    }
)(LogOutCallbackRoute)