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
import { assignAttendee, editOwnedTicket, removeAttendee } from '../../../store/actions/ticket-actions';
import { useTicketDetails } from '../../../util';

import './ticket-popup-edit-details-form.scss';
import { number } from 'prop-types';

export const TicketPopupEditDetailsForm = ({
    ticket,
    summit,
    order,
    canEditTicketData,
    context    
}) => {
    const formRef = useRef(null);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const userProfile = useSelector(state => state.userState.userProfile);
    const extraQuestions = useSelector(state => state.summitState.extra_questions || []);
    const isLoading = useSelector(state => state.orderState.loading || state.summitState.loading);
    const [changeAttendee, setChangeAttendee] = useState(false);
    const [changingAttendee, setChangingAttendee] = useState(false);
    const [showSaveMessage, setShowSaveMessage] = useState(false);
    const {
        isUnassigned,
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
        attendee_email: Yup.string().email('Please enter a valid email.').required('Email is required.'),

        ...((!changeAttendee) && {
            attendee_first_name: Yup.string().nullable().required('First name is required.'),
            attendee_last_name: Yup.string().nullable().required('Last name is required.'),
            attendee_company: Yup.object().shape({
                id: Yup.number().nullable(),
                name: Yup.string().nullable().required('Company is required.'),
            })
        })
    }), [changeAttendee]);

    const hasExtraQuestions = extraQuestions.length > 0;
    const isUserTicketOwner = order.owner_id === userProfile.id;

    useEffect(() => {
        dispatch(getMainOrderExtraQuestions({ summit }));
    }, [ticket]);

    const toggleSaveMessage = () => {
        setTimeout(() => setShowSaveMessage(true), 50);
        setTimeout(() => setShowSaveMessage(false), 5000);
    };

    const updateTicket = (values, formikHelpers) => {
        formikHelpers.setSubmitting(true);

        // Return early if the user changing the attendee but the value hasn't changed
        if (changeAttendee && ticket.owner?.email && ticket.owner?.email === values.attendee_email)
            return formikHelpers.setSubmitting(false);

        const params = {
            ticket,
            order,
            context,
            data: values,
        };

        if (!ticket.owner?.email) {
            setChangingAttendee(true);

            return dispatch(assignAttendee(params))
                .then(() => {
                    setChangeAttendee(false);
                    toggleSaveMessage();
                })
                .catch((error) => console.error(error))
                .then(() => {
                    formikHelpers.setSubmitting(false);
                    setChangingAttendee(false);
                });
        }

        if (ticket.owner?.email !== values.attendee_email) {
            setChangingAttendee(true);

            return dispatch(removeAttendee(params))
                .then(() => {
                    setChangeAttendee(false);
                    toggleSaveMessage();
                })
                .catch((error) => console.error(error))
                .then(() => {
                    formikHelpers.setSubmitting(false);
                    setChangingAttendee(false);
                });
        }

        dispatch(editOwnedTicket(params))
            .then(() => toggleSaveMessage())
            .catch((error) => console.error(error))
            .then(() => {
                // Note: Need to do this to persist the extra question values
                formikHelpers.resetForm({ values });
                formikHelpers.setSubmitting(false);
            });
    };

    const handleSubmit = (values, formikHelpers) => updateTicket(values, formikHelpers);

    const formik = useFormik({
        initialValues,
        onSubmit: handleSubmit,
        validationSchema,
        // Note: We need `enableReinitialize` to be `true` so the extra questions aren't cleared after saving.
        enableReinitialize: true
    });

    // This simply triggers the submit for the `ExtraQuestionsForm`.
    const triggerSubmit = () => {
        if (changeAttendee)
            return formik.submitForm();

        // TODO: We shouldn't have to do this to get the changes from the `ExtraQuestionsForm`.
        // We should just be able to pass an `onChange` event handler to the `ExtraQuestionsForm`.
        if(hasExtraQuestions) {
            formRef.current.dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}));
            return;
        }
        // Submit the formik form
        formik.handleSubmit();
    };

    const handleExtraQuestionsSubmit = (answersForm) => {
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

    return (
        <div className="ticket-popup-form ticket-popup-edit-details-form">
            {showSaveMessage && (
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
            )}

            {(isLoading) && (
                <>
                    {!hasExtraQuestions && !changingAttendee && <>Loading ticket information...</>}
                    {changingAttendee && <>Changing assigned attendee...</>}
                </>
            )}

            <>
                    <div className="ticket-popup-form-body">
                        <div className="row ticket-popup-basic-info">
                            <div className="col-sm-6">
                                {t("ticket_popup.edit_basic_info")}
                            </div>
                            <div className="col-sm-6">
                                {t("ticket_popup.edit_required")}
                            </div>
                        </div>

                        <div className="row field-wrapper">
                            <div className="col-sm-4">
                                {t("ticket_popup.edit_email")}
                                {isReassignable && t("ticket_popup.edit_required_star")}
                            </div>

                            <div className="col-sm-8">
                                {isUnassigned && (
                                    <span>
                                        {changeAttendee && (
                                            <Input
                                                id="attendee_email"
                                                name="attendee_email"
                                                className="form-control"
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleblur}
                                                value={formik.values.attendee_email}
                                                error={formik.errors.attendee_email}
                                            />
                                        )}

                                        {!changeAttendee && (
                                            <>
                                                <button style={{ marginBottom: '5px' }} className="btn btn-primary" onClick={() => setChangeAttendee(true)}>
                                                    {t("ticket_popup.assign_this")}
                                                </button>

                                            </>
                                        )}
                                    </span>
                                )}

                                {!isUnassigned && (
                                    <>
                                        {changeAttendee && (
                                            <>
                                                <Input
                                                    id="attendee_email"
                                                    name="attendee_email"
                                                    className="form-control"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleblur}
                                                    value={formik.values.attendee_email}
                                                    error={formik.errors.attendee_email}
                                                />

                                                <div style={{ marginTop: '5px' }} onClick={() => setChangeAttendee(false)}>
                                                    <u>Don't Change</u>
                                                </div>
                                            </>
                                        )}

                                        {!changeAttendee && (
                                            <span>
                                                {ticket.owner?.email}

                                                {(isUserTicketOwner && isReassignable) && (
                                                    <>
                                                        {` `}|{` `}
                                                        <span onClick={() => setChangeAttendee(true)}>
                                                            <u>Change</u>
                                                        </span>
                                                    </>
                                                )}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="field-wrapper-mobile">
                            <div>
                                {t("ticket_popup.edit_email")}
                                {t("ticket_popup.edit_required_star")}
                            </div>

                            <div>
                                {isUnassigned && (
                                    <span>
                                        {changeAttendee && (
                                            <Input
                                                id="attendee_email"
                                                name="attendee_email"
                                                className="form-control"
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleblur}
                                                value={formik.values.attendee_email}
                                                error={formik.errors.attendee_email}
                                            />
                                        )}

                                        {!changeAttendee && (
                                            <>
                                                <button style={{ marginBottom: '5px' }} className="btn btn-primary" onClick={() => setChangeAttendee(true)}>
                                                    {t("ticket_popup.assign_this")}
                                                </button>

                                            </>
                                        )}
                                    </span>
                                )}

                                {!isUnassigned && (
                                    <>
                                        {changeAttendee && (
                                            <>
                                                <Input
                                                    id="attendee_email"
                                                    name="attendee_email"
                                                    className="form-control"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleblur}
                                                    value={formik.values.attendee_email}
                                                    error={formik.errors.attendee_email}
                                                />

                                                <div style={{ marginTop: '5px' }} onClick={() => setChangeAttendee(false)}>
                                                    <u>Don't Change</u>
                                                </div>
                                            </>
                                        )}

                                        {!changeAttendee && (
                                            <span>
                                                {ticket.owner?.email}

                                                {(isUserTicketOwner && isReassignable) && (
                                                    <>
                                                        {` `}|{` `}
                                                        <span onClick={() => setChangeAttendee(true)}>
                                                            <u>Change</u>
                                                        </span>
                                                    </>
                                                )}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className='row field-wrapper assign-note'>
                            <div className='col-sm-12'>
                                {t("ticket_popup.assign_note")}                            
                            </div>
                        </div>

                        {(!changeAttendee) && (
                            <>
                                <div className="row field-wrapper">
                                    <div className="col-sm-4">
                                        {t("ticket_popup.edit_first_name")}
                                        {t("ticket_popup.edit_required_star")}
                                    </div>
                                    <div className="col-sm-8">
                                        {canEditTicketData ?
                                            <Input
                                                id="attendee_first_name"
                                                name="attendee_first_name"
                                                className="form-control"
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleblur}
                                                value={formik.values.attendee_first_name}
                                                error={formik.errors.attendee_first_name}
                                            />
                                            :
                                            <span>{ticket.owner?.first_name}</span>
                                        }
                                    </div>
                                </div>

                                <div className="field-wrapper-mobile">
                                    <div>
                                        {t("ticket_popup.edit_first_name")}
                                        {t("ticket_popup.edit_required_star")}
                                    </div>
                                    <div>
                                        {canEditTicketData ?
                                            <Input
                                                id="attendee_first_name"
                                                name="attendee_first_name"
                                                className="form-control"
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleblur}
                                                value={formik.values.attendee_first_name}
                                                error={formik.errors.attendee_first_name}
                                            />
                                            :
                                            <span>{ticket.owner?.first_name}</span>
                                        }
                                    </div>
                                </div>

                                <div className="row field-wrapper">
                                    <div className="col-sm-4">
                                        {t("ticket_popup.edit_last_name")}
                                        {t("ticket_popup.edit_required_star")}
                                    </div>
                                    <div className="col-sm-8">
                                        {canEditTicketData ?
                                            <Input
                                                id="attendee_last_name"
                                                name="attendee_last_name"
                                                className="form-control"
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleblur}
                                                value={formik.values.attendee_last_name}
                                                error={formik.errors.attendee_last_name}
                                            />
                                            :
                                            <span>{ticket.owner?.last_name}</span>
                                        }                                        
                                    </div>
                                </div>

                                <div className="field-wrapper-mobile">
                                    <div>
                                        {t("ticket_popup.edit_last_name")}
                                        {t("ticket_popup.edit_required_star")}
                                    </div>
                                    <div>
                                        {canEditTicketData ?
                                            <Input
                                                id="attendee_last_name"
                                                name="attendee_last_name"
                                                className="form-control"
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleblur}
                                                value={formik.values.attendee_last_name}
                                                error={formik.errors.attendee_last_name}
                                            />
                                            :
                                            <span>{ticket.owner?.last_name}</span>
                                        }
                                    </div>
                                </div>

                                <div className="row field-wrapper-unique">
                                    <div className="col-sm-4">
                                        {t("ticket_popup.edit_company")}
                                        {t("ticket_popup.edit_required_star")}
                                    </div>
                                    <div className="col-sm-8" style={{ position: 'relative' }}>
                                        {canEditTicketData ?
                                            <RegistrationCompanyInput
                                                id="attendee_company"
                                                name="attendee_company"
                                                summitId={summit.id}
                                                className={`dropdown`}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleblur}
                                                value={formik.values.attendee_company}
                                                error={formik.errors.attendee_company?.name}
                                            />
                                            :
                                            <span>{ticket.owner?.company}</span>
                                        }
                                    </div>
                                </div>

                                {hasExtraQuestions && (
                                    <>
                                        <hr />
                                        <div className="row ticket-popup-basic-info">
                                            <div className="col-sm-6">
                                                {t("ticket_popup.edit_preferences")}
                                            </div>
                                            <div className="col-sm-6"></div>
                                        </div>

                                        <ExtraQuestionsForm
                                            ref={formRef}
                                            extraQuestions={extraQuestions}
                                            userAnswers={formik.values.extra_questions}
                                            onAnswerChanges={handleExtraQuestionsSubmit}
                                            allowExtraQuestionsEdit={canEditTicketData}
                                            questionContainerClassName="row form-group"
                                            questionLabelContainerClassName="col-sm-4"
                                            questionControlContainerClassName="col-sm-8 question-control-container"
                                        />
                                    </>
                                )}

                                {(summit.registration_disclaimer_content) && (
                                    <>
                                        <hr />
                                        <div className="row field-wrapper">
                                            <div className="col-md-12">
                                                <div className="form-check abc-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        id="disclaimer_accepted"
                                                        name="disclaimer_accepted"
                                                        className="form-check-input"
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleblur}
                                                        checked={formik.values.disclaimer_accepted}
                                                    />
                                                    <label className="form-check-label" htmlFor="disclaimer_accepted">
                                                        {summit.registration_disclaimer_mandatory && <>*</>}
                                                    </label>
                                                    <div className="disclaimer">
                                                        <RawHTML>
                                                            {summit.registration_disclaimer_content}
                                                        </RawHTML>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="field-wrapper-mobile">
                                            <div>
                                                <div className="form-check abc-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        id="disclaimer_accepted"
                                                        name="disclaimer_accepted"
                                                        className="form-check-input"
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleblur}
                                                        checked={formik.values.disclaimer_accepted}
                                                    />
                                                    <label className="form-check-label" htmlFor="disclaimer_accepted">
                                                        {summit.registration_disclaimer_mandatory && <>*</>}
                                                    </label>
                                                    <div className="disclaimer">
                                                        <RawHTML>
                                                            {summit.registration_disclaimer_content}
                                                        </RawHTML>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {canEditTicketData &&
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
                </>
        </div >
    );
};