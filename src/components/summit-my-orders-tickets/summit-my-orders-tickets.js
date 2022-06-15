import React, { useEffect } from "react"
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react'
import PropTypes from 'prop-types'
import './i18n';
import { useInitStore } from './store';
import { RESET_STATE } from './store/actions/base-actions';
import { setUser } from "./store/actions/user-actions";
import { setSummit } from "./store/actions/summit-actions";
import { MyOrdersTickets } from "./components/MyOrdersTickets";

import './styles/general.scss';

export const MyOrdersTicketsWidget = ({
    className,
    clientId,
    apiBaseUrl,
    idpBaseUrl,
    loginUrl,
    supportEmail,
    getAccessToken,
    getUserProfile,
    summit,
    user,
    ...props
}) => {
    const { store, persistor } = useInitStore({
        clientId,
        apiBaseUrl,
        idpBaseUrl,
        loginUrl,
        supportEmail,
        getAccessToken,
        getUserProfile,
        summit,
        user
    });

    const handleBeforeLift = () => {
        const params = new URLSearchParams(window.location.search);
        const flush = params.has("flushState");

        if (flush) store.dispatch({ type: RESET_STATE, payload: null });
    };

    useEffect(() => {
        // Update the internal userState when the external userState changes
        store.dispatch(setUser(user));
    }, [user]);

    useEffect(() => {
        // Update the internal summitState when the external summitState changes
        store.dispatch(setSummit(summit));
    }, [summit]);

    return (
        <Provider store={store}>
            <PersistGate onBeforeLift={handleBeforeLift} loading={null} persistor={persistor}>
                <MyOrdersTickets {...props} />
            </PersistGate>
        </Provider>
    );
};

MyOrdersTicketsWidget.propTypes = {
    clientId: PropTypes.string.isRequired,
    apiBaseUrl: PropTypes.string.isRequired,
    idpBaseUrl: PropTypes.string.isRequired,
    loginUrl: PropTypes.string.isRequired,
    supportEmail: PropTypes.string.isRequired,
    getAccessToken: PropTypes.func.isRequired,
    getUserProfile: PropTypes.func.isRequired,
    summit: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired
};

// TODO: Move this to the consuming code.
MyOrdersTicketsWidget.defaultProps = {
    loginUrl: '/'
};