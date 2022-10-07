import React from 'react'
import {connect} from "react-redux";
import PropTypes from 'prop-types'
import {navigate} from 'gatsby'
import {getEnvVariable, REGISTRATION_BASE_URL} from '../utils/envVariables'
import HeroComponent from '../components/HeroComponent'

export const TicketErrorPageTemplate = class extends React.Component {

    constructor(props) {
        super(props);

        const {location} = this.props;

        this.state = {
            error: location.state?.error
        }
    }

    redirect() {
        const {error} = this.state;

        if (getEnvVariable(REGISTRATION_BASE_URL)) {

            let targetUrl = null;

            switch (error) {
                case 'no-virtual-access':
                    targetUrl = `/`;
                    break
                case 'no-ticket':
                    targetUrl = `/#registration=1`;
                    break;
                case 'incomplete':
                    targetUrl = `/a/extra-questions`;
                    break;
                default:
                    break;
            }

            setTimeout(() => {
                if (targetUrl)
                    window.location.href = targetUrl;
            }, 5000);

            return;
        }

        setTimeout(() => {
            navigate('/')
        }, 5000);
    }

    getErrorMessage() {
        const {error} = this.state;

        let message = '';

        switch (error) {
            case 'no-virtual-access':
                message = 'I’m sorry your badge does not allow access to this section.';
                break;
            case 'no-ticket':
                message = 'I’m sorry you are not registered for this event.';
                break;
            case 'incomplete':
                message = 'You have not answered questions required to join the event.';
                break;
            default:
                break;
        }

        return message;
    }

    getRedirectMessage() {
        const {error} = this.state;
        let message = '';
        switch (error) {
            case 'no-ticket':
                message = getEnvVariable(REGISTRATION_BASE_URL) ? 'You will be redirected to registration.' : '';
                break;
            default:
                break;
        }

        return message;
    }

    render() {
        const {error} = this.state;

        if (error) {
            this.redirect();
            return (
                <HeroComponent
                    title={this.getErrorMessage()}
                    subtitle={this.getRedirectMessage()}
                />
            )
        }

        navigate('/');
        return null
    }
};

TicketErrorPageTemplate.propTypes = {
    location: PropTypes.object,
};

const TicketErrorPage = ({location, summit}) => {

    return (
        <TicketErrorPageTemplate
            location={location}
            summit={summit}
        />
    )

};

TicketErrorPage.propTypes = {
    location: PropTypes.object,
};

const mapStateToProps = ({summitState}) => ({
    summit: summitState.summit,
});

export default connect(mapStateToProps, {})(TicketErrorPage);