import React, { Component } from 'react';
import logo from 'ui/images/logo.png';
import css from './wallet.scss';
import hlx from 'ui/images/hlx.png';
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  getSelectedAccountName,
  getSelectedAccountMeta,
  getAccountNamesFromState,
  selectAccountInfo,
  getBalanceForSelectedAccount
} from "selectors/accounts";
import { getSeedIndexFromState } from "selectors/global";
import { getAccountInfo } from "actions/accounts";
import SeedStore from "libs/seed";
import { accumulateBalance } from "libs/hlx/addresses";
import Loading from "ui/components/loading";
import { setSeedIndex } from "actions/wallet";

import {
  formatValue,
  formatUnit,
  formatHlx,
  getCurrencyValue
} from "libs/hlx/utils";
import {IntlProvider,FormattedNumber} from 'react-intl';

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
      push: PropTypes.func.isRequired
    }).isRequired,
  };
  state = {
    amount:0.022
  }
  changeAccount(e) {
    if (e.target.value == "add") {
      this.props.history.push("/onboarding/seed-intro");
    }
    else {
      const selection = JSON.parse(e.target.value);
      this.updateAccount(selection.accountName, selection.index);
    }
  }

  updateAccount = async (accountName, index) => {
    const {
      password,
      accountMeta,
      history,
      accounts,
      getAccountInfo,
      setSeedIndex
    } = this.props;
    await setSeedIndex(index);
    const seedStore = await new SeedStore[accountMeta.type](
      password,
      accountName,
      accountMeta
    );
    getAccountInfo(seedStore, accountName, Electron.notify);
    history.push("/wallet/");
  };

  componentDidUpdate(){
  }

  render() {
    const { accountInfo, accountNames, accountName, seedIndex, currency, history } = this.props;
    const {amount} = this.state;
    let balance = accumulateBalance(
      accountInfo.addressData.map(addressdata => addressdata.balance)
    );
    return (
      <div>
        <div className={css.top}>
          <img src={logo} />
          <div className={css.topIn}>
            <h4 style={{ marginBottom: '-13px' }}>BALANCE</h4>
            <br />
            <div> <span className={css.dot}></span><h6 style={{ opacity: '0.3' }}>
            <IntlProvider locale='en'>
              <FormattedNumber
                value={amount}
                style="currency"
                currency={currency} />
                </IntlProvider>/mHLX</h6></div>
          </div>
          <div className={css.topBal}>
            <img src={hlx} />
            <h2>{formatHlx(balance, true, true)}</h2>
            <hr />
          </div>

          <ul className={css.topRight}>
            <li>
              <select
                className={css.accountSelect}
                onChange={this.changeAccount.bind(this)}
                value={JSON.stringify({accountName:accountName,index:seedIndex})}
              >

                {accountNames.map((account, index) => {
                  const arg = {
                    accountName: account,
                    index: index
                  }
                  return <option key={index} value={JSON.stringify(arg)} className={css.accountSelectOption}>ACCOUNT {index + 1}</option>
                })}
                <option value="add" className={css.accountSelectOption}>Add Account</option>
              </select>
              <hr />
            </li>
            <li>
              <h4>{accountName}</h4>
              <br />
              <div> <span className={css.dot}></span><h6>CONNECTED</h6></div>
            </li>
          </ul>

        </div>
        <hr className={css.topBorder} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  accounts: state.accounts,
  accountNames: getAccountNamesFromState(state),
  accountMeta: getSelectedAccountMeta(state),
  password: state.wallet.password,
  accountName: getSelectedAccountName(state),
  accountInfo: selectAccountInfo(state),
  seedIndex: getSeedIndexFromState(state),
  balance: getBalanceForSelectedAccount(state),
  currency: state.settings.currency
});

const mapDispatchToProps = {
  getAccountInfo,
  setSeedIndex
};

export default connect(mapStateToProps, mapDispatchToProps)(TopBar)