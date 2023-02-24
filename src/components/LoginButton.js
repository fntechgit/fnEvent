import React, { useEffect, useState } from "react"
import { navigate } from "gatsby"
import { connect } from "react-redux";
import URI from "urijs"
// these two libraries are client-side only
import LoginComponent from 'summit-registration-lite/dist/components/login';
import PasswordlessLoginComponent from 'summit-registration-lite/dist/components/login-passwordless';
import FragmentParser from "openstack-uicore-foundation/lib/utils/fragment-parser";
import { doLogin, passwordlessStart } from 'openstack-uicore-foundation/lib/security/methods'
import { getUserProfile, setPasswordlessLogin, setUserOrder, checkOrderData } from "../actions/user-actions";
import { getThirdPartyProviders } from "../actions/base-actions";
import { formatThirdPartyProviders } from "../utils/loginUtils";
import 'summit-registration-lite/dist/index.css';
import styles from '../styles/login-button.module.scss'
import PropTypes from 'prop-types'

const LoginButton = ({
    getThirdPartyProviders,
    thirdPartyProviders,
    setPasswordlessLogin,
    summit,
    siteSettings,
    allowsNativeAuth,
    allowsOtpAuth,
    location,
}) => {
    const [isActive, setIsActive] = useState(false);
    const [initialEmailValue, setInitialEmailValue] = useState('');
    const [otpLogin, setOtpLogin] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [otpLength, setOtpLength] = useState(null);
    const [otpError, setOtpError] = useState(false);

    useEffect(() => {
        const fragmentParser = new FragmentParser();
        setIsActive(fragmentParser.getParam('login'));
        const paramInitialEmailValue = fragmentParser.getParam('email');
        if (paramInitialEmailValue)
            setInitialEmailValue(paramInitialEmailValue);
    }, []);

    useEffect(() => {
        if (!thirdPartyProviders.length) getThirdPartyProviders();
    }, [thirdPartyProviders]);

    const getBackURL = () => {
        let backUrl = location.state?.backUrl
            ? location.state.backUrl
            : '/';
        return URI.encode(backUrl);
    };

    const onClickLogin = (provider) => {
        doLogin(getBackURL(), provider);
    };

    const closeLoginPopup = () => {
        setIsActive(false);
        setOtpLogin(false);
        setOtpError(false);
    }

    const openLoginPopup = () => {
        setIsActive(true);
        setOtpLogin(false);
        setOtpError(false);
    }

    const getPasswordlessCode = (email) => {
        const params = {
            connection: "email",
            send: "code",
            redirect_uri: `${window.location.origin}/auth/callback`,
            email,
        };

        return passwordlessStart(params)
    };

    const loginPasswordless = (code, email) => {
        const params = {
            connection: "email",
            otp: code,
            email
        };

        navigate('/');

        return setPasswordlessLogin(params).then((res) => {
            if (res?.response !== 200) {                
                setOtpError(true);
            }
        })
    };

    const sendCode = (email) => {
        setUserEmail(email);
        getPasswordlessCode(email).then(({ response }) => {
            setOtpLength(response.otp_length);
            setOtpLogin(true);
        });
    }

    const loginComponentProps = {
        loginOptions: formatThirdPartyProviders(thirdPartyProviders),
        login: (provider) => onClickLogin(provider),
        getLoginCode: (email) => sendCode(email),        
        allowsNativeAuth: allowsNativeAuth,
        allowsOtpAuth: allowsOtpAuth,
        initialEmailValue: initialEmailValue,
        title: 'Enter your email address to login with a one time code',
    };

    const passwordlessLoginProps = {
        email: userEmail,
        codeLength: otpLength,
        passwordlessLogin: async (code) => await loginPasswordless(code, userEmail),
        codeError: otpError,
        goToLogin: () => setOtpLogin(false),
        getLoginCode: (email) => sendCode(email),
    }

    const { loginButton } = siteSettings.heroBanner.buttons;

    return (
        <div className={styles.loginButtonWrapper}>
            <button className={`${styles.button} button is-large`} onClick={() => openLoginPopup()}>
                <i className={`fa fa-2x fa-edit icon is-large`} />
                <b>{loginButton.text}</b>
            </button>
            {isActive &&
                <div id={`${styles.modal}`} className="modal is-active">
                    <div className="modal-background"></div>
                    <div className={`${styles.modalContent} modal-content`}>
                        <div className={`${styles.outerWrapper} summit-registration-lite`}>
                            <div className={styles.innerWrapper}>
                                <div className={styles.title}>
                                    <span>{summit.name}</span>
                                    <i className="fa fa-close" aria-label="close" onClick={() => closeLoginPopup()}></i>
                                </div>
                                {!otpLogin && <LoginComponent {...loginComponentProps} />}
                                {otpLogin && <PasswordlessLoginComponent {...passwordlessLoginProps} />}
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
};

const mapStateToProps = ({ userState, summitState, settingState }) => {
    return ({
        loadingProfile: userState.loading,
        loadingIDP: userState.loadingIDP,
        thirdPartyProviders: summitState.third_party_providers,
        allowsNativeAuth: summitState.allows_native_auth,
        allowsOtpAuth: summitState.allows_otp_auth,
        summit: summitState.summit,
        colorSettings: settingState.colorSettings,
        siteSettings: settingState.siteSettings,
    })
};

export default connect(mapStateToProps, {
    getThirdPartyProviders,
    getUserProfile,
    setPasswordlessLogin,
    setUserOrder,
    checkOrderData
})(LoginButton)

LoginButton.propTypes = {
    location: PropTypes.object.isRequired,
}
