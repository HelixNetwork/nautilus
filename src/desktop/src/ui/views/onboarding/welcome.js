import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import Scrollbar from 'ui/components/scrollbar';
import ReactMarkdown from 'react-markdown';
import { enTermsAndConditionsIOS, enPrivacyPolicyIOS } from 'terms-conditions';
import Language from 'ui/components/input/language';

import css from './welcome.scss';

/**
 * Helix Welcome Screen component
 */
class Welcome extends React.PureComponent {
    static propTypes = {
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired
    }
    state = {
        step: 'language',
        scrollEnd: false,
    };

    onNextClick = () => {
        const { history } = this.props;
        const { step } = this.state;

        switch (step) {
            case 'language':
                this.setState({
                    step: 'terms',
                    scrollEnd: false,
                });
                break;
            case 'terms':
                this.setState({
                    step: 'privacy',
                    scrollEnd: false,
                });
                break;
            default:
                history.push('/onboarding/seed-intro');
        }
    }

    render() {
        const { step, scrollEnd } = this.state;
        let markdown = '';
        markdown = step === 'terms' ? enTermsAndConditionsIOS : enPrivacyPolicyIOS;

        return (
            <div>
                <section className={css.home}>
                    {step === 'language' ? (
                        <React.Fragment>
                            <h1>Thank You</h1>
                            <h6>for downloading the HellixWallet</h6>
                            <br></br>
                            <Language></Language>
                            <br></br>
                        </React.Fragment>
                    ) : (
                            <React.Fragment>
                                <h1>
                                    {step === 'terms' ? 'Terms and Conditions' : 'Privacy Policy'}
                                </h1>
                                <article>
                                    <Scrollbar contentId={step} onScrollEnd={() => this.setState({ scrollEnd: true })}>
                                        <ReactMarkdown source={markdown} />
                                    </Scrollbar>
                                </article>
                            </React.Fragment>
                        )}
                    <a disabled={step !== 'language' && !scrollEnd} onClick={this.onNextClick} className={css.cont}>
                        {step === 'language'
                            ? 'Continue'
                            : !scrollEnd ? 'Read all to Continue' : 'Accept'}
                        <span> ></span></a>
                </section>
            </div>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(Welcome);