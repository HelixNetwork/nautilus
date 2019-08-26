import React from "react";
import css from "ui/views/wallet/wallet.scss";
import classNames from "classnames";
import PropTypes from "prop-types";
import { withI18n } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faChartLine,
  faHistory,
 
} from "@fortawesome/free-solid-svg-icons";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";

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
        
      <a  className={classNames(css.img_sr1)}>
           MENU  
          </a>
          <li className={active == "send" ? css.active : ""}>
          <a onClick={() => this.props.history.push("/wallet/send")} className={classNames(css.img_sr1)}>
          <FontAwesomeIcon icon={faPaperPlane} size="3x" />  {t("home:send")} 
          </a>
          </li>
       
     
       
          <li className={active == "recieve" ? css.active : ""}>  
          <a onClick={() => this.props.history.push("/wallet/receive")} className={classNames(css.img_sr1)}>
          <FontAwesomeIcon icon={faDownload} size="3x" />  {t("home:receive")}  
          </a>
          </li>
       
          <li className={active == "chart" ? css.active : ""}>  
          <a onClick={() => this.props.history.push("/wallet/chart")}  className={classNames(css.img_sr1)}>
          <FontAwesomeIcon icon={faChartLine} size="3x" /> {t("home:chart")} 
          </a>
   
          </li>
          <li className={active == "history" ? css.active : ""}>  
          <a
            onClick={() => this.props.history.push("/wallet/history")}  className={classNames(css.img_sr1)}
          >
           <FontAwesomeIcon icon={faHistory} size="3x" /> {t("home:history")} 
          </a>
          </li>
          <li className={active == "settings" ? css.active : ""}>  
          <a
            onClick={() => this.props.history.push("/settings/editname")}  className={classNames(css.img_sr1)}
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
