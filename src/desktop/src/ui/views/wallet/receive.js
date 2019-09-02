import React from "react";
import { connect } from "react-redux";
import css from "./wallet.scss";
import classNames from "classnames";
import Top from "ui/components/topbar";
import Clipboard from "ui/components/clipboard";
import Button from "ui/components/button";
import Icon from "ui/components/icon";
import PropTypes from "prop-types";
import reload from "ui/images/refresh.svg";
import { withI18n } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fasync, faDownload } from "@fortawesome/free-solid-svg-icons";

import {
  selectLatestAddressFromAccountFactory,
  selectAccountInfo,
  getSelectedAccountName,
  getSelectedAccountMeta
} from "selectors/accounts";

import { generateAlert } from "actions/alerts";
import {
  generateNewAddress,
  addressValidationRequest,
  addressValidationSuccess
} from "actions/wallet";
import QR from 'ui/components/qr';
import SeedStore from "libs/seed";
import { randomTxBytes } from "libs/crypto";
import Errors from "libs/errors";
import { indexToChar } from "libs/hlx/converter";
import { getLatestAddressObject } from "libs/hlx/addresses";
import { ADDRESS_LENGTH } from "libs/hlx/utils";
import Address from "ui/components/address";
import Scrollbar from 'ui/components/scrollbar';
/**
 *
 */
class Receive extends React.PureComponent {
  static propTypes = {
    location: PropTypes.object,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired,
    t: PropTypes.func.isRequired,
    /** @ignore */
    addressValidationRequest: PropTypes.func.isRequired,
    /** @ignore */
    addressValidationSuccess: PropTypes.func.isRequired,
    /** @ignore */
    isValidatingAddress: PropTypes.bool.isRequired,
    /** @ignore */
    account: PropTypes.object.isRequired,
    /** @ignore */
    accountName: PropTypes.string.isRequired,
    /** @ignore */
    accountMeta: PropTypes.object.isRequired,
    /** @ignore */
    receiveAddress: PropTypes.string.isRequired,
    /** @ignore */
    password: PropTypes.object,
    /** @ignore */
    isSyncing: PropTypes.bool.isRequired,
    /** @ignore */
    hadErrorGeneratingNewAddress: PropTypes.bool.isRequired,
    /** @ignore */
    isTransitioning: PropTypes.bool.isRequired,
    /** @ignore */
    generateNewAddress: PropTypes.func.isRequired,
    /** @ignore */
    isGeneratingReceiveAddress: PropTypes.bool.isRequired,
    /** @ignore */
    generateAlert: PropTypes.func.isRequired
  };

  state = {
    message: "",
    scramble: new Array(ADDRESS_LENGTH).fill(0),
    hasSyncedAddress: false,
    spentstatus:""
  };

  componentWillReceiveProps(nextProps) {
    if (
      this.props.isGeneratingReceiveAddress &&
      !nextProps.isGeneratingReceiveAddress
    ) {
      this.frame = 0;

      this.setState({
        scramble: randomTxBytes(ADDRESS_LENGTH),
        hasSyncedAddress: true
      });

      this.unscramble();

      if (!this.props.isValidatingAddress) {
        this.validateAdress();
      }
    }
  }

  componentWillUnmount() {
    this.frame = -1;
  }

  onGeneratePress = async () => {
    const {
      password,
      accountName,
      accountMeta,
      account,
      isSyncing,
      isTransitioning,
      generateAlert,
      t
    } = this.props;

    if (isSyncing || isTransitioning) {
      return generateAlert(
        "error",
        t("global:pleaseWait"),
        t("global:pleaseWaitExplanation"),
        1000
      );
    }

    this.setState({
      hasSyncedAddress: false
    });

    const seedStore = await new SeedStore[accountMeta.type](
      password,
      accountName,
      accountMeta
    );
    console.log('seedStroe', seedStore);
    this.props.generateNewAddress(
      seedStore,
      accountName,
      account,
      Electron.genFn
    );
  };

