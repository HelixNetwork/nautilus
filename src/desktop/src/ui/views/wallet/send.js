import React from "react";
import { connect } from "react-redux";
import css from "./wallet.scss";
import classNames from "classnames";
import images from "ui/images/ic1.png";
import TopBar from "./topBar";
import DashSidebar from 'ui/components/dash_sidebar';
import PropTypes from "prop-types";
import ic1 from "ui/images/svg/send.svg";
import { withI18n } from "react-i18next";
import SeedStore from "libs/seed";
import Modal from "ui/components/modal/Modal";
import { isAddress } from "@helixnetwork/validators";
import Button from "ui/components/button";
import Lottie from "react-lottie";
import axios from 'axios';
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
import ProgressBar from 'ui/components/progress';
import { reset as resetProgress, startTrackingProgress } from 'actions/progress';
import {MAX_NOTE_LENGTH,MAX_HLX_LENGTH} from '../../../constants';
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
  };
  state = {
    address: "",
    amount: "",
    hlxamount: "",
    txamount:"",
    message: "Test",
    openModal: false,
    selectedCurrency:'EUR',
    selectedHlx:'mHLX',
    conversionRate:1,
    progress:''
  };

  validateInputs = e => {
    e.preventDefault();
    this.setState({
      openModal: validateInputs()
    });
    
  };

  confirmTransfer = async () => {
    const { password, accountName, accountMeta, sendTransfer } = this.props;
    const { address, txamount } = this.state;
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
      parseInt(txamount || "0") === 0
        ? this.state.message
        : "";

    this.setState({
      message: message
    });

    this.sendTransfer(seedStore, address, parseInt(txamount) || 0, message);
  };

  sendTransfer = (seedStore, address, value, message) => {
    const { ui, accountName, generateAlert, progress, t } = this.props;

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
    this.setProgressSteps(value === 0);
    

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

  setProgressSteps(isZeroValueTransaction) {
    const { t } = this.props;

    const steps = isZeroValueTransaction
      ? [
          t("progressSteps:preparingTransfers"),
          t("progressSteps:gettingTransactionsToApprove"),
          t("progressSteps:proofOfWork"),
          t("progressSteps:broadcasting")
        ]
      : [
          t("progressSteps:validatingReceiveAddress"),
          t("progressSteps:syncingAccount"),
          t("progressSteps:preparingInputs"),
          t("progressSteps:preparingTransfers"),
          t("progressSteps:gettingTransactionsToApprove"),
          t("progressSteps:proofOfWork"),
          t("progressSteps:validatingTransactionAddresses"),
          t("progressSteps:broadcasting")
        ];

    this.props.startTrackingProgress(steps);
  }

  validateInputs = () => {
    const { generateAlert, balance, t } = this.props;
    const { address, txamount,hlxamount, message } = this.state;
    
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
    if (parseFloat(txamount) > balance) {
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
    let {txamount,selectedHlx} = this.state;
    let hlxamount = e.target.value;
    let base = 0;
    if(selectedHlx=="HLX"){
      base=1;
      
    }
    else if(selectedHlx=="kHLX"){
      base=1000;
    }
    else if(selectedHlx=="mHLX"){
      base=1000000;
    }
    else if(selectedHlx=="gHLX")
    {
      base=1000000000;
    }
    else if(e.target.value=="tHLX")
    {
      base=1000000000000;
    }
    txamount = hlxamount * base;
    let amount = txamount / this.state.conversionRate
    this.setState({
      hlxamount: hlxamount,
      amount: amount,
      txamount:txamount
    });
  }

  amountInput(e) {
    let hlx = this.state.conversionRate * e.target.value;
    this.setState({
      amount: e.target.value,
      hlxamount:hlx
    });
  }

  currencyChange(e){
    let selectedCurrency = e.target.value
    const url = "https://trinity-exchange-rates.herokuapp.com/api/latest?base=USD";
    axios.get(url)
    .then(resp=>{
      this.setState({
        conversionRate: resp.data.rates[selectedCurrency]
      });
      if(this.state.amount!==""){
        this.setState({
          hlxamount:this.state.amount * resp.data.rates[selectedCurrency]
        })
      }
    })
    
    this.setState({
      selectedCurrency:selectedCurrency
    })
  }

  hlxChange(e){
    let {txamount,hlxamount} = this.state
    let base = 0;
    if(e.target.value=="HLX"){
      base=1;
    }
    else if(e.target.value=="kHLX"){
      base=1000;
    }
    else if(e.target.value=="mHLX"){
      base=1000000;
    }
    else if(e.target.value=="gHLX")
    {
      base=1000000000;
    }
    else if(e.target.value=="tHLX")
    {
      base=1000000000000;
    }
    
   if(hlxamount!==""){
     txamount=hlxamount*base;
   }
   else{
     txamount=0;
   }
    this.setState({
      selectedHlx:e.target.value,
      txamount:txamount
    })
  }

  msgChange(e){
    this.setState({
      message:e.target.value
    })
  }

  componentDidMount(){
    const url = "https://trinity-exchange-rates.herokuapp.com/api/latest?base=USD";
    axios.get(url)
    .then(resp=>{
      this.setState({
        conversionRate: resp.data.rates['EUR']
      });
    })
  }

  

  render() {
    const { accountMeta, balance, loop, currencies, isSending, progress, t } = this.props;
    const { openModal, address, amount, hlxamount, selectedCurrency, selectedHlx} = this.state;
    const defaultOptions = {
      loop: loop,
      autoplay: true,
      animationData: animationData.default,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
      }
    };
    
    const progressTitle =
        progress.activeStepIndex !== progress.activeSteps.length
          ? progress.activeSteps[progress.activeStepIndex]
          : `${t("send:totalTime")} ${Math.round(
              progress.timeTakenByEachStep.reduce(
                (total, time) => total + Number(time),
                0
              )
            )}s`;
    this.setState({
      progress: Math.round(
        (progress.activeStepIndex / progress.activeSteps.length) * 100
      ),
      title: progressTitle
    });
    return (
      <div>
        <section className={css.home}>
          {/* <Top bal={"block"} main={"block"} user={"block"} history={history} /> */}
          {/* <TopBar/>
          <DashSidebar
          history={history}
          /> */}
          <div className={classNames(css.pg1_foo3)}>
            <div className="container">
              <div className="row">
                <div className="col-lg-9">
                  <div className={classNames(css.foo_bxx1)} style={{paddingBottom:'100px'}}>
                    <h5 style={{marginLeft: '494px'}}>
                      {t("send:sendCoins")}
                      {/* <span>.</span> */}
                    </h5>
                    <h6 style={{opacity: '0.3',marginLeft: '275px'}}>{t("send:irrevocableTransactionWarning")}</h6>
                    <form style={{marginLeft: '48px'}}>
                      {/* <div className={classNames(css.bbx_box1, css.tr_box)}>
                                            <span className={classNames(css.er1)}>EUR</span>
                                            <span className={classNames(css.er2)}>26,74</span>
                                            <input type="text" classNames={css.er1} placeholder="EUR"></input>
                                        </div> */}
                      <div>
                      <select
                      className={css.currencyBox}
                      onChange={this.currencyChange.bind(this)}
                      value={selectedCurrency}
                      >
                        {currencies
                        .slice()
                        .sort()
                        .map(item => {
                          return <option value={item} key={item} style={{backgroundColor:'transparent'}}>{item}</option>
                        })}
                      </select>
                      <input
                        type="number"
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
                      defaultValue={"mHLX"}
                      className={css.currencyBox}
                      onChange={this.hlxChange.bind(this)}
                      >
                        <option value="HLX">HLX</option>
                        <option value="kHLX">kHLX</option>
                        <option value="mHLX">mHLX</option>
                        <option value="gHLX">gHLX</option>
                      </select>
                      <input
                        value={hlxamount}
                        type="number"
                        className={classNames(css.bbx_box1, css.tr_box)}
                        style={{
                          marginLeft: "50px",
                          color: "white"
                        }}
                        maxLength={MAX_HLX_LENGTH}
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
                        left: '55px'
                      }}
                      >
                      {t("send:note")}
                      </span>
                      <input className={css.msgBox}
                        style={{
                          marginLeft: "50px",
                          color: "white"
                        }}
                        placeholder="Enter note"
                        maxLength={MAX_NOTE_LENGTH}
                        onChange={this.msgChange.bind(this)}/>
                      </div>
                      <input
                        id="recipient-address"
                        type="text"
                        name="name"
                        className={css.reci_text}
                        value={address}
                        onChange={this.addressInput.bind(this)}
                        placeholder="RECIPIENT ADDRESS"
                      />
                      <br />
                      <a
                        className={css.send_bts}
                        onClick={this.validateInputs.bind(this)}
                      >
                        <img src={ic1} alt="" />
                      
                      <h2 className={classNames(css.send_bts_h2)}>
                      {t("send:send")}
                      </h2>
                      
                      </a>

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
                            <h3>{t("send:continuetransaction")}</h3>
                            <br />
                            <Checksum address={address} />
                          </div>
                          <br />
                          <Button
                            variant="danger"
                            onClick={() => this.setState({ openModal: false })}
                          >
                           {t("global:cancel")}
                          </Button>
                          &nbsp;&nbsp;&nbsp;&nbsp;
                          <Button
                            variant="success"
                            onClick={this.confirmTransfer.bind(this)}
                          >
                           {t("global:confirm")}
                          </Button>
                        </div>
                      </Modal>
                    )}
                  </div>
                  {isSending && (
                    <Modal isOpen={isSending} onClose={() => this.setState({ openModal: false })}>
                      <ProgressBar type={"send"} progress={this.state.progress} title={progressTitle}/>
                    </Modal>
                  )}
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
  conversionRate:state.settings.conversionRate,
  isSending:state.ui.isSendingTransfer,
  progress: state.progress,
});

const mapDispatchToProps = {
  generateAlert,
  makeTransaction,
  startTrackingProgress
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withI18n()(Send));
