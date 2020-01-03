/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { withRouter, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import TopBar from './topBar';
import {
    getSelectedAccountName,
    getSelectedAccountMeta,
    getAccountNamesFromState,
    selectAccountInfo,
    getBalanceForSelectedAccount,
} from 'selectors/accounts';
import { getSeedIndexFromState } from 'selectors/global';
import { getAccountInfo } from 'actions/accounts';
import SeedStore from 'libs/seed';
import { setSeedIndex } from 'actions/wallet';
import Send from 'ui/views/wallet/send';
import Receive from 'ui/views/wallet/receive';
import Chart from 'ui/views/wallet/chart';
import WalletHistory from 'ui/views/wallet/wallet_history';
import Support from 'ui/views/wallet/support';
import DashSidebar from 'ui/components/dash_sidebar';
import axios from 'axios';
import Polling from 'ui/global/polling';

/**
 * Wallet functionallity router wrapper component
 */
class Wallet extends React.PureComponent {
    static propTypes = {
        /**@ignore */
        accounts: PropTypes.object.isRequired,
        /**@ignore */
        accountNames: PropTypes.array.isRequired,
        /**@ignore */
        accountName: PropTypes.string.isRequired,
        /**@ignore */
        accountMeta: PropTypes.object.isRequired,
        /**@ignore */
        accountInfo: PropTypes.object.isRequired,
        /**@ignore */
        getAccountInfo: PropTypes.func.isRequired,
        /**@ignore */
        setSeedIndex: PropTypes.func.isRequired,
        /**@ignore */
        balance: PropTypes.number.isRequired,
        /**@ignore */
        seedIndex: PropTypes.number,
        /**@ignore */
        location: PropTypes.object,
        /**@ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
    };
    /**
     * Update Account
     * @returns {Undefined}
     */
    updateAccount = async (accountName, index) => {
        const { password, getAccountInfo, accountMeta, history } = this.props;
        await this.props.setSeedIndex(index);
        const seedStore = await new SeedStore[accountMeta.type](password, accountName, accountMeta);
        // eslint-disable-next-line no-undef
        getAccountInfo(seedStore, accountName, Electron.notify);
        history.push('/wallet/');
    };
    state = {
        currencyValue: 0,
    };
    componentDidMount() {
        const url = 'https://nautilus-exchange-rates.herokuapp.com/api/latest?base=USD';
        axios.get(url).then((resp) => {
            this.setState({
                currencyValue: this.props.balance * resp.data.rates[this.props.currency],
            });
        });
    }

    render() {
        const { location, history } = this.props;
        const currentKey = location.pathname.split('/')[2] || '/';
        if (currentKey === '/') {
            return (
                <div>
                    <TopBar history={history} />
                    <DashSidebar disp={'none'} history={history} active={'send'} />

                    <Switch>
                        <Route path="/wallet/" component={Send} />
                        <Route path="/wallet/send" component={Send} />
                        <Route exact path="/wallet/receive" component={Receive} />
                        <Route path="/wallet/chart" component={Chart} />
                        <Route path="/wallet/history" component={WalletHistory} />
                        <Route path="/wallet/support" component={Support} />
                    </Switch>
                </div>
            );
        }
        return (
            <div>
                <Polling />
                <TopBar history={history} />
                <DashSidebar disp={'none'} history={history} active={currentKey} />
                <Switch>
                    <Route path="/wallet/send" component={Send} />
                    <Route exact path="/wallet/receive" component={Receive} />
                    <Route path="/wallet/chart" component={Chart} />
                    <Route path="/wallet/history" component={WalletHistory} />
                    <Route path="/wallet/support" component={Support} />
                </Switch>
            </div>
        );
    }
}
const mapStateToProps = (state) => ({
    accounts: state.accounts,
    accountNames: getAccountNamesFromState(state),
    accountMeta: getSelectedAccountMeta(state),
    password: state.wallet.password,
    accountName: getSelectedAccountName(state),
    accountInfo: selectAccountInfo(state),
    seedIndex: getSeedIndexFromState(state),
    balance: getBalanceForSelectedAccount(state),
    currency: state.settings.currency,
});

const mapDispatchToProps = {
    getAccountInfo,
    setSeedIndex,
};
export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(withI18n()(Wallet)),
);
