import React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { useTicketDetails } from "../../util";
import { TicketPopup } from '../TicketPopup/TicketPopup';

import './ticket-details.scss';

export const TicketDetails = ({ ticket, className }) => {
    const summit = useSelector(state => state.summitState.summit);
    const {
        status,
        type,
        role,
        isActive,
        isUnassigned,
        handleClick,
        showPopup,
        handlePopupClose,
        isReassignable,
        formattedDate
    } = useTicketDetails({ ticket, summit });

    return (
        <>
            <div
                className={classNames(
                    'ticket-details',
                    `ticket-details--${status.className}`,
                    {
                        'ticket-details--disabled': isUnassigned && !isReassignable,
                        [status.className]: isReassignable,
                    },
                    className
                )}
                onClick={handleClick}
            >
                <i className={`ticket-details__icon fa fa-2x ${status.icon}`} />

                <div className="ticket-details__content">
                    <div className="ticket-details__header">
                        <h4 className="ticket-details__name">{type.name}</h4>

                        <h5 className="ticket-details__date">{formattedDate}</h5>

                        <p className="ticket-details__status">
                            {status.text}
                        </p>
                    </div>

                    <div className="ticket-details__meta">
                        <h4 className="ticket-details__type">
                            {type.name}
                        </h4>

                        <h5 className="ticket-details__number" style={{ fontSize: 10 }}>
                            {ticket.number}
                        </h5>

                        <p className="ticket-details__owner">
                            Purchased By {ticket.order.owner_first_name} {ticket.order.owner_last_name} ({ticket.order.owner_email})
                        </p>

                        {role && 
                            <p className="ticket-details__badge">
                                Badge Features: {role}
                            </p>
                        }
                    </div>
                </div>


                <div className="ticket-details__footer">
                    {isActive && (
                        <i className="ticket-details__arrow fa fa-angle-right" />
                    )}
                </div>
            </div>

            {
                showPopup && (
                    <TicketPopup
                        ticket={ticket}
                        summit={summit}
                        order={ticket.order}
                        fromTicketList={true}
                        onClose={handlePopupClose}
                    />
                )
            }
        </>
    );
};