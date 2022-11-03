import React from "react"
import classNames from 'classnames';
import { useTicketDetails } from "../../util";
import { TicketPopup } from "../TicketPopup/TicketPopup";

import './order-ticket-details.scss';

export const OrderTicketDetails = ({ ticket, summit, order, className }) => {
    const {
        status,
        role,
        isActive,
        isUnassigned,
        handleClick,
        showPopup,
        handlePopupClose,
        isReassignable
    } = useTicketDetails({ ticket, summit });

    return (
        <>
            <div
                className={classNames(
                    'order-ticket-details',
                    `order-ticket-details--${status.className}`,
                    {
                        'disabled': isUnassigned && !isReassignable,
                        [status.className]: isReassignable,
                    },
                    className
                )}
                onClick={handleClick}
            >
                <i
                    className={classNames(
                        'order-ticket-details__icon',
                        status.icon,
                        `fa fa-2x`
                    )}
                />

                <div className="order-ticket-details__content">
                    <div className="order-ticket-details__header">
                        <div>
                            <h4 className="order-ticket-details__role">
                                Attendee
                            </h4>

                            {ticket.discount > 0 && (
                                <div className="order-ticket-details__role">
                                    {(ticket.discount * 100) / ticket.raw_cost}% discount
                                </div>
                            )}

                            <div className="order-ticket-details__status">
                                {status.text}
                            </div>
                        </div>

                        <div>
                            {ticket.owner?.email && (
                                <h5 className="order-ticket-details__email">
                                    {ticket.owner?.email}
                                </h5>
                            )}
                        </div>
                    </div>

                    <div className="order-ticket-details__meta">
                        <h5 className="order-ticket-details__number">
                            {ticket.number}
                        </h5>
                    </div>

                    {role && 
                        <div className="order-ticket-details__badge">
                            <h5 className="order-ticket-details__number">
                                Badge Features: {role}
                            </h5>
                        </div>
                    }

                </div>

                <div className="order-ticket-details__footer">
                    {isActive && (
                        <i className="order-ticket-details__arrow fa fa-angle-right" />
                    )}
                </div>
            </div>

            {showPopup && (
                <TicketPopup
                    ticket={ticket}
                    summit={summit}
                    order={order}
                    onClose={handlePopupClose}
                />
            )}
        </>
    )
}