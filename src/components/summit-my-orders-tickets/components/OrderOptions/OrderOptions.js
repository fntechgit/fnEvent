import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import classNames from 'classnames';
import { CSSTransition } from "react-transition-group";
import Alert from 'react-bootstrap/lib/Alert';
import { getSummitFormattedDate, getSummitLocation, getTicketRole, getTicketType } from '../../util';
import { cancelOrder } from '../../store/actions/order-actions';
import { getNow } from '../../store/actions/timer-actions';
import { ConfirmPopup, CONFIRM_POPUP_CASE } from '../ConfirmPopup/ConfirmPopup';

import './order-options.scss';

export const OrderOptions = ({ order, summit, ticket, className }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const supportEmail = useSelector(state => state.globalState?.supportEmail || '');
    const [showConfirm, setShowConfirm] = useState(false);
    const [showRefundSuccess, setShowRefundSuccess] = useState(false);
    const now = dispatch(getNow());

    const handleCancelClick = () => setShowConfirm(true);

    const handleConfirmAccept = () => {
        dispatch(cancelOrder({ order })).then(() => {
            setTimeout(() => setShowRefundSuccess(true), 500);
            setTimeout(() => setShowRefundSuccess(false), 5000);
        }).catch(() => { });

        setShowConfirm(false);
    };

    const handleConfirmReject = () => setShowConfirm(false);

    if (!summit) return null;

    return (
        <>
            <div className={classNames('order-options', className)}>
                <CSSTransition
                    unmountOnExit
                    in={showRefundSuccess}
                    timeout={2000}
                    classNames="fade-in-out"
                >
                    <>
                        <br />
                        <Alert bsStyle="success">
                            {t("tickets.refund_request_success_message")}
                        </Alert>
                    </>
                </CSSTransition>

                {summit.registration_allowed_refund_request_till_date > now && order && order?.status === 'Paid' && order?.amount > 0 && order?.amount > order?.refunded_amount && (
                    <button onClick={handleCancelClick} className="order-option cancel">
                        {t("order_info.cancel_order")}
                    </button>
                )}

                <a className="order-option cancel" target="_blank" href={`mailto:${supportEmail}`}>
                    {t("order_info.email_support")}
                </a>
            </div>

            <ConfirmPopup
                isOpen={showConfirm}
                popupCase={CONFIRM_POPUP_CASE.CANCEL_ORDER}
                onAccept={handleConfirmAccept}
                onReject={handleConfirmReject}
            />
        </>
    );
};