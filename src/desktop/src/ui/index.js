import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Switch, Route, withRouter } from "react-router-dom";
import { withI18n } from 'react-i18next';
import i18next from 'libs/i18next';

import { updateTheme } from 'actions/settings';
import { setOnboardingComplete, setAccountInfoDuringSetup } from 'actions/accounts';
import { getAccountNamesFromState, isSettingUpNewAccount } from 'selectors/accounts';
import { fetchNodeList } from 'actions/polling';
import { setPassword, setSeedIndex } from 'actions/wallet';
import { generateAlert } from 'actions/alerts';

import Theme from 'ui/global/theme';
import Onboarding from 'ui/views/onboarding/index';
import Wallet from 'ui/views/wallet/index';
import Loading from 'ui/components/loading';
import Settings from 'ui/views/settings/index';

import css from './index.scss';

/**
 * Wallet wrapper component
 **/
class App extends React.Component {
    static propTypes = {
        history: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
        themeName: PropTypes.string.isRequired,
        updateTheme: PropTypes.func.isRequired,
        locale: PropTypes.string.isRequired,
        accountNames: PropTypes.array.isRequired,
        onboardingComplete: PropTypes.bool.isRequired,
        seedIndex: PropTypes.number.isRequired,
        hasErrorFetchingFullAccountInfo: PropTypes.bool.isRequired,
        setOnboardingComplete: PropTypes.func.isRequired,
        addingAdditionalAccount: PropTypes.bool.isRequired,
        wallet: PropTypes.object.isRequired,
        generateAlert: PropTypes.func.isRequired,
        setPassword: PropTypes.func.isRequired,
        setSeedIndex: PropTypes.func.isRequired,
        setAccountInfoDuringSetup: PropTypes.func.isRequired,
    }
    constructor(props) {
        super(props);
        this.state = {
            fatalError: false,
        };
    }

    componentDidMount() {
        this.onMenuToggle = this.menuToggle.bind(this);
        this.onAccountSwitch = this.accountSwitch.bind(this);
        this.props.fetchNodeList();

        Electron.onEvent('menu', this.onMenuToggle);
        Electron.changeLanguage(this.props.t);
    }

    /**
     * Switch to an account based on account name
     * @param {string} accountName - target account name
     */
    accountSwitch(accountName) {
        const accountIndex = this.props.accountNames.indexOf(accountName);
        if (accountIndex > -1 && !this.props.isBusy) {
            this.props.setSeedIndex(accountIndex);
            this.props.history.push('/wallet');
        }
    }

    componentWillUnmount() {
        Electron.removeEvent('menu', this.onMenuToggle);
        Electron.removeEvent('account.switch', this.onAccountSwitch);
    }

    componentWillReceiveProps(nextProps) {
        // On language change
        if (nextProps.locale !== this.props.locale) {
            i18next.changeLanguage(nextProps.locale);
        }
        const currentKey = this.props.location.pathname.split('/')[1] || '/';
        if (nextProps.hasErrorFetchingFullAccountInfo && !this.props.hasErrorFetchingFullAccountInfo) {
            if (nextProps.accountNames.length === 0) {
                // Reset state password on unsuccessful first account info fetch
                this.props.setPassword({});
            } else {
                // Mark Onboarding as incomplete on unsuccessful additional account info fetch
                this.props.setAccountInfoDuringSetup({
                    completed: false,
                });
                this.props.history.push('/onboarding/account-name');
            }
        } else if (!this.props.wallet.ready && nextProps.wallet.ready && currentKey === 'onboarding') {
            Electron.setOnboardingSeed(null);
            if (!this.props.onboardingComplete) {
                this.props.setOnboardingComplete(true);
            }
            this.props.history.push('/wallet/');
        }
    }

    Init = (props) => {
        return (
            <Loading loop={false} onEnd={() => this.props.history.push('/onboarding/')} />
        );
    };

    /**
     * Proxy native menu triggers to an action
     * @param {string} item - Triggered menu item
     */
    menuToggle(item) {
        if (!item) {
            return;
        }
        switch (item) {
            case 'about':
                break;
            case 'errorlog':
                break;
            case 'feedback':
                break;
            case 'addAccount':
                this.props.history.push('/onboarding/seed-intro');
                break;
            case 'logout':
                this.props.clearWalletData();
                this.props.setPassword({});
                this.props.setAccountInfoDuringSetup({
                    name: '',
                    meta: {},
                    completed: false,
                    usedExistingSeed: false,
                });
                Electron.setOnboardingSeed(null);
                this.props.history.push('/onboarding/login');
                break;
            default:
                if (item.indexOf('settings/account') === 0) {
                    this.props.history.push(`/${item}/${this.props.seedIndex}`);
                } else {
                    console.log(item);
                    this.props.history.push(`/${item}`);
                    console.log('props', this.props);
                }
                break;
        }
    }

    render() {
        const { location, history } = this.props;
        const { fatalError } = this.state;
        const currentKey = location.pathname.split('/')[1] || '/';
        if (fatalError && (fatalError === 'Found old data' && currentKey !== 'settings')) {
            return (
                <div>
                    <Theme history={history} />
                    <FatalError error={fatalError} history={history} />
                </div>
            );
        }
        return (
            <div>
                <Theme history={history} />
                <Switch>
                    <Route path="/wallet" component={Wallet} />
                    <Route path="/onboarding" component={Onboarding} />
                    <Route exact
                        path="/settings/:setting?/:subsetting?/:accountIndex?"
                        component={Settings} />
                    <Route exact path="/" loop={false} component={this.Init} />
                </Switch>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    locale: state.settings.locale,
    themeName: state.settings.themeName,
    accountNames: getAccountNamesFromState(state),
    addingAdditionalAccount: isSettingUpNewAccount(state),
    wallet: state.wallet,
    onboardingComplete: state.accounts.onboardingComplete,
    hasErrorFetchingFullAccountInfo: state.ui.hasErrorFetchingFullAccountInfo,
    seedIndex: state.wallet.seedIndex
});

const mapDispatchToProps = {
    setPassword,
    updateTheme,
    setOnboardingComplete,
    setAccountInfoDuringSetup,
    fetchNodeList,
    setSeedIndex,
    generateAlert,
    setOnboardingComplete,
};

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(withI18n()(App)));
