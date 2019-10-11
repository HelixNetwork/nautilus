import React,{ useState } from "react";
import css from "ui/views/settings/settings.scss";
import classNames from "classnames";
import PropTypes from "prop-types";
import { withI18n } from "react-i18next";
import { setAccountInfoDuringSetup } from "actions/accounts";
import { connect } from "react-redux";
import { getAccountNamesFromState } from "selectors/accounts";

/**
 * Sidebar for dashboard
 */
class Sidebar extends React.PureComponent {
  static propTypes = {
    location: PropTypes.object,
    t: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired,
    accounts: PropTypes.object,
    accountNames: PropTypes.array.isRequired,
    wallet: PropTypes.object,
    // match: PropTypes.object
  };
  // state = {
  //   match: this.props.match
  //   };
  render() {
    const { t, active, wallet,accountNames} = this.props;
   
    return (
      <ul className={classNames(css.acco_pg)}>
        <p className={classNames(css.sidePara)}>{t("settings:generalSettings")}</p>
        <li className={active == "language" ? css.active : ""}>
          <a onClick={() => this.props.history.push("/settings/language")}>
            {t("settings:language")}
          </a>
        </li>
        
        <li className={active == "theme" ? css.active : ""}>
          <a onClick={() => this.props.history.push("/settings/theme")}>
            {t("settings:theme")}
          </a>
        </li>
        <li className={active == "accountsetting" ? css.active : ""}>
          <a
            onClick={() => this.props.history.push("/settings/accountsetting")}
          >
            {t("settings:advanced")}
          </a>
        </li>
    
        {wallet.ready && (
          
          <React.Fragment>
            <p className={classNames(css.sidePara1)}>{t("settings:accountSettings")}</p>
            <li className={active == "editname" ? css.active : ""}>
              <a onClick={() => this.props.history.push("/settings/editname")}>
                {t("settings:accountName")}{" "}
              </a>
            </li>
            <li className={active == "node" ? css.active : ""}>
          <a onClick={() => this.props.history.push("/settings/node")}>
            {t("global:node")}
          </a>
        </li>
            <li className={active == "viewseed" ? css.active : ""}>
              <a onClick={() => this.props.history.push("/settings/viewseed")}>
                {t("accountManagement:viewSeed")}
              </a>
            </li>
            <li className={active == "address" ? css.active : ""}>
              <a onClick={() => this.props.history.push("/settings/address")}>
                {t("accountManagement:viewAddresses")}
              </a>
            </li>
            <li className={active == "password" ? css.active : ""}>
              <a onClick={() => this.props.history.push("/settings/password")}>
                {t("settings:changePassword")}
              </a>
            </li>
            {accountNames.length > 1 && (
            <li className={active == "removeaccount" ? css.active : ""}>
              <a onClick={() => this.props.history.push("/settings/remove/:accountIndex")}>
             {t("settings:removeAccount")}
              </a>
            </li>
              )}
           
            <li className={active == "snapshot" ? css.active : ""}>
              <a onClick={() => this.props.history.push("/settings/snapshot")}>
                {t("settings:snap")}
              </a>
            </li>
          </React.Fragment>
        )}
     
      </ul>
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
)(withI18n()(Sidebar));
