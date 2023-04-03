import React, { useEffect, useState, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { navigate } from "gatsby";
import Layout from '../components/Layout';
import { useFormik } from 'formik';
import { useTranslation } from "react-i18next";
import * as Yup from 'yup';

import { getExtraQuestions } from '../actions/summit-actions';
import { saveAttendeeQuestions } from '../actions/user-actions';
import { TICKET_ATTENDEE_KEYS as TicketKeys } from '../components/summit-my-orders-tickets/store/actions/ticket-actions';
import { Input, RegistrationCompanyInput, RawHTML } from 'openstack-uicore-foundation/lib/components';
import QuestionsSet from 'openstack-uicore-foundation/lib/utils/questions-set';
import ExtraQuestionsForm from 'openstack-uicore-foundation/lib/components/extra-questions';

import { DefaultScrollBehaviour as ScrollBehaviour } from '@utils/scroll';

import styles from '../styles/extra-questions.module.scss';

const noOpFn = () => {};

export const ExtraQuestionsPageTemplate = ({ user, summit, extraQuestions, saveAttendeeQuestions }) => {

    const { t } = useTranslation();
    const formRef = useRef(null);
    const [triedSubmitting, setTriedSubmitting] = useState(false);

    const ticket = user.summit_tickets.length > 0 ? user.summit_tickets[user.summit_tickets.length - 1] : null;
    const hasExtraQuestions = extraQuestions.length > 0;

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
            name: Yup.string().nullable().required(),
        }),
        ...(summit.registration_disclaimer_mandatory && {
            [TicketKeys.disclaimerAccepted]: Yup.boolean().oneOf([true]).required()
        })
    }), [summit]);

    const handleSubmit = (values, formikHelpers) => {
        formikHelpers.setSubmitting(true);
        saveAttendeeQuestions(values).then(() => {
            formikHelpers.setSubmitting(false);
        });
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: handleSubmit,
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

    if (!ticket) {
        navigate('/');
        return null;
    }

    return (
        <div className="content columns">
            <div className="column is-three-fifths is-offset-one-fifth px-6-desktop py-6-desktop mb-6">
                <h2>Attendee Information</h2>
                <div className="columns is-multiline pt-4 pb-5">
                    <div className={`column is-full-mobile is-half ${styles.extraQuestion}`}>
                        <label htmlFor={TicketKeys.firstName}>First Name</label>
                        <Input
                            id={TicketKeys.firstName}
                            name={TicketKeys.firstName}
                            className="form-control"
                            type="text"
                            placeholder={'Your First Name'}
                            value={formik.values[TicketKeys.firstName]}
                            onBlur={formik.handleBlur}
                            onChange={!!initialValues[TicketKeys.firstName] ? noOpFn : formik.handleChange}
                            disabled={!!initialValues[TicketKeys.firstName]}
                        />
                        {(formik.touched[TicketKeys.firstName] || triedSubmitting) && formik.errors[TicketKeys.firstName] &&
                        <p className={styles.errorLabel}>{t("ticket_popup.edit_required")}</p>
                        }
                    </div>
                    <div className={`column is-full-mobile is-half ${styles.extraQuestion}`}>
                        <label htmlFor={TicketKeys.lastName}>Last Name</label>
                        <Input
                            id={TicketKeys.lastName}
                            name={TicketKeys.lastName}
                            className="form-control"
                            type="text"
                            placeholder={'Your Last Name'}
                            value={formik.values[TicketKeys.lastName]}
                            onBlur={formik.handleBlur}
                            onChange={!!initialValues[TicketKeys.lastName] ? noOpFn : formik.handleChange}
                            disabled={!!initialValues[TicketKeys.lastName]}
                        />
                        {(formik.touched[TicketKeys.lastName] || triedSubmitting) && formik.errors[TicketKeys.lastName] &&
                        <p className={styles.errorLabel}>{t("ticket_popup.edit_required")}</p>
                        }
                    </div>
                    <div className={`column is-full-mobile is-half ${styles.extraQuestion}`}>
                        <label htmlFor={TicketKeys.email}>Email</label>
                        <Input
                            id={TicketKeys.email}
                            name={TicketKeys.email}
                            className="form-control"
                            type="text"
                            value={initialValues[TicketKeys.email]}
                            disabled={true}
                        />
                    </div>
                    <div className={`column is-full-mobile is-half ${styles.extraQuestion}`}>
                        <label htmlFor={TicketKeys.company}>Company</label>
                        <RegistrationCompanyInput
                            id={TicketKeys.company}
                            name={TicketKeys.company}
                            summitId={summit.id}
                            placeholder={'Your Company'}
                            value={formik.values[TicketKeys.company]}
                            onBlur={formik.handleBlur}
                            onChange={!!initialValues[TicketKeys.company].name ? noOpFn : formik.handleChange}
                            disabled={!!initialValues[TicketKeys.company].name}
                            tabSelectsValue={false}
                        />
                        {(formik.touched[TicketKeys.company] || triedSubmitting) && formik.errors[TicketKeys.company] &&
                        <p className={styles.errorLabel}>{t("ticket_popup.edit_required")}</p>
                        }
                    </div>
                </div>
                { hasExtraQuestions &&
                <>
                    <h2 className="mb-3">Additional Information</h2>
                    <p>Please answer these additional questions.</p>
                    <ExtraQuestionsForm
                        extraQuestions={extraQuestions}
                        userAnswers={formik.values[TicketKeys.extraQuestions]}
                        onAnswerChanges={onExtraQuestionsAnswersSet}
                        ref={formRef}
                        allowExtraQuestionsEdit={summit.allow_update_attendee_extra_questions}
                        questionContainerClassName={`columns is-multiline ${styles.extraQuestion} pt-3`}
                        questionLabelContainerClassName={'column is-full pb-0'}
                        questionControlContainerClassName={'column is-full pt-0'}
                        shouldScroll2FirstError={false}
                        onError={handleExtraQuestionError}
                    />
                </>
                }
                { summit.registration_disclaimer_content &&
                <div className="columns">
                    <div className={`column ${styles.extraQuestion} abc-checkbox`}>
                        <input
                            id={TicketKeys.disclaimerAccepted}
                            name={TicketKeys.disclaimerAccepted}
                            type="checkbox"
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
                        <p className={styles.errorLabel}>{t("ticket_popup.edit_required")}</p>
                        }
                        <div className="mt-3">
                            <RawHTML>
                                {summit.registration_disclaimer_content}
                            </RawHTML>
                        </div>
                    </div>
                </div>
                }
                <button
                    className={`${styles.buttonSave} button is-large`}
                    disabled={formik.isSubmitting}
                    onClick={triggerSubmit}>
                    {!formik.isSubmitting && <>Save and Continue</>}
                    {formik.isSubmitting && <>Saving...</>}
                </button>
            </div>
        </div>
    )
};

const ExtraQuestionsPage = (
    {
        location,
        user,
        summit,
        extraQuestions,
        saveAttendeeQuestions,
        getExtraQuestions,
    }
) => {

    useEffect(() => {
        getExtraQuestions();
    }, [])

    return (
        <Layout location={location}>
            <ExtraQuestionsPageTemplate
                user={user}
                summit={summit}
                extraQuestions={extraQuestions}
                saveAttendeeQuestions={saveAttendeeQuestions} />
        </Layout>
    )
}

ExtraQuestionsPage.propTypes = {
    user: PropTypes.object,
    saveAttendeeQuestions: PropTypes.func,
}

ExtraQuestionsPageTemplate.propTypes = {
    user: PropTypes.object,
    saveAttendeeQuestions: PropTypes.func,
}

const mapStateToProps = ({ userState, summitState }) => ({
    user: userState.userProfile,
    loading: userState.loading,
    summit: summitState.summit,
    extraQuestions: summitState.extra_questions,
})

export default connect(mapStateToProps,
    {
        saveAttendeeQuestions,
        getExtraQuestions,
    }
)(ExtraQuestionsPage);