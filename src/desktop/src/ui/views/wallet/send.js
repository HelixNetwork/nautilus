import React from "react";
import { connect } from "react-redux";
import css from "./wallet.scss";
import classNames from "classnames";
import images from "ui/images/ic1.png";
import TopBar from "./topBar";
import DashSidebar from 'ui/components/dash_sidebar';
import PropTypes from "prop-types";
import ic1 from "ui/images/send_bt_white.png";
import { withI18n } from "react-i18next";
import SeedStore from "libs/seed";
import Modal from "ui/components/modal/Modal";
import { isAddress } from "@helixnetwork/validators";
import Button from "ui/components/button";
import Lottie from "react-lottie";
import * as animationData from "animations/wallet-loading.json";
import {
  getSelectedAccountName,
  getSelectedAccountMeta,
  getAccountNamesFromState,
  selectAccountInfo,
  getBalanceForSelectedAccount
} from "selectors/accounts";
import { generateAlert } from "actions/alerts";
import Checksum from "ui/components/checksum";
import { makeTransaction } from "actions/transfers";
import { ADDRESS_LENGTH, isValidAddress, isValidMessage } from "libs/hlx/utils";
class Send extends React.PureComponent {
  static propTypes = {
    /** @ignore */
    balance: PropTypes.number.isRequired,
    /** @ignore */
    // settings: PropTypes.shape({
    //     conversionRate: PropTypes.number.isRequired,
    //     currency: PropTypes.string.isRequired,
    //     usdPrice: PropTypes.number.isRequired,
    // }),
    makeTransaction: PropTypes.func.isRequired,
    /** @ignore */
    t: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired,
  };
  state = {
    address: "",
    amount: "",
    hlxamount: "",
    message: "Test",
    openModal: false,
    selectedCurrency:'EUR',
    selectedHlx:'mHLX',
  };

  validateInputs = e => {
    e.preventDefault();

    this.setState({
      openModal: validateInputs()
    });
  };

  confirmTransfer = async () => {
    const { password, accountName, accountMeta, sendTransfer } = this.props;
    const { address, hlxamount } = this.state;
    this.setState({
      openModal: false
    });

    const seedStore = await new SeedStore[accountMeta.type](
      password,
      accountName,
      accountMeta
    );

    const message =
      SeedStore[accountMeta.type].isMessageAvailable ||
      parseInt(hlxamount || "0") === 0
        ? this.state.message
        : "";

    this.setState({
      message: message
    });

    this.sendTransfer(seedStore, address, parseInt(hlxamount) || 0, message);
  };

  sendTransfer = (seedStore, address, value, message) => {
    const { ui, accountName, generateAlert, t } = this.props;

    if (ui.isSyncing) {
      generateAlert(
        "error",
        t("global:syncInProgress"),
        t("global:syncInProgressExplanation")
      );
      return;
    }

    if (ui.isTransitioning) {
      generateAlert(
        "error",
        t("snapshotTransitionInProgress"),
        t("snapshotTransitionInProgressExplanation")
      );
      return;
    }

    this.props.makeTransaction(
      seedStore,
      address,
      value,
      message,
      accountName,
      null,
      Electron.genFn
    );
  };

  validateInputs = () => {
    const { generateAlert, balance, t } = this.props;
    const { address, hlxamount, message } = this.state;

    // Validate address length
    if (address.length !== ADDRESS_LENGTH) {
      generateAlert(
        "error",
        t("send:invalidAddress"),
        t("send:invalidAddressExplanation1", { maxLength: ADDRESS_LENGTH })
      );
      return false;
    }

    // Validate address checksum
    if (!isValidAddress(address)) {
      generateAlert(
        "error",
        t("send:invalidAddress"),
        t("send:invalidAddressExplanation3")
      );
      return false;
    }

    // Validate enought balance
    if (parseFloat(hlxamount) > balance) {
      generateAlert(
        "error",
        t("send:notEnoughFunds"),
        t("send:notEnoughFundsExplanation")
      );
      return false;
    }

    // Validate whether message only contains ASCII letters
    // as anything else is lost up on conversion to txBytes
    if (!isValidMessage(message)) {
      generateAlert(
        "error",
        t("send:invalidMessage"),
        t("send:invalidMessageExplanation")
      );
      return false;
    }

    this.setState({
      openModal: true
    });
  };

  addressInput(e) {
    this.setState({
      address: e.target.value
    });
  }

  hlxInput(e) {
    this.setState({
      hlxamount: e.target.value
    });
  }

  amountInput(e) {
    this.setState({
      amount: e.target.value
    });
  }

  currencyChange(e){
    this.setState({
      selectedCurrency:e.target.value
    })
  }

  hlxChange(e){
    this.setState({
      selectedHlx:e.target.value
    })
  }
  render() {
    const { accountMeta, balance, loop, history,currencies, t } = this.props;
    const { openModal, address, amount, hlxamount, selectedCurrency, selectedHlx} = this.state;
    const defaultOptions = {
      loop: loop,
      autoplay: true,
      animationData: animationData.default,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
      }
    };

