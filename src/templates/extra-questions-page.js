import React, { useEffect, useState, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Layout from '../components/Layout'

import { getExtraQuestions } from '../actions/summit-actions'
import { saveExtraQuestions } from '../actions/user-actions'
import QuestionsSet  from 'openstack-uicore-foundation/lib/utils/questions-set'
import ExtraQuestionsForm from 'openstack-uicore-foundation/lib/components/extra-questions'

import styles from '../styles/extra-questions.module.scss'
import { navigate } from "gatsby";

export const ExtraQuestionsPageTemplate = ({ user, summit, extraQuestions, saveExtraQuestions }) => {

    const formRef = useRef(null);

    const ticket = user.summit_tickets.length > 0 ? user.summit_tickets[user.summit_tickets.length - 1] : null;

    const userAnswers = ticket ? ticket.owner.extra_questions : [];
    const [owner, setOwner] = useState({
        email: ticket?.owner.email || '',
        first_name: ticket?.owner.first_name || '',
        last_name: ticket?.owner.last_name || '',
        company: ticket?.owner.company || '',
        disclaimer: ticket?.owner?.disclaimer_accepted || false
    });

    // calculate state initial values
    const [answers, setAnswers] = useState([]);

    const checkAttendeeInformation = () => {
        return !!owner.first_name && !!owner.last_name && !!owner.company && !!owner.email
    }

    const checkMandatoryDisclaimer = () => {
        return summit.registration_disclaimer_mandatory ? owner.disclaimer : true;
    }

    const disabledButton = useMemo(() => !checkAttendeeInformation() || !checkMandatoryDisclaimer(),
        [owner.first_name, owner.last_name, owner.company, owner.email, owner.disclaimer]);

    const toggleDisclaimer = () => setOwner({ ...owner, disclaimer: !owner.disclaimer });

    const handleAnswerChanges = (answersForm) => {
        const qs = new QuestionsSet(extraQuestions);
        let newAnswers = [];
        Object.keys(answersForm).forEach(name => {
            let question = qs.getQuestionByName(name);
            if(!question){
                console.log(`missing question for answer ${name}.`);
                return;
            }
            newAnswers.push({ id: question.id, value: answersForm[name]});
        });
        setAnswers(newAnswers);
        saveExtraQuestions(newAnswers, owner)
    }

    const triggerFormSubmit = () => {
        if (extraQuestions.length > 0){
            formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
            return;
        }
        saveExtraQuestions([], owner)
    }

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
                        <label htmlFor="attendee-first-name">First Name</label>
                        <input
                            id="attendee-first-name"
                            className="form-control"
                            type="text"
                            placeholder="First Name"
                            onChange={e => setOwner({ ...owner, first_name: e.target.value })}
                            value={owner.first_name}
                        />
                    </div>
                    <div className={`column is-full-mobile is-half ${styles.extraQuestion}`}>
                        <label htmlFor="attendee-first-name">Last Name</label>
                        <input
                            id="attendee-last-name"
                            className="form-control"
                            type="text"
                            placeholder="Last Name"
                            onChange={e => setOwner({ ...owner, last_name: e.target.value })}
                            value={owner.last_name}
                        />
                    </div>
                    <div className={`column is-full-mobile is-half ${styles.extraQuestion}`}>
                        <label htmlFor="attendee-email">Email</label>
                        <input
                            id="attendee-email"
                            className="form-control"
                            type="text"
                            placeholder="Email"
                            onChange={e => setOwner({ ...owner, email: e.target.value })}
                            value={owner.email}
                            disabled={!!ticket.owner.email}
                        />
                    </div>
                    <div className={`column is-full-mobile is-half ${styles.extraQuestion}`}>
                        <label htmlFor="attendee-company">Company</label>
                        <input
                            id="attendee-company"
                            className="form-control"
                            type="text"
                            placeholder="Company"
                            onChange={e => setOwner({ ...owner, company: e.target.value })}
                            value={owner.company}
                        />
                    </div>
                </div>
                { extraQuestions.length > 0  &&
                <>
                    <h2 className="mb-3">Additional Information</h2>
                    <p>Please answer these additional questions.</p>
                    <ExtraQuestionsForm
                        extraQuestions={extraQuestions}
                        userAnswers={userAnswers}
                        onAnswerChanges={handleAnswerChanges}
                        ref={formRef}
                        allowExtraQuestionsEdit={summit.allow_update_attendee_extra_questions}
                        questionContainerClassName={`columns is-multiline ${styles.extraQuestion} pt-3`}
                        questionLabelContainerClassName={'column is-full pb-0'}
                        questionControlContainerClassName={'column is-full pt-0'}
                    />
                </>
                }
                { summit?.registration_disclaimer_content &&
                <div className="columns">
                    <div className="column">
                        <input
                            className={`${summit.registration_disclaimer_mandatory ? styles.mandatoryDisclaimer : ""}`}
                            type="checkbox"
                            checked={owner.disclaimer}
                            onChange={toggleDisclaimer}
                        />
                        <span dangerouslySetInnerHTML={{ __html: summit.registration_disclaimer_content }} />
                    </div>
                </div>
                }
                <button
                    className={`${styles.buttonSave} button is-large`}
                    disabled={disabledButton}
                    onClick={() => triggerFormSubmit()}>
                    Save and Continue
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
        saveExtraQuestions,
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
                saveExtraQuestions={saveExtraQuestions} />
        </Layout>
    )
}

ExtraQuestionsPage.propTypes = {
    user: PropTypes.object,
    saveExtraQuestions: PropTypes.func,
}

ExtraQuestionsPageTemplate.propTypes = {
    user: PropTypes.object,
    saveExtraQuestions: PropTypes.func,
}

const mapStateToProps = ({ userState, summitState }) => ({
    user: userState.userProfile,
    loading: userState.loading,
    summit: summitState.summit,
    extraQuestions: summitState.extra_questions,
})

export default connect(mapStateToProps,
    {
        saveExtraQuestions,
        getExtraQuestions,
    }
)(ExtraQuestionsPage);