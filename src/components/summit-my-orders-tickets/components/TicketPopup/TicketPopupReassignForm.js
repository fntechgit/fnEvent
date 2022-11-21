import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CSSTransition } from "react-transition-group";
import Alert from 'react-bootstrap/lib/Alert';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input } from 'openstack-uicore-foundation/lib/components'
import { removeAttendee } from "../../store/actions/ticket-actions";
import { ConfirmPopup, CONFIRM_POPUP_CASE } from "../ConfirmPopup/ConfirmPopup";
import { getSummitFormattedReassignDate } from "../../util";

const initialValues = {
    attendee_email: '',
}

const validationSchema = Yup.object().shape({
    attendee_email: Yup.string().email('Please enter a valid email.').required('Email is required.'),
});

export const TicketPopupReassignForm = ({ ticket, summit, order }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const userProfile = useSelector(state => state.userState.userProfile);
    const [showConfirm, setShowConfirm] = useState(false);
    const [newAttendeeEmail, setNewAttendeeEmail] = useState('');
    const [showSaveMessage, setShowSaveMessage] = useState(false);

    const isUserTicketOwner = userProfile.email === ticket.owner?.email;
    const isTicketPrinted = ticket.badge?.printed_times > 0 ? true : false

    const toggleSaveMessage = () => {
        setTimeout(() => setShowSaveMessage(true), 50);
        setTimeout(() => setShowSaveMessage(false), 5000);
    };

    const handleSubmit = (values, formikHelpers) => {
        setNewAttendeeEmail(values.attendee_email);
        setShowConfirm(true);
    };

    const formik = useFormik({
        initialValues,
        onSubmit: handleSubmit,
        validationSchema
    });

    const assignTicketToSelf = () => {
        formik.resetForm();
        setNewAttendeeEmail(userProfile.email);
        setShowConfirm(true);
    };

    const handleConfirmAccept = async () => {
        setShowConfirm(false);
        formik.resetForm();
        setNewAttendeeEmail('');

        dispatch(removeAttendee({
            ticket,
            order,
            data: { attendee_email: newAttendeeEmail }
        })).then(() => toggleSaveMessage());
    };

    const handleConfirmReject = () => {
        setShowConfirm(false);
        formik.resetForm();
        setNewAttendeeEmail('')
    };

    return (
        <>
            <form className="ticket-reassign-form" onSubmit={formik.handleSubmit}>
                <div className="ticket-popup-form-body">
                    {
                        isTicketPrinted ? 
                        <>
                            <p>
                                {t("ticket_popup.reassign_printed_ticket")}
                            </p>
                        </> 
                        :
                        <>
                            {showSaveMessage && (
                                <CSSTransition
                                    unmountOnExit
                                    in={showSaveMessage}
                                    timeout={2000}
                                    classNames="fade-in-out"
                                >
                                    <Alert bsStyle="success" className="ticket-popup-form-alert text-center">
                                        {t("tickets.reassign_success_message")}
                                    </Alert>
                                </CSSTransition>
                            )}

                            {!isUserTicketOwner && (
                                <>
                                    <p>
                                        {t("ticket_popup.reassign_text")}
                                        <br />
                                        <b>{ticket.owner.email}</b>
                                    </p>
                                    <button className="btn btn-primary" onClick={assignTicketToSelf} type="button">
                                        {t("ticket_popup.reassign_me")}
                                    </button>

                                    <div className="ticket-popup-separator">
                                        <div><hr /></div>
                                        <span>{t("ticket_popup.assign_or")}</span>
                                        <div><hr /></div>
                                    </div>
                                </>
                            )}

                            <p>
                                {t("ticket_popup.reassign_want_text")}
                                {` (${t("ticket_popup.reassign_before")} ${getSummitFormattedReassignDate(summit)})`}
                            </p>
                            <span>{t("ticket_popup.reassign_enter_email")}</span>

                            <Input
                                id="attendee_email"
                                name="attendee_email"
                                className="form-control"
                                placeholder="Email"
                                error={formik.errors.attendee_email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.attendee_email}
                            />


                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                            >
                                {t("ticket_popup.reassign_someone")}
                            </button>
                        </>
                    }
                </div>
            </form>

            <ConfirmPopup
                isOpen={showConfirm}
                popupCase={CONFIRM_POPUP_CASE.REASSIGN_TICKET}
                onAccept={handleConfirmAccept}
                onReject={handleConfirmReject}
            />
        </>
    )
};