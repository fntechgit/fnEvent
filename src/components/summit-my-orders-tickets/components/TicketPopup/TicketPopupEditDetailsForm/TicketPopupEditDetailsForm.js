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
import {
    editOwnedTicket,
    removeAttendee,
    TICKET_ATTENDEE_KEYS as TicketKeys
} from '../../../store/actions/ticket-actions';
import { useTicketDetails } from '../../../util';
import { ConfirmPopup, CONFIRM_POPUP_CASE } from '../../ConfirmPopup/ConfirmPopup';

import { DefaultScrollBehaviour as ScrollBehaviour } from 'utils/scroll';

import './ticket-popup-edit-details-form.scss';

const noOpFn = () => {};

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
    const [triedSubmitting, setTriedSubmitting] = useState(false);
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
                { question_id, value }
            )) : [];

        return {
            [TicketKeys.email]: email,
            [TicketKeys.firstName]: first_name,
            [TicketKeys.lastName]: last_name,
            [TicketKeys.company]: { id: null, name: company },
            [TicketKeys.disclaimerAccepted]: !!disclaimer_accepted_date,
            [TicketKeys.extraQuestions]: formattedExtraQuestions
        };
    }, [ticket]);

    const validationSchema = useMemo(() => Yup.object().shape({
        [TicketKeys.firstName]: Yup.string().required(),
        [TicketKeys.lastName]: Yup.string().required(),
        [TicketKeys.company]: Yup.object().shape({
            id: Yup.number().nullable(),
            name: Yup.string().required(),
        }),
        ...(summit.registration_disclaimer_mandatory && {
            [TicketKeys.disclaimerAccepted]: Yup.boolean().oneOf([true]).required()
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

    const scrollToError = (error) => document.querySelector(`label[for="${error}"]`).scrollIntoView(ScrollBehaviour);

    const validateForm = (knownErrorRef = null) => {
        // Validate the formik form
        formik.validateForm().then((errors) => {
            const errorKeys = Object.keys(errors);
            // attendee data
            if (errorKeys.length > 0 && errorKeys[0] != TicketKeys.disclaimerAccepted) {
                scrollToError(errorKeys[0]);
                return;
            }
            // extra question
            if (knownErrorRef) {
                knownErrorRef.scrollIntoView(ScrollBehaviour);
                return;
            }
            // disclaimer
            if (errorKeys.length > 0) {
                scrollToError(errorKeys[0]);
                return;
            }
            // submit the formik form
            formik.handleSubmit();
        });
    };

    const triggerSubmit = () => {
        setTriedSubmitting(true);
        if (hasExtraQuestions) {
            // TODO: We shouldn't have to do this to get the changes from the `ExtraQuestionsForm`.
            // We should just be able to pass an `onChange` event handler to the `ExtraQuestionsForm`.
            formRef.current.doSubmit();
            return;
        }
        validateForm();
    };

    const handleExtraQuestionError = (_, errorRef) => {
        validateForm(errorRef);
    }

    const onExtraQuestionsAnswersSet = (answersForm) => {
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
        formik.setFieldValue(TicketKeys.extraQuestions, newAnswers);
        validateForm();
    };

    const canSubmitChanges = () => {
        const qs = new QuestionsSet(extraQuestions, initialValues[TicketKeys.extraQuestions]);        
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
                    <label htmlFor={TicketKeys.email}>Email</label>
                    <Input
                        id={TicketKeys.email}
                        name={TicketKeys.email}
                        className="form-control"
                        value={initialValues[TicketKeys.email]}
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
                    <label htmlFor={TicketKeys.firstName}>
                        {t("ticket_popup.edit_first_name")}
                        {!initialValues[TicketKeys.firstName] && <b> *</b>}
                    </label>
                    <Input
                        id={TicketKeys.firstName}
                        name={TicketKeys.firstName}
                        className="form-control"
                        placeholder={t("ticket_popup.edit_first_name_placeholder")}
                        value={formik.values[TicketKeys.firstName]}
                        onBlur={formik.handleBlur}
                        onChange={!!initialValues[TicketKeys.firstName] ? noOpFn : formik.handleChange}
                        disabled={!!initialValues[TicketKeys.firstName]}
                    />
                    {(formik.touched[TicketKeys.firstName] || triedSubmitting) && formik.errors[TicketKeys.firstName] &&
                    <p className="error-label">{t("ticket_popup.edit_required")}</p>
                    }
                </div>

                <div className="attendee-info column is-full">
                    <label htmlFor={TicketKeys.lastName}>
                        {t("ticket_popup.edit_last_name")}
                        {!initialValues[TicketKeys.lastName] && <b> *</b>}
                    </label>
                    <Input
                        id={TicketKeys.lastName}
                        name={TicketKeys.lastName}
                        className="form-control"
                        placeholder={t("ticket_popup.edit_last_name_placeholder")}
                        value={formik.values[TicketKeys.lastName]}
                        onBlur={formik.handleBlur}
                        onChange={!!initialValues[TicketKeys.lastName] ? noOpFn : formik.handleChange}
                        disabled={!!initialValues[TicketKeys.lastName]}
                    />
                    {(formik.touched[TicketKeys.lastName] || triedSubmitting) && formik.errors[TicketKeys.lastName] &&
                    <p className="error-label">{t("ticket_popup.edit_required")}</p>
                    }
                </div>

                <div className="attendee-info column is-full">
                    <label htmlFor={TicketKeys.company}>
                        {t("ticket_popup.edit_company")}
                        {!initialValues[TicketKeys.company].name && <b> *</b>}
                    </label>
                    <RegistrationCompanyInput
                        id={TicketKeys.company}
                        name={TicketKeys.company}
                        summitId={summit.id}
                        placeholder={t("ticket_popup.edit_company_placeholder")}
                        value={formik.values[TicketKeys.company]}
                        // RegistrationCompanyInput does not inform same component name onBlur
                        // so as a workaround we force it to TicketKeys.company
                        onBlur={() => formik.setFieldTouched(TicketKeys.company, true)}
                        onChange={!!initialValues[TicketKeys.company].name ? noOpFn : formik.handleChange}
                        disabled={!!initialValues[TicketKeys.company].name}
                    />
                    {(formik.touched[TicketKeys.company] || triedSubmitting) && formik.errors[TicketKeys.company] &&
                    <p className="error-label">{t("ticket_popup.edit_required")}</p>
                    }
                </div>

                {(initialValues[TicketKeys.firstName] || initialValues[TicketKeys.lastName] || initialValues[TicketKeys.company].name) &&
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
                        userAnswers={formik.values[TicketKeys.extraQuestions]}
                        onAnswerChanges={onExtraQuestionsAnswersSet}
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
                        id={TicketKeys.disclaimerAccepted}
                        name={TicketKeys.disclaimerAccepted}
                        onBlur={formik.handleBlur}
                        onChange={(e) =>
                            formik.setFieldTouched(TicketKeys.disclaimerAccepted, true) && formik.handleChange(e)
                        }
                        checked={formik.values[TicketKeys.disclaimerAccepted]}
                    />
                    <label htmlFor={TicketKeys.disclaimerAccepted}>
                        {summit.registration_disclaimer_mandatory && <b> *</b>}
                    </label>
                    {(formik.touched[TicketKeys.disclaimerAccepted] || triedSubmitting) && formik.errors[TicketKeys.disclaimerAccepted] &&
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