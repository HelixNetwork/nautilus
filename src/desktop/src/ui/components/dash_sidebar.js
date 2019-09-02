import React from "react";
import css from "ui/views/wallet/wallet.scss";
import classNames from "classnames";
import PropTypes from "prop-types";
import { withI18n } from "react-i18next";
import Send from "ui/images/svg/send.svg";
import Receive from "ui/images/svg/receive.svg";
import Chart from "ui/images/svg/chart.svg";
import History from "ui/images/svg/history.svg";

import { setAccountInfoDuringSetup } from "actions/accounts";
import { connect } from "react-redux";
import { getAccountNamesFromState } from "selectors/accounts";

/**
 * Sidebar for dashboard
 */
class DashSidebar extends React.PureComponent {
  static propTypes = {
    location: PropTypes.object,
    t: PropTypes.func.isRequired,
    history: PropTypes.shape({
      
      push: PropTypes.func.isRequired
    }).isRequired,
    accounts: PropTypes.object,
    accountNames: PropTypes.array.isRequired,
    wallet: PropTypes.object
  };
  render() {
    const { t, active } = this.props;
    
    return (  
        <div className={classNames(css.sidebar)}>
      <ul className={classNames(css.acco_pg)}>
        
          <a style={{marginLeft: '30px',
          marginBottom: '20px',
          marginTop: '-20px'}}>
           MENU  
          </a>
          <li>
          <a onClick={() => this.props.history.push("/wallet/send")} className={classNames(css.img_sr1)}>
         <img src={active =='send'?Send:Receive} alt=" " className={css.sidebar_icon}/> {t("home:send")} 
          </a>
          </li>
       
     
       
          <li>  
          <a onClick={() => this.props.history.push("/wallet/receive")} className={classNames(css.img_sr1)}>
          <img src={active == "receive" ? Receive:Send} alt=" " className={css.sidebar_icon}/> {t("home:receive")}  
          </a>
          </li>
       
          <li className={active == "chart" ? css.active : ""}>  
          <a onClick={() => this.props.history.push("/wallet/chart")}  className={classNames(css.img_sr1)}>
          <img src={Chart} alt=" " className={css.sidebar_icon}/> {t("home:chart")} 
          </a>
   
          </li>
          <li className={active == "history" ? css.active : ""}>  
          <a
            onClick={() => this.props.history.push("/wallet/history")}  className={classNames(css.img_sr1)}
          >
          <img src={History} alt=" " className={css.sidebar_icon}/> {t("home:history")} 
          </a>
          </li>
          <li className={active == "settings" ? css.active : ""}>  
          <a
            onClick={() => this.props.history.push("/settings/editname")}  className={classNames(css.img_sr1)} style={{paddingTop: "50px"}}
          >
            {t("settings:settings")} 
          </a>
        </li>
        <li className={active == "settings" ? css.active : ""}>  
          <a
            onClick={() => this.props.history.push("/settings/editname")}  className={classNames(css.img_sr1)}
          >
            {t("global:support")} 
          </a>
        </li>
      </ul>
    
      </div>
    );
    }
 
  
}

const mapStateToProps = state => ({
  accounts: state.accounts.accountInfo,
  accountNames: getAccountNamesFromState(state),
  wallet: state.wallet
});

const mapDispatchToProps = {
  setAccountInfoDuringSetup
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withI18n()(DashSidebar));
