import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from "react-i18next";
import classNames from 'classnames';
import { AjaxLoader } from "openstack-uicore-foundation/lib/components";
import { getUserOrders } from '../store/actions/order-actions';
import { getUserTickets } from '../store/actions/ticket-actions';
import { OrderList } from './OrderList/OrderList';
import { OrderListContextProvider } from './OrderList/OrderList.helpers';
import { TicketList } from './TicketList/TicketList';

export const MyOrdersTickets = ({ className }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const userState = useSelector(state => state.userState || {}, shallowEqual);
    const orderState = useSelector(state => state.orderState || {}, shallowEqual);
    const ticketState = useSelector(state => state.ticketState || {}, shallowEqual);
    const summitState = useSelector(state => state.summitState || {}, shallowEqual);
    const globalState = useSelector(state => state.globalState || {}, shallowEqual);

    const [isInitializing, setIsInitializing] = useState(true);

    const fetchData = async () => {
        setIsInitializing(true);

        await dispatch(getUserOrders({ page: orderState.current_page, perPage: orderState.per_page }));
        await dispatch(getUserTickets({ page: ticketState.current_page, perPage: ticketState.per_page }));

        setIsInitializing(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const isLoading = isInitializing || userState.loading || orderState.loading || ticketState.loading || summitState.loading;
    const hasOrders = orderState.memberOrders?.length > 0;
    const hasTickets = ticketState.memberTickets?.length > 0;

    return (
        <>
            <AjaxLoader show={isLoading} size={120} />

            {isLoading && (!hasOrders && !hasTickets) && (
                <div className="orders-tickets-loading">
                    <p>{t('orders-tickets.loading')}</p>
                </div>
            )}

            {!isLoading && (!hasOrders && !hasTickets) && (
                <div className="orders-tickets-empty">
                    <h2>{t('orders-tickets.empty-title')}</h2>
                    <p dangerouslySetInnerHTML={{ __html: t('orders-tickets.empty-text', { support_email : globalState.supportEmail }) }}></p>
                </div>
            )}

            <div className={classNames('my-orders-tickets', className)}>
                {hasOrders && (
                    <OrderListContextProvider>
                        <OrderList />
                    </OrderListContextProvider>
                )}

                {(hasOrders && hasTickets) && (
                    <hr className="orders-tickets-divider" />
                )}

                {hasTickets && (
                    <TicketList />
                )}
            </div>
        </>
    );
};