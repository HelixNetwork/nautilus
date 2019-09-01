import React from "react";
import PropTypes from "prop-types";
import { withI18n } from "react-i18next";
import { withRouter, Switch, Route } from "react-router-dom";
import { connect } from "react-redux";
import classNames from "classnames";
import Dashboard from "ui/views/wallet/dashboard";
import img from "ui/images/svg/send.svg";
import img1 from "ui/images/svg/receive.svg";
import img2 from "ui/images/svg/chart.svg";
import img3 from "ui/images/svg/history.svg";
import css from "./wallet.scss";
import TopBar from "./topBar";
import Button from "../../components/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faChartLine,
  faHistory,
  faExchange
} from "@fortawesome/free-solid-svg-icons";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
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
import Send from "ui/views/wallet/send";
import Receive from "ui/views/wallet/receive";
import Chart from "ui/views/wallet/chart";
import WalletHistory from "ui/views/wallet/wallet_history";
import {
  formatValue,
  formatUnit,
  formatHlx,
  getCurrencyValue
} from "libs/hlx/utils";
import DashSidebar from "ui/components/dash_sidebar";
import axios from "axios";
/**
 * Wallet functionallity router wrapper component
 */
class Wallet extends React.PureComponent {
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

  updateAccount = async (accountName, index) => {
    const {
      password,
      getAccountInfo,
      accountMeta,
      history,
      accounts
    } = this.props;
    await this.props.setSeedIndex(index);
    const seedStore = await new SeedStore[accountMeta.type](
      password,
      accountName,
      accountMeta
    );
    getAccountInfo(seedStore, accountName, Electron.notify);
    history.push("/wallet/");
  };
  state = {
    currencyValue: 0
  };
  componentDidMount() {
    console.log(this.props.seedIndex);
    const url =
      "https://trinity-exchange-rates.herokuapp.com/api/latest?base=USD";
    axios.get(url).then(resp => {
      this.setState({
        currencyValue: this.props.balance * resp.data.rates[this.props.currency]
      });
    });
  }

  render() {
    let styles = {
      color: "#E9B339",
      fontSize: "50px"
    };

    const {
      location,
      history,
      accountNames,
      accountName,
      accountInfo,
      currency,
      accountMeta,
      t,
      active
    } = this.props;
    let balance = accumulateBalance(
      accountInfo.addressData.map(addressdata => addressdata.balance)
    );
    console.log("dndfnb", location.pathname)
    const currentKey = location.pathname.split("/")[2] || "/";
    console.log("currentttt",currentKey);
    if(currentKey =="/"){
      return (
        <div>
          <TopBar
          history={history}
          />
       
                <DashSidebar disp={"none"} history={history} active={currentKey} />
             
                <Switch>
      <Route path="/wallet/" component={Send} />
        <Route path="/wallet/send" component={Send} />
        <Route exact path="/wallet/receive" component={Receive} />
        <Route path="/wallet/chart" component={Chart} />
        <Route path="/wallet/history" component={WalletHistory} />
      </Switch>
             

        </div>
      );
    }
    return(
      <div>
      <TopBar
      history={history}
      />
   
            <DashSidebar disp={"none"} history={history} active={currentKey} />
      <Switch>
     
        <Route path="/wallet/send" component={Send} />
        <Route exact path="/wallet/receive" component={Receive} />
        <Route path="/wallet/chart" component={Chart} />
        <Route path="/wallet/history" component={WalletHistory} />
      </Switch>
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
export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withI18n()(Wallet))
);
