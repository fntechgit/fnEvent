import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useDispatch } from 'react-redux';
import { CSSTransition } from "react-transition-group";
import Alert from 'react-bootstrap/Alert';
import { refundTicket } from '../../store/actions/ticket-actions';
import { ConfirmPopup, CONFIRM_POPUP_CASE } from '../ConfirmPopup/ConfirmPopup';

export const TicketPopupRefundForm = ({ ticket, order }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [showConfirm, setShowConfirm] = useState(false);
    const [showRefundSuccess, setShowRefundSuccess] = useState(false);

    const handleCancelClick = () => setShowConfirm(true);

    const handleConfirmAccept = () => {
        dispatch(refundTicket({ ticket, order })).then(() => {
            setTimeout(() => setShowRefundSuccess(true), 500);
            setTimeout(() => setShowRefundSuccess(false), 5000);
        }).catch(() => { });

        setShowConfirm(false);

    };

    const handleConfirmReject = () => setShowConfirm(false);

    return (
        <>
            <div className="ticket-refund-form">
                <div className="ticket-popup-form-body">
                    <CSSTransition
                        unmountOnExit
                        in={showRefundSuccess}
                        timeout={2000}
                        classNames="fade-in-out"
                    >
                        <Alert variant="success" className="ticket-popup-form-alert text-center">
                            {t("tickets.refund_request_success_message")}
                        </Alert>
                    </CSSTransition>

                    <div className="row">
                        <div className="col-md-12 text-center">
                            <div className="ticket-refund-button">
                                <a onClick={handleCancelClick} className="cancel">
                                    {t("ticket_popup.cancel_ticket")}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmPopup
                isOpen={showConfirm}
                popupCase={CONFIRM_POPUP_CASE.CANCEL_TICKET}
                onAccept={handleConfirmAccept}
                onReject={handleConfirmReject}
            />
        </>
    );
};