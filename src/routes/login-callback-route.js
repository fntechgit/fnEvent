/**
 * Copyright 2023 OpenStack Foundation
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
import URI from "urijs"
import React from 'react'
import {connect} from "react-redux";

/**
 * class LogInCallbackRoute
 */
class LogInCallbackRoute extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            error: null
        };
    }

    componentWillMount() {
        const {doLogin, location} = this.props;
        const query = URI.parseQuery(location.search);
        let loginHint = null;
        let otpLoginHint = null;
        let backUrl = '/';

        if (query["login_hint"]) {
            loginHint = encodeURI(query["login_hint"]);
        }

        if (query["backUrl"]) {
            backUrl = encodeURI(query["backUrl"]);
        }

        if (query["otp_login_hint"]) {
            otpLoginHint = encodeURI(query["otp_login_hint"]);
        }

        doLogin(backUrl, loginHint, otpLoginHint);
    }


    render() {
        if (this.state.error != null) {
            return (<p>{this.state.error}</p>)
        }
        return null;
    }
}

export default connect(null)(LogInCallbackRoute);
