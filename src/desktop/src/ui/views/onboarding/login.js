import React from 'react';
import { connect } from 'react-redux';
import { generateAlert } from 'actions/alerts';
import classNames from 'classnames';
import { withI18n, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import Button from 'ui/components/button';
import Logos from 'ui/components/logos';
import css from './index.scss';
import { getAccountInfo, getFullAccountInfo } from 'actions/accounts';
import { getSelectedAccountName, getSelectedAccountMeta, isSettingUpNewAccount } from 'selectors/accounts';

import { hash, authorize } from 'libs/crypto';
import { setPassword, clearWalletData } from 'actions/wallet';
import SeedStore from 'libs/seed';

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
    };


    state = {
        password: '',
        shouldMigrate: false,
    };

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
        setTimeout(() => Electron.garbageCollect(), 1000);
    }

    /**
     * Update current input password value
     * @param {string} password - Password value
     */
    setPassword = (password) => {
        console.log('password', password);
        this.setState({
            password: password,
        });
    };

    stepForward(route) {
        // this.handleClick=this.handleClick.bind(this);

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
            currency,
            currentAccountName,
            currentAccountMeta,
        } = this.props;

        console.log("props", this.props)

        console.log("account addi", addingAdditionalAccount)

        const accountName = addingAdditionalAccount ? additionalAccountName : currentAccountName;
        const accountMeta = addingAdditionalAccount ? additionalAccountMeta : currentAccountMeta;

        console.log("account name", accountName)

        console.log("account meta", accountMeta)
        let seedStore;
        try {
            seedStore = await new SeedStore[accountMeta.type](password, accountName, accountMeta);
        } catch (e) {
            e.accountName = accountName;
            throw e;
        }

        this.props.getPrice();
        this.props.getChartData();
        this.props.getMarketData();
        this.props.getCurrencyData(currency);

        if (addingAdditionalAccount) {
            this.props.getFullAccountInfo(seedStore, accountName);
        } else {
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
        const { setPassword, history, generateAlert, t, completedMigration } = this.props;

        let passwordHash = null;
        let authorised = false;
        console.log("Password", password);
        try {
            passwordHash = await hash(password);
        } catch (err) {
            generateAlert('error', t('errorAccessingKeychain'), t('errorAccessingKeychainExplanation'), 20000, err);
        }
        console.log("Hashed", passwordHash);
        try {
            authorised = await authorize(passwordHash);
        } catch (err) {
            generateAlert('error', t('unrecognisedPassword'), t('unrecognisedPasswordExplanation'));
        }

        if (authorised) {
            console.log("here");
            setPassword(passwordHash);

            this.setState({
                password: '',
            });

            // if (!completedMigration) {
            //     this.setState({ shouldMigrate: true });
            //     return;
            // }

            try {
                console.log("here AJI");
                await this.setupAccount();
                this.props.history.push('wallet/dashboard');
            } catch (err) {
                console.log(err);
                generateAlert(
                    'error',
                    t('unrecognisedAccount'),
                    t('unrecognisedAccountExplanation', { accountName: err.accountName }),
                );
            }
        }
    };
    // const { history } = this.props;
    // history.push('/wallet');
    render() {
        const { t } = this.props;
        console.log("login state", this.state);
        return (
            <section className="spage_1">
                <Logos />
                <div className="container">
                    <div className="row">
                        <div className={classNames(css.sseed_box, css.cre_pgs)}>
                            <form onSubmit={(e) => this.doLogin(e)}>
                                <h5>{t('login:enterPassword')}<span className={classNames(css.text_color)}>.</span> </h5>
                                <input type="password"
                                    value={this.state.password}
                                    label={t('password')}
                                    name="password"
                                    onChange={(e) => this.setPassword(e.target.value)}
                                    className={classNames(css.sseed_textline)}></input><br /><br />
                                <Button type="submit" >{t('login:login')}</Button>
                            </form>
                        </div>
                        {/* <div className={css.onboard_nav}> */}
                        <Button style={{ top: '440px', left: '550px' }} className="navleft" variant="backgroundNone" onClick={() => this.stepForward('seed-verify')} >{t('global:goBack')} <span>></span></Button>                            </div>
                    {/* </div> */}
                </div>
            </section>
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
});

const mapDispatchToProps = {
    generateAlert,
    setPassword,
    clearWalletData,
    getFullAccountInfo,
    getAccountInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(Login));