    return (
      <div>
        <section className={css.home}>
          {/* <Top bal={"block"} main={"block"} user={"block"} history={history} /> */}
          <TopBar/>
          <DashSidebar
          history={history}
          />
          <div className={classNames(css.pg1_foo3)}>
            <div className="container">
              <div className="row">
                <div className="col-lg-9">
                  <div className={classNames(css.foo_bxx1)}>
                    <h5>
                      {t("send:sendCoins")}
                      {/* <span>.</span> */}
                    </h5>
                    <h6>{t("send:irrevocableTransactionWarning")}</h6>
                    <form>
                      {/* <div className={classNames(css.bbx_box1, css.tr_box)}>
                                            <span className={classNames(css.er1)}>EUR</span>
                                            <span className={classNames(css.er2)}>26,74</span>
                                            <input type="text" classNames={css.er1} placeholder="EUR"></input>
                                        </div> */}
                      <div>
                      <select
                      className={css.currencyBox}
                      onChange={this.currencyChange.bind(this)}
                      >
                        {currencies
                        .slice()
                        .sort()
                        .map(item => {
                          return <option value={item} key={item} style={{backgroundColor:'transparent'}}>{item}</option>
                        })}
                      </select>
                      <input
                        type="text"
                        value={amount}
                        className={classNames(css.bbx_box1, css.tr_box)}
                        style={{
                          marginLeft: "50px",
                          color: "white"
                        }}
                        placeholder={selectedCurrency}
                        onChange={this.amountInput.bind(this)}
                      ></input>
                      </div>
                      <h1 className={classNames(css.eq)}>=</h1>
                      {/* <div className={classNames(css.bbx_box1)}>
                                            <span className={classNames(css.er1)}>mHLX</span>
                                            <span className={classNames(css.er2)}>1337,00</span>
                                        </div> */}
                      <div>
                      <select
                      className={css.currencyBox}
                      >
                        <option>mHLX</option>
                        <option>HLX</option>
                        <option>Kh</option>
                      </select>
                      <input
                        value={hlxamount}
                        type="text"
                        className={classNames(css.bbx_box1, css.tr_box)}
                        style={{
                          marginLeft: "50px",
                          color: "white"
                        }}
                        placeholder={selectedHlx}
                        onChange={this.hlxInput.bind(this)}
                      ></input>
                      </div>
                      {/* <p>{t("send:enterReceiverAddress")}</p> */}

                      <div>
                      <span
                      className={css.currencyBox}
                      style={{
                        top: '355px',
                        left: '20px'
                      }}
                      >
                        NOTE
                      </span>
                      <input className={css.msgBox}
                      style={{
                        marginLeft: "50px",
                        color: "white"
                      }}
                      placeholder="Enter note"/>
                      </div>
                      <input
                        id="recipient-address"
                        type="text"
                        name="name"
                        className={css.reci_text}
                        value={address}
                        onChange={this.addressInput.bind(this)}
                        placeholder="RECEIVER ADDRESS"
                      />
                      <br />
                      <a
                        className={css.send_bts}
                        onClick={this.validateInputs.bind(this)}
                      >
                        <img src={ic1} alt="" />
                      </a>
                      <h2 className={classNames(css.send_bts_h2)}>
                        SEND
                      </h2>
                    </form>
                    {openModal && (
                      <Modal
                        isOpen={openModal}
                        onClose={() => this.setState({ openModal: false })}
                      >
                        <div style={{ marginTop: "-60px" }}>
                          <br />
                          <div className={css.transferLoading}>
                            <br />
                            <Lottie
                              options={defaultOptions}
                              eventListeners={[
                                {
                                  eventName: "complete",
                                  callback: () => {
                                    if (typeof onEnd === "function") {
                                      onEnd();
                                    }
                                  }
                                }
                              ]}
                            />
                          </div>
                          <br />
                          <div>
                            <h3>Continue transaction with</h3>
                            <br />
                            <Checksum address={address} />
                          </div>
                          <br />
                          <Button
                            variant="danger"
                            onClick={() => this.setState({ openModal: false })}
                          >
                            Cancel
                          </Button>
                          &nbsp;&nbsp;&nbsp;&nbsp;
                          <Button
                            variant="success"
                            onClick={this.confirmTransfer.bind(this)}
                          >
                            Confirm
                          </Button>
                        </div>
                      </Modal>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* <footer className={classNames(css.footer_bx)}></footer> */}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  accountName: getSelectedAccountName(state),
  accountMeta: getSelectedAccountMeta(state),
  password: state.wallet.password,
  balance: getBalanceForSelectedAccount(state),
  ui: state.ui,
  currencies: state.settings.availableCurrencies,
});

const mapDispatchToProps = {
  generateAlert,
  makeTransaction
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withI18n()(Send));
