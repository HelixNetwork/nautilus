import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import Scrollbar from 'ui/components/Scrollbar';
import ReactMarkdown from 'react-markdown';
import { enTermsAndConditionsIOS, enPrivacyPolicyIOS } from 'terms-conditions';

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
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                {step === 'language' ? (
                                    <React.Fragment>
                                        <h1>Thank You</h1>
                                        <h6>for downloading the HellixWallet</h6>
                                        <br></br>
                                        <h5>Language</h5>
                                        <br></br>
                                        <div className={css['custom-select']}>
                                            <select>
                                                <option value="0">English(International)</option>
                                                <option value="1">German</option>
                                                <option value="2">French</option>
                                                <option value="3">English</option>
                                            </select>
                                        </div>
                                        <br></br>
                                    </React.Fragment>
                                ) : (
                                        <React.Fragment>
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
                            </div>
                        </div>
                    </div>
                </section>
                <footer>
                    <ul>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                    </ul>
                </footer>
            </div>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(Welcome);