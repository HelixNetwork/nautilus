import React from 'react';
import { connect } from 'react-redux';
import { generateAlert } from 'actions/alerts';
import classNames from 'classnames';
import { withI18n } from 'react-i18next';
import PropTypes from 'prop-types';
import Button from 'ui/components/button';
import Loading from 'ui/components/loading';
import SeedStore from 'libs/seed';
import { getAccountInfo, getFullAccountInfo } from 'actions/accounts';
import { getSelectedAccountName, getSelectedAccountMeta, isSettingUpNewAccount } from 'selectors/accounts';
import { hash, authorize } from 'libs/crypto';
import { setPassword, clearWalletData } from 'actions/wallet';
import css from './index.scss';
import { Row } from 'react-bootstrap';
import { NEWTERMS, NEWTERMSNOTICE } from '../../../../../shared/config';
import { acceptNewTerms, updateNewTermsNotice } from 'actions/settings';
import { enTermsAndConditions, enPrivacyPolicy } from 'terms-conditions';
import Scrollbar from 'ui/components/scrollbar';
import ReactMarkdown from 'react-markdown';

class Login extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        currentAccountName: PropTypes.string,
        /** @ignore */
        currentAccountMeta: PropTypes.object,
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** @ignore */
        ui: PropTypes.object.isRequired,
        /** @ignore */
        addingAdditionalAccount: PropTypes.bool.isRequired,
        /** @ignore */
        additionalAccountMeta: PropTypes.object.isRequired,
        /** @ignore */
        additionalAccountName: PropTypes.string.isRequired,
        /** @ignore */
        completedMigration: PropTypes.bool.isRequired,
        /** @ignore */
        forceUpdate: PropTypes.bool.isRequired,
        /** @ignore */
        getAccountInfo: PropTypes.func.isRequired,
        /** @ignore */
        currency: PropTypes.string.isRequired,
        /** @ignore */
        setPassword: PropTypes.func.isRequired,
        /** @ignore */
        clearWalletData: PropTypes.func.isRequired,
        /** @ignore */
        // getCurrencyData: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        getFullAccountInfo: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        complete: PropTypes.bool,
    };

    state = {
        password: '',
        shouldMigrate: false,
        showTerms: false,
        showPrivacy: false,
        scrollEnd: false,
    };

    setShowTerms(e) {
        this.setState({
            showTerms: false,
            showPrivacy: true,
            scrollEnd: false,
            showNewTermsNotification: false,
        });
    }

    setShowPrivacy(e) {
        this.props.acceptNewTerms(NEWTERMS);
        this.setState({ showPrivacy: false });
    }

    hideTermsNotificaition(e) {
        console.log('hi');
        this.props.updateNewTermsNotice(NEWTERMSNOTICE);
        this.setState({
            showNewTermsNotification: false,
        });
    }

    componentDidMount() {
        const { password, addingAdditionalAccount } = this.props;
        if (password.length && addingAdditionalAccount) {
            this.setupAccount();
        } else {
            this.props.clearWalletData();
            this.props.setPassword({});
        }
    }

    componentDidUpdate(prevProps) {
        if (this.state.shouldMigrate && !prevProps.completedMigration && this.props.completedMigration) {
            this.setupAccount();
        }
    }

    componentWillUnmount() {
        // eslint-disable-next-line no-undef
        setTimeout(() => Electron.garbageCollect(), 1000);
    }

    /**
     * Update current input password value
     * @param {string} password - Password value
     */
    setPassword = (password) => {
        this.setState({
            password: password,
        });
    };

    stepForward(route) {
        this.props.history.push(`/onboarding/${route}`);
    }
    /**
     * Get target seed and trigger fetch account info based on seed type
     * @param {event} Event - Form submit event
     * @returns {undefined}
     */
    setupAccount = async () => {
        const {
            password,
            addingAdditionalAccount,
            additionalAccountName,
            additionalAccountMeta,
            currentAccountName,
            currentAccountMeta,
        } = this.props;
        const accountName = addingAdditionalAccount ? additionalAccountName : currentAccountName;
        const accountMeta = addingAdditionalAccount ? additionalAccountMeta : currentAccountMeta;
        let seedStore;
        try {
            seedStore = await new SeedStore[accountMeta.type](password, accountName, accountMeta);
        } catch (e) {
            e.accountName = accountName;
            throw e;
        }

        if (addingAdditionalAccount) {
            this.props.getFullAccountInfo(seedStore, accountName);
        } else {
            // eslint-disable-next-line no-undef
            this.props.getAccountInfo(seedStore, accountName, Electron.notify);
        }
    };

    /**
     * Verify password and trigger account setup
     * @param {event} Event - Form submit event
     * @returns {undefined}
     */

    doLogin = async (e) => {
        if (e) {
            e.preventDefault();
        }

        const { password } = this.state;
        const { setPassword, generateAlert, t } = this.props;

        let passwordHash = null;
        let authorised = false;
        try {
            passwordHash = await hash(password);
        } catch (err) {
            generateAlert('error', t('errorAccessingKeychain'), t('errorAccessingKeychainExplanation'), 2000, err);
        }
        try {
            authorised = await authorize(passwordHash);
        } catch (err) {
            generateAlert('error', t('unrecognisedPassword'), t('unrecognisedPasswordExplanation'), 1000);
        }

        if (authorised) {
            setPassword(passwordHash);

            this.setState({
                password: '',
            });

            try {
                await this.setupAccount();
            } catch (err) {
                generateAlert(
                    'error',
                    t('unrecognisedAccount'),
                    t('unrecognisedAccountExplanation', { accountName: err.accountName }),
                );
            }
        }
    };

    render() {
        const { t, addingAdditionalAccount, ui, themeName, complete, newterms, newtermsupdatenotice } = this.props;
        const { showPrivacy, showTerms, scrollEnd, showNewTermsNotification } = this.state;
        console.log(NEWTERMSNOTICE);
        if (newterms < NEWTERMS && !this.state.showPrivacy) {
            this.setState({
                showTerms: true,
            });
        } else if (newterms === NEWTERMS && newtermsupdatenotice < NEWTERMSNOTICE) {
            this.setState({
                showNewTermsNotification: true,
            });
        }
        if (ui.isFetchingAccountInfo) {
            return (
                <Loading
                    loop
                    title={addingAdditionalAccount ? t('loading:loadingFirstTime') : null}
                    subtitle={addingAdditionalAccount ? t('loading:thisMayTake') : null}
                    themeName={themeName}
                />
            );
        }
        let styles = {
            color: '#E9B339',
            fontSize: '20px',
        };
        return (
            <div>
                {!showTerms && !showPrivacy ? (
                    <div>
                        <Row className={css.centerBox} style={{ marginTop: '10vw' }}>
                            <form onSubmit={(e) => this.doLogin(e)}>
                                <h5>
                                    {t('login:enterPassword')}
                                    <span className={classNames(css.text_color)}>.</span>{' '}
                                </h5>
                                <input
                                    type="password"
                                    value={this.state.password}
                                    label={t('password')}
                                    name="password"
                                    onChange={(e) => this.setPassword(e.target.value)}
                                    className={classNames(css.sseed_textline)}
                                ></input>
                                <br />
                                <br />
                                <Button type="submit">{t('login:login')}</Button>
                            </form>
                        </Row>

                        <Row>
                            {complete ? (
                                <React.Fragment></React.Fragment>
                            ) : (
                                <React.Fragment>
                                    <Button variant="backgroundNone" onClick={() => this.stepForward('seed-verify')}>
                                        <span>&lt;</span> {t('global:goBack')}
                                    </Button>
                                </React.Fragment>
                            )}
                        </Row>
                    </div>
                ) : (
                    <div>
                        <React.Fragment>
                            <div className={css.privacy}>
                                <h1>{showTerms ? 'Terms and Conditions' : t('privacyPolicy:privacyPolicy')}</h1>
                                <article>
                                    <Scrollbar
                                        contentId={'terms'}
                                        onScrollEnd={() => this.setState({ scrollEnd: true })}
                                    >
                                        <ReactMarkdown source={showTerms ? enTermsAndConditions : enPrivacyPolicy} />
                                    </Scrollbar>
                                </article>
                            </div>
                        </React.Fragment>

                        <Button
                            disabled={!scrollEnd}
                            onClick={showTerms ? this.setShowTerms.bind(this) : this.setShowPrivacy.bind(this)}
                            className="backgroundNone"
                        >
                            {!scrollEnd ? t('terms:readAllToContinue') : t('terms:accept')}
                            <span style={styles}> ></span>
                        </Button>
                    </div>
                )}
                {showNewTermsNotification && (
                    <div className={css.newtermsUpdateNotice}>
                        <p>We are updating our Terms&amp;Conditions and Privacy Policy</p>
                        <input
                            type="checkbox"
                            checked={!showNewTermsNotification}
                            onChange={this.hideTermsNotificaition.bind(this)}
                        />
                        <label>Don't show this message again.</label>
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    password: state.wallet.password,
    currentAccountName: getSelectedAccountName(state),
    currentAccountMeta: getSelectedAccountMeta(state),
    addingAdditionalAccount: isSettingUpNewAccount(state),
    additionalAccountMeta: state.accounts.accountInfoDuringSetup.meta,
    additionalAccountName: state.accounts.accountInfoDuringSetup.name,
    ui: state.ui,
    currency: state.settings.currency,
    forceUpdate: state.wallet.forceUpdate,
    completedMigration: state.settings.completedMigration,
    themeName: state.settings.themeName,
    complete: state.accounts.onboardingComplete,
    newterms: state.settings.newterms,
    newtermsupdatenotice: state.settings.newtermsupdatenotice,
});

const mapDispatchToProps = {
    generateAlert,
    setPassword,
    clearWalletData,
    getFullAccountInfo,
    getAccountInfo,
    acceptNewTerms,
    updateNewTermsNotice,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(Login));
