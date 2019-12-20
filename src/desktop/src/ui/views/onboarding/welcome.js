import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import Scrollbar from 'ui/components/scrollbar';
import ReactMarkdown from 'react-markdown';

import { acceptTerms, acceptPrivacy, acceptNewTerms, updateNewTermsNotice } from 'actions/settings';

import { enTermsAndConditions, enPrivacyPolicy } from 'terms-conditions';
import Language from 'ui/components/input/language';
import Button from 'ui/components/button';
import Logos from 'ui/components/logos';
import css from './welcome.scss';
import { newTerms } from '../../../../../shared/config';
/**
 * Nautilus Welcome Screen component
 */
class Welcome extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        acceptedPrivacy: PropTypes.bool.isRequired,
        /** @ignore */
        acceptedTerms: PropTypes.bool.isRequired,
        /** @ignore */
        acceptTerms: PropTypes.func.isRequired,
        /** @ignore */
        acceptPrivacy: PropTypes.func.isRequired,
        /** @ignore */
        forceUpdate: PropTypes.bool.isRequired,
    };
    state = {
        step: 'language',
        scrollEnd: false,
    };

    onNextClick = () => {
        const { history, acceptedTerms, acceptedPrivacy, acceptTerms, acceptPrivacy, acceptNewTerms } = this.props;
        const { step } = this.state;

        if (acceptedTerms && acceptedPrivacy) {
            return history.push('/onboarding/seed-intro');
        }

        switch (step) {
            case 'language':
                this.setState({
                    step: 'terms',
                    scrollEnd: false,
                });
                break;
            case 'terms':
                acceptTerms();
                this.setState({
                    step: 'privacy',
                    scrollEnd: false,
                });
                break;
            default:
                acceptPrivacy();
                acceptNewTerms(newTerms);
                history.push('/onboarding/seed-intro');
        }
    };

    render() {
        const { history, t } = this.props;
        const { step, scrollEnd } = this.state;
        let markdown = '';
        markdown = step === 'terms' ? enTermsAndConditions : enPrivacyPolicy;

        return (
            <div>
                <Logos size={20} history={history} />
                <section className={css.home}>
                    {step === 'language' ? (
                        <React.Fragment>
                            <h1 className={css.language_h1}>{t('welcome:thankYou')}</h1>
                            <h6>
                                {t('welcome:thankYouDescription')}
                                <span className={css.span_style}>
                                    <b>.</b>
                                </span>
                            </h6>
                            <br></br>
                            <Language></Language>
                            <br></br>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <div className={css.privacy}>
                                <h1>{step === 'terms' ? 'Terms and Conditions' : t('privacyPolicy:privacyPolicy')}</h1>
                                <article>
                                    <Scrollbar contentId={step} onScrollEnd={() => this.setState({ scrollEnd: true })}>
                                        <ReactMarkdown source={markdown} />
                                    </Scrollbar>
                                </article>
                            </div>
                        </React.Fragment>
                    )}
                    <Button
                        disabled={step !== 'language' && !scrollEnd}
                        onClick={this.onNextClick}
                        className="backgroundNone"
                    >
                        {step === 'language'
                            ? t('continue')
                            : !scrollEnd
                            ? t('terms:readAllToContinue')
                            : t('terms:accept')}
                        <span className={css.span_style}> ></span>
                    </Button>
                </section>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    acceptedPrivacy: state.settings.acceptedPrivacy,
    acceptedTerms: state.settings.acceptedTerms,
    forceUpdate: state.wallet.forceUpdate,
});

const mapDispatchToProps = {
    acceptTerms,
    acceptPrivacy,
    acceptNewTerms,
    updateNewTermsNotice,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(Welcome));
