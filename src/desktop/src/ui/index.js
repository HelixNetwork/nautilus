import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Switch, Route, withRouter, Link } from "react-router-dom";
import { withI18n, useTranslation, translate, Trans } from 'react-i18next';
import i18next from 'libs/i18next';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import Onboarding from 'ui/views/onboarding/index';
import Wallet from 'ui/views/wallet/index';
import Loading from 'ui/components/loading';
import { updateTheme } from 'actions/settings';
import Theme from 'ui/global/theme';
import Settings from 'ui/views/settings/index';
import SettingsLanguage from 'ui/views/settings/language';
import css from './index.scss';
import { setOnboardingComplete, setAccountInfoDuringSetup } from 'actions/accounts';
import { getAccountNamesFromState, isSettingUpNewAccount } from 'selectors/accounts';
import { fetchNodeList } from 'actions/polling';
import {
    setPassword
} from 'actions/wallet';

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
    }
    constructor(props) {
        super(props);
        this.state = {
            fatalError: false,
        };
    }

    componentDidMount() {
        this.props.fetchNodeList();
        Electron.changeLanguage(this.props.t);
    }

    componentWillReceiveProps(nextProps) {
        console.log("this prpps", this.props);
        console.log(nextProps);       
        /* On language change */
        if (nextProps.locale !== this.props.locale) {
            i18next.changeLanguage(nextProps.locale);
        }
        const currentKey = this.props.location.pathname.split('/')[1] || '/';
        console.log("current key", currentKey);
        console.log("next propps", nextProps);
        if (nextProps.hasErrorFetchingFullAccountInfo && !this.props.hasErrorFetchingFullAccountInfo) {
            console.log('one');
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
            console.log('two');
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

    render() {
        console.log("index", this.props);
        const { location, history } = this.props;
        const { fatalError } = this.state;
        const currentKey = location.pathname.split('/')[1] || '/';
        return (
            <div>
                <Theme history={history} />
                <Switch>
                    <Route path="/wallet" component={Wallet} />
                    <Route path="/onboarding" component={Onboarding} />
                    <Route path="/settings" component={Settings} />
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
});

const mapDispatchToProps = {
    setPassword,
    updateTheme,
    setOnboardingComplete,
    setAccountInfoDuringSetup,
    fetchNodeList
};

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(withI18n()(App)));
