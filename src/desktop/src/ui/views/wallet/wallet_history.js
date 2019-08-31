import React from "react";
import { connect } from "react-redux";
import css from "./wallet.scss";
import classNames from "classnames";
import Top from "../../components/topbar";
import List from "ui/components/list";
import {
  getSelectedAccountName,
  getSelectedAccountMeta
} from "selectors/accounts";
import { getAccountInfo } from "actions/accounts";
import SeedStore from "libs/seed";

import PropTypes from "prop-types";
import reload from "ui/images/refresh.svg";
import { withI18n } from "react-i18next";
import Button from "ui/components/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
/**
 * Wallet History component
 */
class WalletHistory extends React.PureComponent {
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

  updateAccount = async () => {
    const { password, accountName, accountMeta } = this.props;

    const seedStore = await new SeedStore[accountMeta.type](
      password,
      accountName,
      accountMeta
    );

    this.props.getAccountInfo(
      seedStore,
      accountName,
      Electron.notify,
      true // Sync with quorum enabled
    );
  };
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
                  <h3 className={css.heading}>TRANSACTION HISTORY</h3>
                <div className={css.search}><input type="text" className={css.search_text} placeholder="Type text here..." /></div>
                <div className={css.search}><select className={css.sort_text} placeholder="Sort by">
                  <option value="all">All</option>
                  <option value="sent">Sent</option>
                  <option value="receive">Receive</option>
                  <option value="pending">Pending</option>
                  </select></div>
            <div className={css.column_sent}>
                    <div className={css.column_cnt}>
                        <h4 className={css.sent_heading}>SENT</h4>
                        <h6>OKT.09.2019 - 02:35 PM</h6>
                        <p className={css.from}>From:Account 1 -Marcel Privat</p>
                    </div>
                    <div className={css.column_cnt}>
                        <p className={css.note}>Add Note:Order#21767</p>
                    </div>
                    <div className={css.column_cnt}>
                        <h4 className={css.sender_heading}>Receiver</h4>
                        <p className={css.fromhash}>qv1hbbald95BbnnzrrsbdlsinqAkVcte43</p>
                    </div>
                    <div className={css.column_cnt}>
                        <span className={css.sent}>-14,07 mHLX</span>
                    </div>
                </div>

                <div className={css.column_receive}>
                    <div className={css.column_cnt}>
                        <h4 className={css.sent_heading}>RECEIVED</h4>
                        <h6>OKT.09.2019 - 02:35 PM</h6>
                        <p className={css.from}>From:Account 1 -Marcel Privat</p>
                    </div>
                    <div className={css.column_cnt}>
                        <p className={css.note}>Add Note:Order#21767</p>
                    </div>
                    <div className={css.column_cnt}>
                        <h4 className={css.sender_heading}>Receiver</h4>
                        <p className={css.fromhash}>qv1hbbald95BbnnzrrsbdlsinqAkVcte43</p>
                    </div>
                    <div className={css.column_cnt}>
                        <span className={css.receive}>-14,07 mHLX</span>
                    </div>
                </div>

                <div className={css.column_sent}>
                    <div className={css.column_cnt}>
                        <h4 className={css.sent_heading}>SENT</h4>
                        <h6>OKT.09.2019 - 02:35 PM</h6>
                        <p className={css.from}>From:Account 1 -Marcel Privat</p>
                    </div>
                    <div className={css.column_cnt}>
                        <p className={css.note}>Add Note:Order#21767</p>
                    </div>
                    <div className={css.column_cnt}>
                        <h4 className={css.sender_heading}>Receiver</h4>
                        <p className={css.fromhash}>qv1hbbald95BbnnzrrsbdlsinqAkVcte43</p>
                    </div>
                    <div className={css.column_cnt}>
                        <span className={css.sent}>-14,07 mHLX</span>
                    </div>
                </div>

                <div className={css.column_receive}>
                    <div className={css.column_cnt}>
                        <h4 className={css.sent_heading}>RECEIVED</h4>
                        <h6>OKT.09.2019 - 02:35 PM</h6>
                        <p className={css.from}>From:Account 1 -Marcel Privat</p>
                    </div>
                    <div className={css.column_cnt}>
                        <p className={css.note}>Add Note:Order#21767</p>
                    </div>
                    <div className={css.column_cnt}>
                        <h4 className={css.sender_heading}>Receiver</h4>
                        <p className={css.fromhash}>qv1hbbald95BbnnzrrsbdlsinqAkVcte43</p>
                    </div>
                    <div className={css.column_cnt}>
                        <span className={css.receive}>-14,07 mHLX</span>
                    </div>
                </div>

                <div className={css.column_sent}>
                    <div className={css.column_cnt}>
                        <h4 className={css.sent_heading}>SENT</h4>
                        <h6>OKT.09.2019 - 02:35 PM</h6>
                        <p className={css.from}>From:Account 1 -Marcel Privat</p>
                    </div>
                    <div className={css.column_cnt}>
                        <p className={css.note}>Add Note:Order#21767</p>
                    </div>
                    <div className={css.column_cnt}>
                        <h4 className={css.sender_heading}>Receiver</h4>
                        <p className={css.fromhash}>qv1hbbald95BbnnzrrsbdlsinqAkVcte43</p>
                    </div>
                    <div className={css.column_cnt}>
                        <span className={css.sent}>-14,07 mHLX</span>
                    </div>
                </div>
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
)(withI18n()(WalletHistory));
