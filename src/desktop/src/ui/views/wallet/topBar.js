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
import SeedStore from 'libs/seed';
import { setSeedIndex } from 'actions/wallet';
import { updateHelixUnit } from 'actions/settings';
import { unitConverter } from 'libs/hlx/utils';
import { IntlProvider, FormattedNumber } from 'react-intl';
import axios from 'axios';
import { CURRENCT_URL, BTC_USDT_TICKER, mHLX_BTC_TICKER } from '../../../constants';

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
        formattedBalance: 0,
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
        const { balance } = this.props;
        this.props.updateHelixUnit(selectedUnit);
        let formattedBalance = unitConverter(balance, selectedUnit);
        this.setState({
            formattedBalance,
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
        getAccountInfo(seedStore, accountName, Electron.notify).then(() => this.updateBalance());
        history.push('/wallet/');
    };

    /**
     * Updates the balance of selected account in topbar
     */

    updateBalance = async () => {
        const { balance } = this.props;
        let unit = 'HLX',
            formattedBalance = balance;
        if (balance > 1000) {
            unit = this.props.helixUnit;
            formattedBalance = unitConverter(balance, unit);
        }

        this.setState({
            formattedBalance,
            selectedUnit: unit,
        });
    };

    componentDidMount() {
        const { currency } = this.props;
        this.updateBalance();
        axios.get(CURRENCT_URL).then(async (resp) => {
            let BTC_USDT = await axios.get(BTC_USDT_TICKER);
            let mHLX_BTC = await axios.get(mHLX_BTC_TICKER);
            this.setState({
                amount: resp.data.rates[currency] * BTC_USDT.data.current_price * mHLX_BTC.data.current_price,
            });
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.balance !== prevProps.balance) {
            this.updateBalance();
        }
    }

    render() {
        const { accountNames, accountName, seedIndex } = this.props;
        let { amount, formattedBalance } = this.state;

        return (
            <div>
                <div className={css.top}>
                    <img src={logo} alt=" " />
                    <div className={css.topIn}>
                        <h4 className={css.topBar_h4}>BALANCE</h4>
                        <br />
                        <div>
                            <span className={css.dot}></span>
                            <h6 className={css.link_opacity}>
                                <IntlProvider locale="en">
                                    <FormattedNumber
                                        value={amount}
                                        style={'currency'}
                                        currency={'USD'}
                                        minimumFractionDigits={6}
                                    />
                                </IntlProvider>
                                /mHLX
                            </h6>
                        </div>
                    </div>
                    <div className={css.topBal}>
                        <img src={hlx} alt=" " />
                        <h2>
                            <span>{formattedBalance.toLocaleString()} </span>
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
    helixUnit: state.settings.helixUnit,
});

const mapDispatchToProps = {
    getAccountInfo,
    setSeedIndex,
    updateHelixUnit,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(TopBar);
