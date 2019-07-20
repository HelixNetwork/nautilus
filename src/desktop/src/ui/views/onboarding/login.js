import React from 'react';
import { connect } from 'react-redux';
import { generateAlert } from 'actions/alerts';
import classNames from 'classnames';
import { withI18n, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import Button from 'ui/components/button';
import Logos from 'ui/components/logos';
import css from './index.scss';

import { hash, authorize } from 'libs/crypto';
import { setPassword } from 'actions/wallet';

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
        getChartData: PropTypes.func.isRequired,
        /** @ignore */
        getPrice: PropTypes.func.isRequired,
        /** @ignore */
        getMarketData: PropTypes.func.isRequired,
        /** @ignore */
        getCurrencyData: PropTypes.func.isRequired,
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
        // shouldMigrate: false,
    };

    componentDidMount() {
        Electron.updateMenu('authorised', false);

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

        const accountName = addingAdditionalAccount ? additionalAccountName : currentAccountName;
        const accountMeta = addingAdditionalAccount ? additionalAccountMeta : currentAccountMeta;

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
    
    handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }

        const { password } = this.state;
        const { setPassword, history, generateAlert, t, completedMigration } = this.props;

        let passwordHash = null;
        let authorised = false;

        try {
            passwordHash = await hash(password);
        } catch (err) {
            generateAlert('error', t('errorAccessingKeychain'), t('errorAccessingKeychainExplanation'), 20000, err);
        }

        try {
            authorised = await authorize(passwordHash);
        } catch (err) {
            generateAlert('error', t('unrecognisedPassword'), t('unrecognisedPasswordExplanation'));
        }

        if (authorised) {
            setPassword(passwordHash);

            this.setState({
                password: '',
            });

            // if (!completedMigration) {
            //     this.setState({ shouldMigrate: true });
            //     return;
            // }

            try {
                await this.setupAccount();
                this.props.history.push('wallet/dashboard');
            } catch (err) {
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
        return (
            <section className="spage_1">
                <Logos />
                <div className="container">
                    <div className="row">
                        <div className={classNames(css.sseed_box, css.cre_pgs)}>
                            <form onSubmit={(e) => this.handleSubmit(e)}>
                                <h5>{t('login:enterPassword')}<span className={classNames(css.text_color)}>.</span> </h5>
                                <input type="password" className={classNames(css.sseed_textline)}></input><br /><br />
                                <Button  type="submit" >{t('login:login')}</Button>
                            </form>
                        </div>
                        {/* <div className={css.onboard_nav}> */}
                            <Button style={{top:'440px',left:'550px'}} className="navleft" variant="backgroundNone" onClick={() => this.stepForward('seed-verify')} >{t('global:goBack')} <span>></span></Button>                            </div>
                    {/* </div> */}
                </div>
            </section>
        );
    }
}

const mapDispatchToProps = (state)=> ({
    password: state.password,
    generateAlert,
});

export default connect(null, mapDispatchToProps)(withI18n()(Login));