  validateAdress = async () => {
    const {
      password,
      accountName,
      accountMeta,
      account,
      history,
      generateAlert,
      t,
      
    } = this.props;
    const seedStore = await new SeedStore[accountMeta.type](
      password,
      accountName,
      accountMeta
    );

    try {
      if (accountMeta.type === "ledger") {
        generateAlert(
          "info",
          t("ledger:checkAddress"),
          t("ledger:checkAddressExplanation"),
          2000
        );
      }
      this.props.addressValidationRequest();
      const { index } = getLatestAddressObject(account.addressData);
      await seedStore.validateAddress(index);
      this.props.addressValidationSuccess();
    } catch (err) {
      this.props.addressValidationSuccess();
      history.push("/wallet/");
      if (
        typeof err.message === "string" &&
        err.message === Errors.LEDGER_INVALID_INDEX
      ) {
        generateAlert(
          "error",
          t("ledger:ledgerIncorrectIndex"),
          t("ledger:ledgerIncorrectIndexExplanation"),
          2000
        );
      }
    }
  };

  unscramble() {
    const { scramble } = this.state;

    if (this.frame < 0) {
      return;
    }

    const scrambleNew = [];
    let sum = -1;

    if (this.frame > 3) {
      sum = 0;

      for (let i = 0; i < scramble.length; i++) {
        sum += scramble[i];
        scrambleNew.push(Math.max(0, scramble[i] - 15));
      }

      this.setState({
        scramble: scrambleNew
      });

      this.frame = 0;
    }

    this.frame++;

    if (sum !== 0) {
      requestAnimationFrame(this.unscramble.bind(this));
    }
  }

  showReady(){
    const {accountInfo} = this.props;

  }

