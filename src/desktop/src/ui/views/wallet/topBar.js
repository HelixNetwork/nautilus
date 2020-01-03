/* global Electron */
import React, { Component } from 'react';
import logo from 'ui/images/logo.png';
import css from './wallet.scss';
import hlx from 'ui/images/hlx.png';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
    getSelectedAccountName,
    getSelectedAccountMeta,
    getAccountNamesFromState,
    selectAccountInfo,
    getBalanceForSelectedAccount,
} from 'selectors/accounts';
import { getSeedIndexFromState } from 'selectors/global';
import { getAccountInfo } from 'actions/accounts';
import { accumulateBalance } from 'libs/hlx/addresses';
import SeedStore from 'libs/seed';
import { setSeedIndex } from 'actions/wallet';
import { unitConverter, formatUnit } from 'libs/hlx/utils';
import { IntlProvider, FormattedNumber } from 'react-intl';
import axios from 'axios';

/**
 * Topbar component
 */

class TopBar extends Component {
    static propTypes = {
        accounts: PropTypes.object.isRequired,
        accountNames: PropTypes.array.isRequired,
        accountName: PropTypes.string.isRequired,
        accountMeta: PropTypes.object.isRequired,
        accountInfo: PropTypes.object.isRequired,
        getAccountInfo: PropTypes.func.isRequired,
        setSeedIndex: PropTypes.func.isRequired,
        balance: PropTypes.number.isRequired,
        seedIndex: PropTypes.number,
        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
    };
    state = {
        amount: 0,
        accountBalance: 0,
        accumulatedBalance: 0,
        selectedUnit: 'mHLX',
    };

    /**
     * Changes between accounts or invokes add account
     *
     * @method changeAccount
     * @param {*} e
     */
    changeAccount(e) {
        if (e.target.value === 'add') {
            this.props.history.push('/onboarding/seed-intro');
        } else {
            const selection = JSON.parse(e.target.value);
            this.updateAccount(selection.accountName, selection.index);
        }
    }

    /**
     * Toggle balance unit according to users input
     *
     * @method toggleBalanceUnit
     * @param {String} selectedUnit - Selected unit to toggle
     */
    toggleBalanceUnit(selectedUnit) {
        let balance = this.state.accumulatedBalance;
        let formattedBalance = unitConverter(balance, selectedUnit);
        this.setState({
            accountBalance: formattedBalance,
            selectedUnit,
        });
    }
    /**
     * Updates the selected account
     * @param {String} accountName
     * @param {Integer} index - account index
     */

    updateAccount = async (accountName, index) => {
        const { password, accountMeta, history, getAccountInfo, setSeedIndex } = this.props;
        await setSeedIndex(index);
        const seedStore = await new SeedStore[accountMeta.type](password, accountName, accountMeta);
        // eslint-disable-next-line no-undef
        getAccountInfo(seedStore, accountName, Electron.notify);
        this.updateBalance();
        history.push('/wallet/');
    };

    /**
     * Updates the balance of selected account
     */

    updateBalance = async () => {
        const { accountInfo } = this.props;
        let balance = accumulateBalance(accountInfo.addressData.map((addressdata) => addressdata.balance));
        let unit = formatUnit(balance);
        let formattedBalance = unitConverter(balance, unit);
        this.setState({
            accumulatedBalance: balance,
            accountBalance: formattedBalance,
            selectedUnit: unit,
        });
    };

    componentDidMount() {
        const { currency } = this.props;
        const url = 'https://nautilus-exchange-rates.herokuapp.com/api/latest?base=USD';
        this.updateBalance();
        axios.get(url).then((resp) => {
            this.setState({
                amount: (resp.data.rates[currency] * 0.022).toFixed(3),
            });
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.accountInfo !== prevProps.accountInfo) {
            this.updateBalance();
        }
    }

    render() {
        const { accountNames, accountName, seedIndex, currency, conversionRate } = this.props;
        let { amount } = this.state;
        // Hard coded exchange rate until hlx coin goes to exchanges
        if (conversionRate !== 0) {
            amount = (0.022 * conversionRate).toFixed(3);
        }

        return (
            <div>
                <div className={css.top}>
                    <img src={logo} alt=" " />
                    <div className={css.topIn}>
                        <h4 className={css.topBar_h4}>BALANCE</h4>
                        <br />
                        <div>
                            {' '}
                            <span className={css.dot}></span>
                            <h6 className={css.link_opacity}>
                                <IntlProvider locale="en">
                                    <FormattedNumber value={amount} currency={currency} />
                                </IntlProvider>
                                /mHLX
                            </h6>
                        </div>
                    </div>
                    <div className={css.topBal}>
                        <img src={hlx} alt=" " />
                        <h2>
                            <span>{this.state.accountBalance.toLocaleString()} </span>
                            <select
                                value={this.state.selectedUnit}
                                className={css.unitOption}
                                onChange={(event) => this.toggleBalanceUnit(event.target.value)}
                            >
                                <option value="HLX">HLX</option>
                                <option value="kHLX">kHLX</option>
                                <option value="mHLX">mHLX</option>
                                <option value="gHLX">gHLX</option>
                                <option value="tHLX">tHLX</option>
                            </select>
                        </h2>
                        <hr />
                    </div>

                    <ul className={css.topRight}>
                        <li>
                            <select
                                className={css.accountSelect}
                                onChange={this.changeAccount.bind(this)}
                                value={JSON.stringify({ accountName: accountName, index: seedIndex })}
                            >
                                {accountNames.map((account, index) => {
                                    const arg = {
                                        accountName: account,
                                        index: index,
                                    };
                                    return (
                                        <option
                                            key={index}
                                            value={JSON.stringify(arg)}
                                            className={css.accountSelectOption}
                                        >
                                            ACCOUNT {index + 1}
                                        </option>
                                    );
                                })}
                                <option value="add" className={css.accountSelectOption}>
                                    Add Account
                                </option>
                            </select>
                            <hr />
                        </li>
                        <li>
                            <h4>{accountName}</h4>
                            <br />
                            <div>
                                {' '}
                                <span className={css.dot}></span>
                                <h6>CONNECTED</h6>
                            </div>
                        </li>
                    </ul>
                </div>
                <hr className={css.topBorder} />
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
    conversionRate: state.settings.conversionRate,
});

const mapDispatchToProps = {
    getAccountInfo,
    setSeedIndex,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(TopBar);
