import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CSSTransition } from "react-transition-group";
import Alert from 'react-bootstrap/lib/Alert';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input, RegistrationCompanyInput, RawHTML } from 'openstack-uicore-foundation/lib/components';
import ExtraQuestionsForm from 'openstack-uicore-foundation/lib/components/extra-questions';
import QuestionsSet from 'openstack-uicore-foundation/lib/utils/questions-set';
import { getMainOrderExtraQuestions } from '../../../store/actions/summit-actions';
import { editOwnedTicket, removeAttendee } from '../../../store/actions/ticket-actions';
import { useTicketDetails } from '../../../util';
import { ConfirmPopup, CONFIRM_POPUP_CASE } from "../../ConfirmPopup/ConfirmPopup";

import './ticket-popup-edit-details-form.scss';

const scrollBehaviour = { behavior: 'smooth', block: 'start' };

const noOpInputHandlers = {
    onChange: () => {},
    onBlur: () => {}
};

export const TicketPopupEditDetailsForm = ({
    ticket,
    summit,
    order,
    canEditTicketData,
    goToReassignPanel,
    context    
}) => {
    const formRef = useRef(null);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const userProfile = useSelector(state => state.userState.userProfile);
    const extraQuestions = useSelector(state => state.summitState.extra_questions || []);
    const isLoading = useSelector(state => state.orderState.loading || state.summitState.loading || state.ticketState.loading);
    const [showSaveMessage, setShowSaveMessage] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showUnassignMessage, setShowUnassignMessage] = useState(false);
    const {
        isReassignable,
        formattedReassignDate,
        daysUntilReassignDeadline
    } = useTicketDetails({ ticket, summit });

    const initialValues = useMemo(() => {
        const {
            email,
            first_name,
            last_name,
            company,
            disclaimer_accepted_date,
            extra_questions
        } = ticket.owner || {};

        const formattedExtraQuestions = extra_questions ?
            extra_questions.map(({ question_id, value }) => (
                { question_id: question_id, value }
            )) : [];

        return {
            attendee_email: email,
            attendee_first_name: first_name,
            attendee_last_name: last_name,
            attendee_company: { id: null, name: company },
            disclaimer_accepted: !!disclaimer_accepted_date,
            extra_questions: formattedExtraQuestions
        };
    }, [ticket]);

    const validationSchema = useMemo(() => Yup.object().shape({
        attendee_first_name: Yup.string().required(),
        attendee_last_name: Yup.string().required(),
        attendee_company: Yup.object().shape({
            id: Yup.number().nullable(),
            name: Yup.string().nullable().required(),
        }),
        ...(summit.registration_disclaimer_mandatory && {
            disclaimer_accepted: Yup.boolean().oneOf([true]).required()
        })
    }), [summit]);

    const hasExtraQuestions = extraQuestions.length > 0;
    const isUserTicketOwner = order.owner_id === userProfile.id;

    useEffect(() => {
        dispatch(getMainOrderExtraQuestions({ summit }));
    }, [ticket]);

    const toggleSaveMessage = () => {
        setTimeout(() => setShowSaveMessage(true), 50);
        setTimeout(() => setShowSaveMessage(false), 5000);
    };

    const toggleUnassignMessage = () => {
        setTimeout(() => setShowUnassignMessage(true), 50);
        setTimeout(() => setShowUnassignMessage(false), 5000);
    };

    const updateTicket = (values, formikHelpers) => {
        formikHelpers.setSubmitting(true);

        const params = {
            ticket,
            order,
            context,
            data: values,
        };

        dispatch(editOwnedTicket(params))
            .then(() => toggleSaveMessage())
            .catch((error) => console.error(error))
            .then(() => {
                // Note: Need to do this to persist the extra question values
                formikHelpers.resetForm({ values });
                formikHelpers.setSubmitting(false);
            });
    };

    const handleConfirmAccept = async () => {
        setShowConfirm(false);        
        dispatch(removeAttendee({ticket, context})).then(() => toggleUnassignMessage());
    };

    const handleConfirmReject = () => {
        setShowConfirm(false);        
    };

    const handleSubmit = (values, formikHelpers) => updateTicket(values, formikHelpers);

    const formik = useFormik({
        initialValues,
        onSubmit: handleSubmit,
        validationSchema,
        // Note: We need `enableReinitialize` to be `true` so the extra questions aren't cleared after saving.
        enableReinitialize: true
    });

    const inputHandlers = {
        onChange: formik.handleChange,
        onBlur: formik.handleblur
    };

    const scrollToError = (error) => document.querySelector(`label[for="${error}"]`).scrollIntoView(scrollBehaviour);

    const triggerSubmit = () => {
        // Validate the formik form
        formik.validateForm().then((errors) => {
            const errorKeys = Object.keys(errors);
            // attendee data
            if (errorKeys.length > 0 && errorKeys[0] != 'disclaimer_accepted') {
                scrollToError(errorKeys[0]);
                return;
            }
            // extra questions
            if (hasExtraQuestions) {
                // TODO: We shouldn't have to do this to get the changes from the `ExtraQuestionsForm`.
                // We should just be able to pass an `onChange` event handler to the `ExtraQuestionsForm`.
                formRef.current.doSubmit();
                return;
            }
            // disclaimer
            if (errorKeys.length > 0) {
                scrollToError(errorKeys[0]);
                return;
            }
            formik.handleSubmit();
        });
    };

    const handleExtraQuestionError = (errors, firstErrorRef) => {
        console.log('handleOnError', errors, firstErrorRef);
        firstErrorRef.scrollIntoView(scrollBehaviour);
    }

    const handleExtraQuestionsSubmit = (answersForm) => {

        // check if there is disclaimer acceptance error
        const errorKeys = Object.keys(formik.errors);
        if (errorKeys.length > 0) {
            scrollToError(errorKeys[0]);
            return;
        }

        const questionSet = new QuestionsSet(extraQuestions);

        const newAnswers = Object.keys(answersForm).reduce((acc, name) => {
            let question = questionSet.getQuestionByName(name);

            if (!question) {
                console.error(`Missing question for answer ${name}.`);
                return acc;
            }

            if (answersForm[name] || answersForm[name].length > 0) {
                acc.push({ question_id: question.id, answer: `${answersForm[name]}` });
            }

            return acc;
        }, []);

        // Set the extra question answers on the formik state.
        formik.setFieldValue('extra_questions', newAnswers);

        // Submit the formik form only after setting the extra_questions field values.
        formik.handleSubmit();
    };

    const canSubmitChanges = () => {
        const qs = new QuestionsSet(extraQuestions, ticket.owner.extra_questions);        
        const unansweredExtraQuestions = !qs.completed();
        return canEditTicketData || isReassignable || unansweredExtraQuestions;
    }    

    return (
        <div className="ticket-popup-edit-details-form">
            {showSaveMessage &&
            <CSSTransition
                unmountOnExit
                in={showSaveMessage}
                timeout={2000}
                classNames="fade-in-out"
            >
                <Alert bsStyle="success" className="ticket-popup-form-alert text-center">
                    {t("tickets.save_message")}
                </Alert>
            </CSSTransition>
            }

            {showUnassignMessage &&
            <CSSTransition
                unmountOnExit
                in={showUnassignMessage}
                timeout={2000}
                classNames="fade-in-out"
            >
                <Alert bsStyle="success" className="ticket-popup-form-alert text-center">
                    {t("tickets.unassign_success_message")}
                </Alert>
            </CSSTransition>
            }

            <div className="ticket-popup-form-body columns is-multiline">

                <div className="attendee-info column is-full">
                    <h4 className="pb-3">{t("ticket_popup.edit_basic_info")}</h4>
                    <label htmlFor="attendee_email">Email</label>
                    <Input
                        id="attendee_email"
                        name="attendee_email"
                        className="form-control"
                        value={ticket.owner?.email}
                        disabled={true}
                    />
                    {isUserTicketOwner && isReassignable && 
                    <div className="mt-1">
                        <span onClick={() => goToReassignPanel()}>
                            <u>Reassign</u>
                        </span>
                        {` | `}
                        <span onClick={() => setShowConfirm(true)}>
                            <u>Unassign</u>
                        </span>
                    </div>
                    }
                </div>

                <div className="attendee-info column is-full">
                    <label htmlFor="attendee_first_name">
                        {t("ticket_popup.edit_first_name")}
                        {!ticket.owner?.first_name && <b> *</b>}
                    </label>
                    <Input
                        id="attendee_first_name"
                        name="attendee_first_name"
                        className="form-control"
                        value={formik.values.attendee_first_name}
                        {...(!ticket.owner?.first_name ? inputHandlers : noOpInputHandlers)}
                        placeholder={t("ticket_popup.edit_first_name_placeholder")}
                        disabled={!!ticket.owner?.first_name}
                    />
                    {formik.errors.attendee_first_name &&
                    <p className="error-label">{t("ticket_popup.edit_required")}</p>
                    }
                </div>

                <div className="attendee-info column is-full">
                    <label htmlFor="attendee_last_name">
                        {t("ticket_popup.edit_last_name")}
                        {!ticket.owner?.last_name && <b> *</b>}
                    </label>
                    <Input
                        id="attendee_last_name"
                        name="attendee_last_name"
                        className="form-control"
                        value={formik.values.attendee_last_name}
                        {...(!ticket.owner?.last_name ? inputHandlers : noOpInputHandlers)}
                        placeholder={t("ticket_popup.edit_last_name_placeholder")}
                        disabled={!!ticket.owner?.last_name}
                    />
                    {formik.errors.attendee_last_name &&
                    <p className="error-label">{t("ticket_popup.edit_required")}</p>
                    }
                </div>

                <div className="attendee-info column is-full">
                    <label htmlFor="attendee_company">
                        {t("ticket_popup.edit_company")}
                        {!ticket.owner?.company && <b> *</b>}
                    </label>
                    <RegistrationCompanyInput
                        id="attendee_company"
                        name="attendee_company"
                        summitId={summit.id}
                        {...(!ticket.owner?.company ? inputHandlers : noOpInputHandlers)}
                        value={formik.values.attendee_company}
                        placeholder={t("ticket_popup.edit_company_placeholder")}
                        disabled={!!ticket.owner?.company}
                    />
                    {formik.errors.attendee_company?.name &&
                    <p className="error-label">{t("ticket_popup.edit_required")}</p>
                    }
                </div>
                {(ticket.owner?.first_name || ticket.owner?.last_name || ticket.owner?.company) &&
                <div className="column is-full pb-5">
                    {t("ticket_popup.assign_note")}
                </div>
                }

                {hasExtraQuestions && 
                <div className="column is-full pt-5">
                    <h4 className="pb-2">{t("ticket_popup.edit_preferences")}</h4>
                    <ExtraQuestionsForm
                        ref={formRef}
                        extraQuestions={extraQuestions}
                        userAnswers={formik.values.extra_questions}
                        onAnswerChanges={handleExtraQuestionsSubmit}
                        allowExtraQuestionsEdit={canEditTicketData}
                        questionContainerClassName={`columns is-multiline extra-question pt-3`}
                        questionLabelContainerClassName={'column is-full pb-0'}
                        questionControlContainerClassName={'column is-full pt-0'}
                        shouldScroll2FirstError={false}
                        onError={handleExtraQuestionError}
                    />
                </div>
                }

                {summit.registration_disclaimer_content &&
                <div className="column is-full attendee-info abc-checkbox">
                    <input
                        type="checkbox"
                        id="disclaimer_accepted"
                        name="disclaimer_accepted"
                        onChange={formik.handleChange}
                        onBlur={formik.handleblur}
                        checked={formik.values.disclaimer_accepted}
                    />
                    <label htmlFor="disclaimer_accepted">
                        {summit.registration_disclaimer_mandatory && <b> *</b>}
                    </label>
                    {formik.errors.disclaimer_accepted &&
                    <p className="error-label">{t("ticket_popup.edit_required")}</p>
                    }
                    <div className="mt-3">
                        <RawHTML>
                            {summit.registration_disclaimer_content}
                        </RawHTML>
                    </div>
                </div>
                }
            </div>

            {canSubmitChanges() &&
            <div className="ticket-popup-footer">
                <button
                    type="button"
                    className="btn btn-primary"
                    disabled={formik.isSubmitting}
                    onClick={triggerSubmit}
                >
                    {!formik.isSubmitting && <>{t("ticket_popup.save_changes")}</>}
                    {formik.isSubmitting && <>{t("ticket_popup.saving_changes")}...</>}
                </button>
            </div>
            }
            <ConfirmPopup
                isOpen={showConfirm}
                popupCase={CONFIRM_POPUP_CASE.UNASSIGN_TICKET}
                onAccept={handleConfirmAccept}
                onReject={handleConfirmReject}
            />
        </div>
    );
};