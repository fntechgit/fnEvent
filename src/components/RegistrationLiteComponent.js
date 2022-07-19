import React, { useEffect, useState } from "react"
import { navigate, withPrefix } from "gatsby"
import { connect } from "react-redux";
import URI from "urijs"
// these two libraries are client-side only
import RegistrationLiteWidget from 'summit-registration-lite/dist';
import FragmentParser from "openstack-uicore-foundation/lib/utils/fragment-parser";
import { doLogin, passwordlessStart, getAccessToken } from 'openstack-uicore-foundation/lib/security/methods'
import { doLogout } from 'openstack-uicore-foundation/lib/security/actions'
import { getEnvVariable, SUMMIT_API_BASE_URL, OAUTH2_CLIENT_ID, REGISTRATION_BASE_URL } from '../utils/envVariables'
import { getUserProfile, setPasswordlessLogin, setUserOrder, checkOrderData } from "../actions/user-actions";
import { getThirdPartyProviders } from "../actions/base-actions";
import 'summit-registration-lite/dist/index.css';
import styles from '../styles/marketing-hero.module.scss'
import Swal from "sweetalert2";

const RegistrationLiteComponent = ({
    registrationProfile,
    userProfile,
    attendee,
    getThirdPartyProviders,
    thirdPartyProviders,
    getUserProfile,
    setPasswordlessLogin,
    setUserOrder,
    checkOrderData,
    loadingProfile,
    loadingIDP,
    summit,
    colorSettings,
    siteSettings,
    allowsNativeAuth,
    allowsOtpAuth,
}) => {
    const [isActive, setIsActive] = useState(false);
    const [initialEmailValue, setInitialEmailValue] = useState('');

    useEffect(() => {
        const fragmentParser = new FragmentParser();
        setIsActive(fragmentParser.getParam('registration'));
        const paramInitialEmailValue = fragmentParser.getParam('email');
        if(paramInitialEmailValue)
            setInitialEmailValue(paramInitialEmailValue);
    }, []);

    useEffect(() => {
        if (!thirdPartyProviders.length) getThirdPartyProviders();
    }, [thirdPartyProviders]);

    const getBackURL = () => {
        let backUrl = '/#registration=1';
        return URI.encode(backUrl);
    };

    const onClickLogin = (provider) => {
        doLogin(getBackURL(), provider);
    };

    const handleCompanyError = () => {
        console.log('company error...')
        Swal.fire("ERROR", "Hold on. Your session expired!.", "error").then(() => {
            // save current location and summit slug, for further redirect logic
            window.localStorage.setItem('post_logout_redirect_path', new URI(window.location.href).pathname());
            doLogout();
        });
    }

    const formatThirdPartyProviders = (providersArray) => {
        const providers = [
            { button_color: '#082238', provider_label: 'Continue with FNid', provider_param: '', provider_logo: '../img/logo_fn.svg', provider_logo_size: 35 },
        ];

        const thirdPartyProviders = [
            { button_color: '#1877F2', provider_label: 'Continue with Facebook', provider_param: 'facebook', provider_logo: '../img/third-party-idp/logo_facebook.svg', provider_logo_size: 22 },
            { button_color: '#0A66C2', provider_label: 'Sign in with LinkedIn', provider_param: 'linkedin', provider_logo: '../img/third-party-idp/logo_linkedin.svg', provider_logo_size: 21 },
            { button_color: '#000000', provider_label: 'Continue with Apple', provider_param: 'apple', provider_logo: '../img/third-party-idp/logo_apple.svg', provider_logo_size: 19 }
        ];

        return [...providers, ...thirdPartyProviders.filter(p => providersArray.includes(p.provider_param))];
    };

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

        navigate('/#registration=1');

        return setPasswordlessLogin(params);
    };

    const widgetProps = {
        apiBaseUrl: getEnvVariable(SUMMIT_API_BASE_URL),
        clientId: getEnvVariable(OAUTH2_CLIENT_ID),
        summitData: summit,
        profileData: registrationProfile,
        marketingData: colorSettings,
        loginOptions: formatThirdPartyProviders(thirdPartyProviders),
        loading: loadingProfile || loadingIDP,
        // only show info if its not a recent purchase
        ticketOwned: userProfile?.summit_tickets?.length > 0,
        ownedTickets: attendee?.ticket_types || [],
        authUser: (provider) => onClickLogin(provider),
        getPasswordlessCode: getPasswordlessCode,
        loginWithCode: async (code, email) => await loginPasswordless(code, email),
        getAccessToken: getAccessToken,
        closeWidget: async () => {
            // reload user profile
            // NOTE: We need to catch the rejected promise here, or else the app will crash (locally, at least).
            try {
                await getUserProfile();
            } catch (e) {
                console.error(e);
            }
            setIsActive(false)
        },
        goToExtraQuestions: async () => {
            // reload user profile
            // NOTE: We need to catch the rejected promise here, or else the app will crash (locally, at least).
            try {
                await getUserProfile();
            } catch (e) {
                console.error(e);
            }
            navigate('/a/extra-questions')
        },
        goToEvent: () => navigate('/a/'),
        goToRegistration: () => navigate(`${getEnvVariable(REGISTRATION_BASE_URL)}/a/${summit.slug}`),
        onPurchaseComplete: (order) => {
            // check if it's necesary to update profile
            setUserOrder(order).then(_ => checkOrderData(order));
        },
        inPersonDisclaimer: siteSettings?.registration_in_person_disclaimer,
        handleCompanyError: () => handleCompanyError,
        allowsNativeAuth: allowsNativeAuth,
        allowsOtpAuth: allowsOtpAuth,
        stripeOptions: {
            fonts: [{ cssSrc: withPrefix('/fonts/fonts.css') }],
            style: { base: { fontFamily: `'TTHovesW05-Regular', sans-serif`, fontWeight: 300 } }
        }
        loginInitialEmailInputValue: initialEmailValue,
    };

    const { registerButton } = siteSettings.heroBanner.buttons;

    return (
        <>
            <button className={`${styles.button} button is-large`} onClick={() => setIsActive(true)}>
                <i className={`fa fa-2x fa-edit icon is-large`} />
                <b>{registerButton.text}</b>
            </button>

            <div>
                {isActive && <RegistrationLiteWidget {...widgetProps} />}
            </div>
        </>
    )
};

const mapStateToProps = ({ userState, summitState, settingState }) => {
    return ({
        registrationProfile: userState.idpProfile,
        userProfile: userState.userProfile,
        attendee: userState.attendee,
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
})(RegistrationLiteComponent)
