import React from "react";
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { OrderDetails } from '../OrderDetails/OrderDetails';
import { OrderSummary } from '../OrderSummary/OrderSummary';
import { OrderTicketList } from '../OrderTicketList/OrderTicketList';
import { OrderOptions } from "../OrderOptions/OrderOptions";
import { useOrderListContext } from "./OrderList.helpers";
import Pager from "../../../Pager";

export const OrderListItem = ({ order, className, changeTicketsPage }) => {
    const summit = useSelector(state => state.summitState.summit);
    const { state } = useOrderListContext();

    const {
        orderTickets: {
            total, per_page, current_page, last_page, tickets
        },
        loading
    } = useSelector(state => state.ticketState || {});

    const isActive = state.activeOrderId === order.id;

    return (
        <li className={classNames('order-list__item', { 'order-list__item--active': isActive }, className)}>
            <div className="order-list__item__content row">
                <div className="col-md-8">
                    <OrderDetails order={order} summit={summit} />

                    {isActive && tickets.length > 0 && (
                        <>
                            <OrderSummary type="mobile" order={order} summit={summit} />

                            {summit.ticket_types.map((ticketType, index) => {
                                const orderTickets = tickets.filter(t => t.ticket_type_id == ticketType.id);

                                if (orderTickets.length < 1) return null;

                                return (
                                    <OrderTicketList
                                        key={index}
                                        ticketType={ticketType}
                                        tickets={orderTickets}
                                        summit={summit}
                                        order={order}
                                    />
                                )
                            })}

                            {total > 5 &&(
                                <div className="order-list__pagination">

                                    <div className="row">
                                        <div className="col-md-12">
                                            <Pager
                                                totPages={last_page}
                                                currentPage={current_page}
                                                items={tickets}
                                                pageClicked={(ele) => {
                                                    changeTicketsPage(order.id, ele);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="col-md-4">
                    {isActive && tickets.length > 0 && (
                        <div className="order-list__item__sidebar">
                            <OrderSummary order={order} summit={summit} tickets={tickets} />
                            <OrderOptions order={order} summit={summit} />
                        </div>
                    )}
                </div>
            </div>
        </li>
    );
};