  render() {
    const {
      t,
      receiveAddress,
      isGeneratingReceiveAddress,
      hadErrorGeneratingNewAddress,
      accountInfo
    } = this.props;
    const { message, scramble, hasSyncedAddress,spentstatus } = this.state;
    let addresses=[];
    accountInfo.addressData.map(value=>{
      const data={
        address:value.address,
        spent:value.spent.local
      }
      addresses.push(data)
    });
    return (
      <div>
        
        <section className={css.home}>
         
          <div className={classNames(css.pg1_foo3)}>
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className={classNames(css.foo_bxx1)}>
                    <h3 style={{fontSize:'16px',marginLeft:'252px',marginTop:'-5vw'}}>
                      {t("receive:receiveCoins")}
                      <span>.</span>
                    </h3>
                    <h3 style={{fontSize:'14px', marginLeft:'172px',marginTop:'-3vw'}}>{t("receive:irrevocableTransactionWarning")}</h3><br/>
                    <h3 style={{fontSize:'14px', marginLeft:'200px',marginTop:'-5vw'}}>{t("receive:TransactionWarning")}</h3>
                    <div className={classNames(css.hlx_wallet_box)}>
                      {/* Address generate */} 
                      <div className={css.hlx_iconLeft}>
                          <Button
                            className="icon_hover"
                            style={{ marginLeft : "13vw" }}
                            variant="backgroundNone"
                            loading={isGeneratingReceiveAddress}
                            onClick={this.onGeneratePress}
                          >
                            <Icon icon="sync" size={28} />
                            <br />
                            {t("receive:generateNewAddress")} <span> > </span>
                          </Button>
                        
                      
                      
                     
                        </div>
                      <div className={classNames(css.hlx_receive_box)}>
                        {!hadErrorGeneratingNewAddress && hasSyncedAddress ? (
                          <div
                            className={
                              isGeneratingReceiveAddress ? css.loading : null
                            }
                          >
                            {receiveAddress && (
                              <Clipboard
                                text={receiveAddress}
                                title={t("receive:addressCopied")}
                                success={t("receive:addressCopiedExplanation")}
                              >
                                <div className={css.address_div}>
                                  {receiveAddress
                                    .substring(0, 64)
                                    .split("")
                                    .map((char, index) => {
                                      const scrambleChar =
                                        scramble[index] > 0
                                          ? indexToChar(scramble[index])
                                          : null;
                                      return (
                                        <React.Fragment key={`char-${index}`}>
                                          {scrambleChar || char}
                                        </React.Fragment>
                                      );
                                    })}
                                      
                                  <span style={{ color: "#eaac32" }}>
                                    {receiveAddress
                                      .substring(64, 72)
                                      .split("")
                                      .map((char, index) => {
                                        const scrambleChar =
                                          scramble[index + 64] > 0
                                            ? indexToChar(scramble[index + 64])
                                            : null;
                                        return (
                                          <React.Fragment key={`char-${index}`}>
                                            {scrambleChar || char}
                                          </React.Fragment>
                                        );
                                      })}
                                  </span>
                                 
                                </div>
                                <div className={css.hlx_iconHolder}>
                                       <QR data={JSON.stringify({ address: receiveAddress, message: message })} />
                                       </div> 
                              </Clipboard>
                              
                            )}
                          </div>
                        ) : (
                          " "
                        )}
                      </div>
                      <div className={css.hlx_iconRight}>
                          {!hadErrorGeneratingNewAddress && hasSyncedAddress ? (
                            <Clipboard
                              text={receiveAddress}
                              title={t("receive:addressCopied")}
                              success={t("receive:addressCopiedExplanation")}
                            >
                              <Button
                                className="icon_hover"
                                variant="backgroundNone"
                                // loading={isGeneratingReceiveAddress}
                                // onClick={this.onGeneratePress}
                              >
                      {/* <div className={css.hlx_iconHolder}>
                      
                      <QR data={JSON.stringify({ address: receiveAddress, message: message })} />
                    
                   </div>          */}
                    {/* <Icon icon="receive" size={55} /> */}
                                <br />
                                {t("receive:copyAddress")} <span> > </span>
                              </Button>
                            </Clipboard>
                          ) : (
                            <Button
                              className="icon_hover"
                              variant="backgroundNone"
                              // loading={isGeneratingReceiveAddress}
                            >
                              {/* <Icon icon="receive" size={55} /> */}
                              <br />
                              {t("receive:copyAddress")} <span> > </span>
                            </Button>
                          )}
                        </div>
                      <div className={classNames(css.addbottom)}>
                        <hr/>
                      </div>
                      {/* Refresh and Receive Buttons... */}
                      {/* <div className={css.hlx_iconHolder}>
                      
                         <QR data={JSON.stringify({ address: receiveAddress, message: message })} />
                      
                      </div> */}
                    </div>
                    </div>
                 
                    <div className="col-lg-12">
                    <h3 style={{fontSize:'16px', marginLeft:'72vw',marginTop:'-64vw'}}>
                      {t("receive:Address")}
                   </h3>
                    <h3 style={{fontSize:'14px', marginLeft:'71vw'}}>{t("receive:Overviewstatus")}</h3><br/>
                    <h3  style={{fontSize:'14px', marginLeft:'72vw', marginTop:'-2vw'}}>{t("receive:AddressStatus")}</h3><br/>
                    <div className={classNames(css.hlx_wallet_addr)}>
                        <Scrollbar >
                          
                        {
                            addresses.map(value=>{
                          return (
                            <div style={{padding:'14px',backgroundImage: 'linear-gradient(to right, rgb(21, 35, 83),rgb(19, 33, 69))',marginLeft:'10px',marginBottom:'10px',fontSize:'14px'}} key={value.address}>
                              <span>{(value.address).substring(0,30)+'...'}</span> 
                              <span style={{marginLeft:'32px',padding:'5px 10px 5px 14px'}}>{value.spent==true?'Used':'Ready'}</span>
                            </div>
                          );
                            })
                        }
                        </Scrollbar>
                    </div>
                    </div>
              </div>
              </div>
            </div>
          </div>
          <hr className={css.recieve_hr}/>
        </section>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  receiveAddress: selectLatestAddressFromAccountFactory()(state),
  isGeneratingReceiveAddress: state.ui.isGeneratingReceiveAddress,
  isSyncing: state.ui.isSyncing,
  isTransitioning: state.ui.isTransitioning,
  hadErrorGeneratingNewAddress: state.ui.hadErrorGeneratingNewAddress,
  account: selectAccountInfo(state),
  accountName: getSelectedAccountName(state),
  accountMeta: getSelectedAccountMeta(state),
  password: state.wallet.password,
  isValidatingAddress: state.wallet.isValidatingAddress,
  accountInfo: selectAccountInfo(state),

});

const mapDispatchToProps = {
  generateAlert,
  generateNewAddress,
  addressValidationRequest,
  addressValidationSuccess
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withI18n()(Receive));
