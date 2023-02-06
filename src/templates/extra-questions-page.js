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
        if(extraQuestions.length > 0){
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
        <>
            <div className="columns">
                <div className="column px-6 py-6 mb-6 is-half is-offset-one-quarter">
                    <h2>Attendee Information</h2>
                    <div className={styles.form}>
                        <div className={`columns is-mobile ${styles.inputRow}`}>
                            <div className='column is-one-third'>Ticket assigned to email</div>
                            <div className='column is-two-thirds'>
                                {owner.email}
                            </div>
                        </div>
                        <div className={`columns is-mobile ${styles.inputRow}`}>
                            <div className='column is-one-third'>First Name</div>
                            <div className='column is-two-thirds'>
                                {ticket.owner.first_name ?
                                    owner.first_name
                                    :
                                    <input
                                        className={`${styles.input} ${styles.isMedium}`}
                                        type="text"
                                        placeholder="First Name"
                                        onChange={e => setOwner({ ...owner, first_name: e.target.value })}
                                        value={owner.first_name} />
                                }
                            </div>
                        </div>
                        <div className={`columns is-mobile ${styles.inputRow}`}>
                            <div className='column is-one-third'>Last Name</div>
                            <div className='column is-two-thirds'>
                                {ticket.owner.last_name ?
                                    owner.last_name
                                    :
                                    <input
                                        className={`${styles.input} ${styles.isMedium}`}
                                        type="text"
                                        placeholder="Last Name"
                                        onChange={e => setOwner({ ...owner, last_name: e.target.value })}
                                        value={owner.last_name} />
                                }
                            </div>
                        </div>
                        <div className={`columns is-mobile ${styles.inputRow}`}>
                            <div className='column is-one-third'>Company</div>
                            <div className='column is-two-thirds'>
                                {ticket.owner.company ?
                                    owner.company
                                    :
                                    <input
                                        className={`${styles.input} ${styles.isMedium}`}
                                        type="text"
                                        placeholder="Company"
                                        onChange={e => setOwner({ ...owner, company: e.target.value })}
                                        value={owner.company} />
                                }
                            </div>
                        </div>
                    </div>
                    { extraQuestions.length > 0  &&
                        <>
                            <h2>Additional Information</h2>
                            <span>
                                <p>
                                    Please answer these additional questions.
                                </p>
                                <p>
                                    * Required questions
                                </p>
                                <br />
                            </span>
                            <div>
                                <ExtraQuestionsForm
                                    extraQuestions={extraQuestions}
                                    userAnswers={userAnswers}
                                    onAnswerChanges={handleAnswerChanges}
                                    ref={formRef}
                                    allowExtraQuestionsEdit={summit.allow_update_attendee_extra_questions}
                                    questionContainerClassName={'columns'}
                                    questionLabelContainerClassName={'column is-one-third'}
                                    questionControlContainerClassName={'column is-two-thirds'}
                                />
                            </div>
                        </>
                    }
                    { summit?.registration_disclaimer_content &&
                        <div className={`columns ${styles.disclaimer}`}>
                            <div className="column is-12">
                                <input type="checkbox" checked={owner.disclaimer} onChange={toggleDisclaimer} />
                                <b>{summit.registration_disclaimer_mandatory ? '*' : ''}</b>
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
        </>
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