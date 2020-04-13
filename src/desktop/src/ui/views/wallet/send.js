/* global Electron */
import React from 'react';
import { connect } from 'react-redux';
import css from './wallet.scss';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import ic1 from 'ui/images/svg/send.svg';
import { withI18n } from 'react-i18next';
import SeedStore from 'libs/seed';
import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/button';
import axios from 'axios';
import { getSelectedAccountName, getSelectedAccountMeta, getBalanceForSelectedAccount } from 'selectors/accounts';
import { generateAlert } from 'actions/alerts';
import Checksum from 'ui/components/checksum';
import { makeTransaction } from 'actions/transfers';
import { ADDRESS_LENGTH, isValidAddress, isValidMessage, setBase } from 'libs/hlx/utils';
import ProgressBar from 'ui/components/progress';
import { startTrackingProgress } from 'actions/progress';
import { CURRENCT_URL, MAX_NOTE_LENGTH, MAX_HLX_LENGTH } from '../../../constants';
import { getCurrencyData } from 'actions/settings';

/**
 * Send transaction component
 */

class Send extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        balance: PropTypes.number.isRequired,
        /** @ignore */
        makeTransaction: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };
    state = {
        address: '',
        amount: '',
        hlxamount: '',
        txamount: '',
        message: '',
        openModal: false,
        selectedCurrency: this.props.currency,
        selectedHlx: 'mHLX',
        conversionRate: 1,
        progress: '',
    };

    validateInputs = (e) => {
        e.preventDefault();
        this.setState({
            openModal: this.areInputsValid(),
        });
    };

    confirmTransfer = async () => {
        const { password, accountName, accountMeta } = this.props;
        const { address, txamount } = this.state;
        this.setState({
            openModal: false,
        });

        const seedStore = await new SeedStore[accountMeta.type](password, accountName, accountMeta);

        let message =
            SeedStore[accountMeta.type].isMessageAvailable || parseInt(txamount || '0') === 0 ? this.state.message : '';
        if (this.state.message === '') {
            message = 'Nautilus wallet';
        }
        this.setState({
            message: message,
        });

        this.sendTransfer(seedStore, address, parseInt(txamount) || 0, message);
    };

    sendTransfer = (seedStore, address, value, message) => {
        const { ui, accountName, generateAlert, t } = this.props;

        if (ui.isSyncing) {
            generateAlert('error', t('global:syncInProgress'), t('global:syncInProgressExplanation'));
            return;
        }

        if (ui.isTransitioning) {
            generateAlert('error', t('snapshotTransitionInProgress'), t('snapshotTransitionInProgressExplanation'));
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
            // eslint-disable-next-line no-undef
            Electron.genFn,
        );
        this.resetForm();
    };

    setProgressSteps(isZeroValueTransaction) {
        const { t } = this.props;

        const steps = isZeroValueTransaction
            ? [
                  t('progressSteps:preparingTransfers'),
                  t('progressSteps:gettingTransactionsToApprove'),
                  t('progressSteps:proofOfWork'),
                  t('progressSteps:broadcasting'),
              ]
            : [
                  t('progressSteps:validatingReceiveAddress'),
                  t('progressSteps:syncingAccount'),
                  t('progressSteps:preparingInputs'),
                  t('progressSteps:preparingTransfers'),
                  t('progressSteps:gettingTransactionsToApprove'),
                  t('progressSteps:proofOfWork'),
                  t('progressSteps:validatingTransactionAddresses'),
                  t('progressSteps:broadcasting'),
              ];

        this.props.startTrackingProgress(steps);
    }

    handleCancel() {
        this.setState({ openModal: false });
        this.resetForm();
    }

    areInputsValid() {
        const { generateAlert, balance, t } = this.props;
        const { address, txamount, message } = this.state;

        // Validate address length
        if (address.length !== ADDRESS_LENGTH) {
            generateAlert(
                'error',
                t('send:invalidAddress'),
                t('send:invalidAddressExplanation1', { maxLength: ADDRESS_LENGTH }),
            );
            return false;
        }

        // Validate address checksum
        if (!isValidAddress(address)) {
            generateAlert('error', t('send:invalidAddress'), t('send:invalidAddressExplanation3'));
            return false;
        }

        // Validate enought balance
        if (parseFloat(txamount) > balance) {
            generateAlert('error', t('send:notEnoughFunds'), t('send:notEnoughFundsExplanation'));
            return false;
        }

        // If empty falls back to default value

        if (message === '') {
            return true;
        }

        // Validate whether message only contains ASCII letters
        // as anything else is lost up on conversion to txBytes

        if (!isValidMessage(message)) {
            generateAlert('error', t('send:invalidMessage'), t('send:invalidMessageExplanation'));
            return false;
        }
        return true;
    }

    addressInput(e) {
        this.setState({
            address: e.target.value,
        });
    }

    hlxInput(e) {
        let regexp = /^[0-9]*(\.[0-9]{0,2})?$/;
        let conversion = 0.000000022;
        let { txamount, selectedHlx, hlxamount } = this.state;

        let hlxamount1 = e.target.value;
        hlxamount1 = hlxamount1.toString();
        if (selectedHlx === 'HLX' && hlxamount1.indexOf('.') !== -1) {
            hlxamount1 = hlxamount;
        } else {
            if (!regexp.test(hlxamount1)) {
                hlxamount1 = hlxamount;
            }
        }

        let base = setBase(selectedHlx, e.target.value);
        txamount = hlxamount1 * base;
        const base1 = conversion * txamount;

        let amount = this.state.conversionRate * base1;
        this.setState({
            hlxamount: hlxamount1,
            amount: amount.toFixed(2),
            txamount: txamount,
        });
    }

    amountInput(e) {
        let { txamount, selectedHlx } = this.state;
        // let base = 0;
        let regexp = /^[0-9]*(\.[0-9]{0,2})?$/;
        if (regexp.test(e.target.value)) {
            const conversion = 0.000000022;
            let base = setBase(selectedHlx, e.target.value);
            let hlx = e.target.value / conversion;
            hlx = hlx / this.state.conversionRate;
            hlx = Math.round(hlx / base);
            txamount = hlx * base;

            const amount = e.target.value;
            this.setState({
                amount: amount,
                hlxamount: hlx,
                txamount: txamount,
            });
        }
    }

    currencyChange(e) {
        let selectedCurrency = e.target.value;
        axios.get(CURRENCT_URL).then((resp) => {
            this.setState({
                selectedCurrency: selectedCurrency,
                conversionRate: resp.data.rates[selectedCurrency],
                amount: '',
                hlxamount: '',
                txamount: '',
            });
        });
        this.props.getCurrencyData(selectedCurrency, true);
    }

    hlxChange(e) {
        this.setState({
            selectedHlx: e.target.value,
            txamount: '',
            amount: '',
            hlxamount: '',
        });
    }

    msgChange(e) {
        this.setState({
            message: e.target.value,
        });
    }

    componentDidMount() {
        const { currency } = this.props;
        axios.get(CURRENCT_URL).then((resp) => {
            this.setState({
                selectedCurrency: currency,
                conversionRate: resp.data.rates[currency],
            });
        });
    }

    resetForm() {
        this.setState({
            openModal: false,
            amount: '',
            hlxamount: '',
            address: '',
            message: '',
        });
    }

    render() {
        const { currencies, isSending, progress, t } = this.props;
        const { openModal, address, amount, hlxamount, message, selectedCurrency, selectedHlx } = this.state;

        const progressTitle =
            progress.activeStepIndex !== progress.activeSteps.length
                ? progress.activeSteps[progress.activeStepIndex]
                : `${t('send:totalTime')} ${Math.round(
                      progress.timeTakenByEachStep.reduce((total, time) => total + Number(time), 0),
                  )}s`;
        this.setState({
            progress: Math.round((progress.activeStepIndex / progress.activeSteps.length) * 100),
            title: progressTitle,
        });
        return (
            <div>
                <section className={css.home}>
                    <div className={classNames(css.pg1_foo3)}>
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-9">
                                    <div className={classNames(css.foo_bxx1, css.send_foobxx)}>
                                        <h5 className={css.send_coins}>{t('send:sendCoins')}</h5>
                                        <h6 className={css.send_h6}>{t('send:irrevocableTransactionWarning')}</h6>
                                        <form className={css.send_form}>
                                            <div>
                                                <select
                                                    className={css.currencyBox}
                                                    onChange={this.currencyChange.bind(this)}
                                                    value={selectedCurrency}
                                                >
                                                    {currencies
                                                        .slice()
                                                        .sort()
                                                        .map((item) => {
                                                            return (
                                                                <option
                                                                    value={item}
                                                                    key={item}
                                                                    className={css.send_options}
                                                                >
                                                                    {item}
                                                                </option>
                                                            );
                                                        })}
                                                </select>
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    className={classNames(css.bbx_box1, css.tr_box, css.send_input)}
                                                    placeholder={selectedCurrency}
                                                    onChange={this.amountInput.bind(this)}
                                                ></input>
                                            </div>
                                            <h1 className={classNames(css.eq)}>=</h1>

                                            <div>
                                                <select
                                                    defaultValue={'mHLX'}
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
                                                    className={classNames(css.bbx_box1, css.tr_box, css.send_input)}
                                                    maxLength={MAX_HLX_LENGTH}
                                                    min={0}
                                                    placeholder={selectedHlx}
                                                    onChange={this.hlxInput.bind(this)}
                                                ></input>
                                            </div>

                                            <div>
                                                <span className={classNames(css.currencyBox, css.send_span)}>
                                                    {t('send:note')}
                                                </span>
                                                <input
                                                    className={classNames(css.msgBox, css.send_input)}
                                                    value={message}
                                                    placeholder="Enter note"
                                                    maxLength={MAX_NOTE_LENGTH}
                                                    onChange={this.msgChange.bind(this)}
                                                />
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
                                                href=" "
                                                className={css.send_bts}
                                                onClick={this.validateInputs.bind(this)}
                                                disabled={this.state.hlxamount !== ''}
                                            >
                                                <img src={ic1} alt="" />

                                                <h2 className={classNames(css.send_bts_h2)}>{t('send:send')}</h2>
                                            </a>
                                        </form>
                                        {openModal && (
                                            <Modal
                                                isOpen={openModal}
                                                onClose={() => this.setState({ openModal: false })}
                                            >
                                                <div className={css.send_div}>
                                                    <br />
                                                    <div className={css.transferLoading}>
                                                        <br />
                                                    </div>
                                                    <br />
                                                    <div>
                                                        <h3>{t('send:continuetransaction')}</h3>
                                                        <br />
                                                        <Checksum address={address} />
                                                    </div>
                                                    <br />
                                                    <Button variant="danger" onClick={this.handleCancel.bind(this)}>
                                                        {t('global:cancel')}
                                                    </Button>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                                    <Button variant="success" onClick={this.confirmTransfer.bind(this)}>
                                                        {t('global:confirm')}
                                                    </Button>
                                                </div>
                                            </Modal>
                                        )}
                                    </div>
                                    {isSending && (
                                        <Modal isOpen={isSending} onClose={() => this.resetForm.bind(this)}>
                                            <ProgressBar
                                                pageType={'send'}
                                                progress={this.state.progress}
                                                title={progressTitle}
                                            />
                                        </Modal>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    accountName: getSelectedAccountName(state),
    accountMeta: getSelectedAccountMeta(state),
    password: state.wallet.password,
    balance: getBalanceForSelectedAccount(state),
    ui: state.ui,
    currencies: state.settings.availableCurrencies,
    conversionRate: state.settings.conversionRate,
    isSending: state.ui.isSendingTransfer,
    progress: state.progress,
    currency: state.settings.currency,
});

const mapDispatchToProps = {
    generateAlert,
    makeTransaction,
    startTrackingProgress,
    getCurrencyData,
};
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(Send));
