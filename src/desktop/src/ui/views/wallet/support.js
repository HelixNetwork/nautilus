import React from "react";
import { connect } from "react-redux";
import css from "./wallet.scss";
import style from "ui/global/about.scss"
import classNames from "classnames";
import Top from "../../components/topbar";
import List from "ui/components/list";
import {
  getSelectedAccountName,
  getSelectedAccountMeta
} from "selectors/accounts";
import { getAccountInfo } from "actions/accounts";
import SeedStore from "libs/seed";

import Icon from 'ui/components/icon';

import PropTypes from "prop-types";
import hlx from "ui/images/hlx.png";
import { withI18n } from "react-i18next";
import Button from "ui/components/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
/**
 * Support component
 */
class Support extends React.PureComponent {
  static propTypes = {
    location: PropTypes.object,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired,
    t: PropTypes.func.isRequired,
    getAccountInfo: PropTypes.func.isRequired,
    accountName: PropTypes.string.isRequired,
    accountMeta: PropTypes.object.isRequired,
    password: PropTypes.object.isRequired
  };
  state = {
    active: "li0"
  };
  handleActive(element) {
    this.setState({
      active: element
    });
  }

  

  render() {
    const { t, history, location } = this.props;
    const subroute = location.pathname.split("/")[3] || null;

    return (
      <div>
        <section className={css.home}>
          {/* <Top disp={"block"} history={this.props.history} /> */}
          <div className={classNames(css.pg1_foo3)}>
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className={classNames(css.foo_bxx1)}>
                  <h3 className={css.heading}>SUPPORT</h3>
              
                  <section className={style.about}>
                      <div style={{ width: "100%", marginTop: "15%"}}>
                   <img src={hlx} alt=""/>
                   </div>
                    <h1>Nautilus Wallet</h1>
                    <h2>
                       Email: <small>nautilus.hlx.ai</small>
                    </h2>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
       
      </div>
    );
  }
}

const mapStateToProps = state => ({
  accountName: getSelectedAccountName(state),
  accountMeta: getSelectedAccountMeta(state),
  password: state.wallet.password
});

const mapDispatchToProps = {
  getAccountInfo
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withI18n()(Support));
