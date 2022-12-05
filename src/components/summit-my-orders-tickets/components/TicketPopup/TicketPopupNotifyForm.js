import React, { useState } from 'react';
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { CSSTransition } from "react-transition-group";
import Alert from 'react-bootstrap/lib/Alert';
import { resendNotification } from '../../store/actions/ticket-actions';
import { getSummitFormattedReassignDate } from '../../util';

export const TicketPopupNotifyForm = ({ ticket, summit }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [showSaveMessage, setShowSaveMessage] = useState(false);
    const [message, setMessage] = useState('')

    const toggleSaveMessage = () => {
        setTimeout(() => { 
            setShowSaveMessage(true)
            setMessage('');
        }, 50);
        setTimeout(() => setShowSaveMessage(false), 5000);
    };

    const handleNotifyButtonClick = () => {
        dispatch(resendNotification({ ...ticket, message })).then(() => toggleSaveMessage());
    }

    return (
        <div className="ticket-notify-form">
            <div className="ticket-popup-form-body">
                {showSaveMessage && (
                    <CSSTransition
                        unmountOnExit
                        in={showSaveMessage}
                        timeout={2000}
                        classNames="fade-in-out"
                    >
                        <Alert bsStyle="success" className="ticket-popup-form-alert text-center">
                            {t("tickets.notify_success_message")}
                        </Alert>
                    </CSSTransition>
                )}

                <p>{t("ticket_popup.notify_text_1")} {getSummitFormattedReassignDate(summit)}.</p>
                
                <p>
                    {t("ticket_popup.notify_text_2")} <b>{ticket.owner.email} </b> 
                    {t("ticket_popup.notify_text_3")} <b>{ticket.owner.email}</b>
                </p>

                <p>
                    <label>{t("ticket_popup.notify_message")} </label>{t("ticket_popup.notify_message_condition")}
                    <br />
                    <textarea value={message} rows="4" onChange={(e) => setMessage(e.target.value)} style={{width: '80%', padding: 5}} />
                </p>
                <button className="btn btn-primary" onClick={handleNotifyButtonClick}>
                    {t("ticket_popup.notify_button")}
                </button>
            </div>
        </div>
    );
};