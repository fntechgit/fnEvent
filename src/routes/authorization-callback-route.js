/**
 * Copyright 2017 OpenStack Foundation
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

import React from 'react'
import URI from "urijs"
import { navigate } from "gatsby"
import { Redirect } from '@reach/router'
import { connect } from 'react-redux';
import AbstractAuthorizationCallbackRoute from "openstack-uicore-foundation/lib/security/abstract-auth-callback-route";
import { getUserProfile, addToSchedule, removeFromSchedule } from '../actions/user-actions'
import HeroComponent from "../components/HeroComponent";
import { getEnvVariable, IDP_BASE_URL, OAUTH2_CLIENT_ID } from '../utils/envVariables'
import { getPendingAction } from '../utils/schedule';

import '../styles/bulma.scss';
import {userHasAccessLevel, VirtualAccessLevel} from "../utils/authorizedGroups";

class AuthorizationCallbackRoute extends AbstractAuthorizationCallbackRoute {

    constructor(props) {
        super(getEnvVariable(IDP_BASE_URL), getEnvVariable(OAUTH2_CLIENT_ID), props);
    }

    _callback(backUrl) {

        this.props.getUserProfile().then(() => {
            const pendingAction = getPendingAction();
            if (pendingAction) {
                const { action, event } = pendingAction;
                action === 'ADD_EVENT' ? this.props.addToSchedule(event) : this.props.removeFromSchedule(event);
            }
            backUrl = URI.decode(backUrl);
            let { userProfile } = this.props;
            // if redirect to lobby first time if we have virtual access
            if(backUrl == '/' && userProfile && userHasAccessLevel(userProfile.summit_tickets, VirtualAccessLevel)){
                backUrl = '/a/';
            }
            navigate(backUrl);
        });
    }

    _redirect2Error(error) {
        console.log(`AuthorizationCallbackRoute error ${error}`);
        if (
            error.includes('access_denied') ||
            error.includes('consent_required')
        ) return <Redirect to={'/'} noThrow />;
        return <Redirect to={`/error?error=${error}`} noThrow/>;
    }

    render() {
        // reimplements same render as defined in abstract class
        // but modifies the return (if no errors) to improve UX
        // re: https://github.com/OpenStackweb/openstack-uicore-foundation/blob/cf8337911dcbb9d71bef3624c45256039e6447a0/src/components/security/abstract-auth-callback-route.js#L139
        let {id_token_is_valid, error} = this.state;

        if (error != null) {
            console.log(`AbstractAuthorizationCallbackRoute::render _redirect2Error error ${error}`)
            return this._redirect2Error(error);
        }

        if (!id_token_is_valid) {
            return this._redirect2Error("token_validation_error");
        }
        return <HeroComponent title="Checking credentials..."/>;
    }
}


const mapStateToProps = ({ userState }) => ({
    userProfile: userState.userProfile,
});

export default connect(mapStateToProps, {
    getUserProfile,
    addToSchedule,
    removeFromSchedule,
})(AuthorizationCallbackRoute)