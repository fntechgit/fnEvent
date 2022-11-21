import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { useTranslation } from "react-i18next";
import classNames from 'classnames';
import { getTicketById, getTicketPDF } from '../../store/actions/ticket-actions';
import { getWindowScroll, useTicketDetails } from '../../util';
import { TicketPopupReassignForm } from './TicketPopupReassignForm';
import { TicketPopupAssignForm } from './TicketPopupAssignForm';
import { TicketPopupNotifyForm } from './TicketPopupNotifyForm';
import { TicketPopupRefundForm } from './TicketPopupRefundForm';
import { TicketPopupEditDetailsForm } from './TicketPopupEditDetailsForm/TicketPopupEditDetailsForm';

import QRCode from "react-qr-code";

import './ticket-popup.scss';

export const TicketPopup = ({ ticket, order, summit, onClose, fromTicketList, fromOrderList, className }) => {
    const previousScrollPosition = useRef(getWindowScroll());
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const userProfile = useSelector(state => state.userState.userProfile);

    const {
        isSummitStarted,
        type: ticketType,
        role: ticketRole,
        status: statusData,
        isUnassigned,
        isReassignable,
        isRefundable
    } = useTicketDetails({ ticket, summit });

    const ticketName = ticketType.name;
    const isUserOrderOwner = order.owner_id === userProfile.id;
    const isUserTicketOwner = ticket.owner?.email === userProfile.email;

    const canEditTicketData = (isUserTicketOwner || isUserOrderOwner) && summit.allow_update_attendee_extra_questions;

    useEffect(() => {
        dispatch(getTicketById({order, ticket}));
    }, []);

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = 'visible';

            window.scrollTo({
                top: previousScrollPosition.current.top
            });
        };
    }, []);

    const closePopup = () => {
        if (onClose) onClose();
    };

    const handleDownloadClick = () => dispatch(getTicketPDF({ ticket }));

    const handleCloseClick = () => closePopup();

    return (
        <div className={classNames('ticket-popup', className)}>
            <div className="ticket-popup-content">
                <header className="ticket-popup-header">
                    <div className="ticket-popup-title">
                        <h4>{ticketName}</h4>

                        <h5>
                            {ticket.number}
                        </h5>

                        <p>
                            Purchased By {order.owner_first_name} {order.owner_last_name} ({order.owner_email})
                        </p>

                        <p>
                            {ticketRole}
                        </p>

                        <p className={`status status-${statusData.className}`}>
                            {statusData.text}
                        </p>
                    </div>

                    <div className="ticket-popup-icons">
                        <div className='ticket-popup-row-icon'>
                        {!summit.is_virtual && statusData.type === 'STATUS_COMPLETE' && (
                            <i onClick={handleDownloadClick} className="fa fa-file-pdf-o" />
                        )}

                        <i onClick={handleCloseClick} className="fa fa-times" />
                        </div>
                        {statusData.type === 'STATUS_COMPLETE' &&
                            <div className='ticket-popup-qr'>
                                <QRCode
                                    size={256}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    value={ticket.qr_code}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                        }
                    </div>
                </header>

                <section className="ticket-popup-body">
                    <Tabs selectedTabClassName="ticket-popup-tabs--active">
                        <TabList className="ticket-popup-tabs">
                            {isUnassigned && (
                                <Tab>{t("ticket_popup.tab_assign")}</Tab>
                            )}

                            {!isUnassigned && (
                                <Tab>{t("ticket_popup.tab_edit")}</Tab>
                            )}

                            {!isUnassigned && isReassignable && isUserOrderOwner && (
                                <Tab>{t("ticket_popup.tab_reassign")}</Tab>
                            )}

                            {!isUnassigned && (isReassignable && !isUserTicketOwner && isUserOrderOwner) && (
                                <Tab>{t("ticket_popup.tab_notify")}</Tab>
                            )}

                            {isUserOrderOwner && !isSummitStarted && isRefundable && (
                                <Tab>{t("ticket_popup.tab_refund")}</Tab>
                            )}
                        </TabList>

                        {isUnassigned && (
                            <TabPanel className="ticket-popup-panel ticket-popup-panel--assign">
                                <div className="ticket-popup-scroll">
                                    <TicketPopupAssignForm ticket={ticket} summit={summit} order={order} />
                                </div>
                            </TabPanel>
                        )}

                        <TabPanel className="ticket-popup-panel ticket-popup-panel--edit">
                            <div className="ticket-popup-scroll">
                                <TicketPopupEditDetailsForm
                                    ticket={ticket}
                                    summit={summit}
                                    order={order}
                                    canEditTicketData={canEditTicketData}
                                    context={fromTicketList ? 'ticket-list' : 'order-list'}
                                />
                            </div>
                        </TabPanel>

                        {!isUnassigned && isReassignable && isUserOrderOwner && (
                            <TabPanel className="ticket-popup-panel ticket-popup-panel--reassign">
                                <div className="ticket-popup-scroll">
                                    <TicketPopupReassignForm ticket={ticket} summit={summit} order={order} />
                                </div>
                            </TabPanel>
                        )}

                        {!isUnassigned && (isReassignable && !isUserTicketOwner && isUserOrderOwner) && (
                            <TabPanel className="ticket-popup-panel ticket-popup-panel--notify">
                                <div className="ticket-popup-scroll">
                                    <TicketPopupNotifyForm ticket={ticket} summit={summit} order={order} />
                                </div>
                            </TabPanel>
                        )}

                        {isUserOrderOwner && !isSummitStarted && isRefundable && (
                            <TabPanel className="ticket-popup-panel ticket-popup-panel--refund">
                                <div className="ticket-popup-scroll">
                                    <TicketPopupRefundForm ticket={ticket} summit={summit} order={order} />
                                </div>
                            </TabPanel>
                        )}
                    </Tabs>
                </section>
            </div>
        </div>
    )
};