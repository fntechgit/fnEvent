import React from 'react';
import * as Sentry from "@sentry/react";
import { useDispatch, useSelector } from 'react-redux';
import { getAccessToken } from 'openstack-uicore-foundation/lib/security/methods';
import { getEnvVariable, IDP_BASE_URL, SUMMIT_API_BASE_URL, OAUTH2_CLIENT_ID, SUPPORT_EMAIL } from '../utils/envVariables';
import { MyOrdersTicketsWidget } from './summit-my-orders-tickets';
import { getUserProfile } from '../actions/user-actions';

import { SentryFallbackFunction } from "./SentryErrorComponent";

export const MyOrdersTicketsComponent = () => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.userState);
    const summit = useSelector(state => state.summitState.summit);

    if (!summit) return null;

    const widgetProps = {
        apiBaseUrl: getEnvVariable(SUMMIT_API_BASE_URL),
        clientId: getEnvVariable(OAUTH2_CLIENT_ID),
        idpBaseUrl: getEnvVariable(IDP_BASE_URL),
        supportEmail: getEnvVariable(SUPPORT_EMAIL),
        loginUrl: '/',
        getAccessToken,
        getUserProfile: async () => await dispatch(getUserProfile()),
        summit,
        user
    };

    return (
        <Sentry.ErrorBoundary fallback={SentryFallbackFunction({componentName: 'My Orders & Tickets'})}>
            <MyOrdersTicketsWidget {...widgetProps} />
        </Sentry.ErrorBoundary>
    );
};