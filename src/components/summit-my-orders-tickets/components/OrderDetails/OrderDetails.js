import React, { useEffect, useRef } from "react"
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import classNames from 'classnames';
import { getNow } from "../../store/actions/timer-actions";
import {
    checkSummitPast,
    getDocumentOffset,
    getFormattedDate,
    getOrderStatusData,
    getSummitFormattedDate
} from "../../util";
import { useOrderListContext } from "../OrderList/OrderList.helpers";

import './order-details.scss';

export const OrderDetails = ({ order, summit, className }) => {
    const elementRef = useRef(null);

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { state, actions } = useOrderListContext();

    const isSummitPast = checkSummitPast(summit, dispatch(getNow()));
    const statusData = getOrderStatusData(order, isSummitPast);
    const isActive = state.activeOrderId === order.id;

    const handleClick = (event) => {
        if (isActive) return actions.setActiveOrderId(null);

        actions.setActiveOrderId(order.id);

        setTimeout(() => {
            const offset = getDocumentOffset(elementRef.current);

            window.scroll({
                top: offset.top - 30,
                behavior: 'smooth'
            });
        }, 50);
    };

    // Clear active order on unmount (i.e., when page pagination changes)
    useEffect(() => () => actions.setActiveOrderId(null), []);

    return (
        <div
            ref={elementRef}
            className={classNames(
                'order-details',
                `order-details--${statusData.className}`,
                { 'order-details--active': isActive },
                className
            )}
            onClick={handleClick}
        >
            <i className={classNames(`order-details__icon fa fa-2x ${statusData.icon}`)} />

            <div className="order-details__content">
                <div className="order-details__header">
                    <h4 className="order-details__event-name">
                        {summit.name}
                        <br />
                        {getSummitFormattedDate(summit)}
                    </h4>

                    <p className="order-details__status">
                        {statusData.text}
                    </p>
                </div>

                <div className="order-details__meta">
                    <h5 className="order-details__purchase-date">
                        {t("orders.purchased")}{` `}
                        {getFormattedDate(order.created)}
                    </h5>

                    <ul className="order-details__tickets">
                        {Object.keys(order.tickets_excerpt_by_ticket_type).map((ticket, index) => {
                            return (
                                <li key={index}>
                                    x{order.tickets_excerpt_by_ticket_type[ticket]} {ticket}
                                </li>
                            )
                        })}
                    </ul>

                    <div className="order-details__number">
                        {order.number}
                    </div>
                </div>
            </div>

            <div className="order-details__footer">
                <h4 className="order-details__amount">${order.amount}</h4>
                <i className={classNames(
                    'order-details__arrow fa',
                    {
                        'fa-angle-down': !isActive,
                        'fa-angle-up': isActive
                    }
                )} />
            </div>
        </div>
    );
};