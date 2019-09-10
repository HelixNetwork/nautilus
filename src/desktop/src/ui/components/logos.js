import React from "react";
import css from "ui/components/logos.scss";
import { withI18n } from "react-i18next";
import { connect } from "react-redux";
import fa from "./fontawesome.css";
import classNames from "classnames";
import log from "ui/images/log_icon.png";
import logo from "ui/images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Icon from "ui/components/icon";
import { faCog, faPowerOff, faTh } from "@fortawesome/free-solid-svg-icons";
class Logos extends React.PureComponent {
  render() {
    return (
      <div className={classNames(css.top_sec1)}>
        <div className={classNames(css.lg_logos)}>
          <img src={logo} alt="" />
        </div>
        {this.props.wallet.ready && (
          <React.Fragment>
          <span
            style={{ float: "right", cursor: "pointer", marginRight:'50px'}}
            onClick={() => this.props.history.push("/wallet/")}
          >
            <Icon icon="cross" size={18} />
          </span>
        </React.Fragment>
        )}
      </div>
    );
  }
}
const mapStateToProps = state => ({
  wallet: state.wallet
});


export default connect(
  mapStateToProps
)(withI18n()(Logos));
