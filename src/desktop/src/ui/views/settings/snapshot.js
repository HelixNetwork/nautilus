import React, { PureComponent } from "react";
import css from "./settings.scss";
import classNames from "classnames";
import PropTypes from "prop-types";
import { withI18n, Trans } from "react-i18next";
import {
  transitionForSnapshot,
  completeSnapshotTransition,
  setBalanceCheckFlag,
  generateAddressesAndGetBalance
} from "actions/wallet";
import SeedStore from "libs/seed";
import { connect } from "react-redux";
import {
    getAddressesForSelectedAccount,
    selectAccountInfo,
    getSelectedAccountName
} from 'selectors/accounts';
import { manuallySyncAccount } from 'actions/accounts';
import ModalConfirm from 'ui/components/modal/Confirm';
import Button from 'ui/components/button';
import Loading from 'ui/components/loading';
import { formatValue, formatUnit } from 'libs/hlx/utils';
import { round } from 'libs/utils';
import size from 'lodash/size';
import Scrollbar from 'ui/components/scrollbar';
import Top from 'ui/components/topbar';

/**
 * Snapshot setup
 */

class Snapshot extends PureComponent {
    static propTypes = {
        /** @ignore */
        wallet: PropTypes.object.isRequired,
        /** @ignore */
        ui: PropTypes.object.isRequired,
        /** Addresses for selected account */
        addresses: PropTypes.array.isRequired,
        /** @ignore */
        completeSnapshotTransition: PropTypes.func.isRequired,
        /** @ignore */
        setBalanceCheckFlag: PropTypes.func.isRequired,
        /** @ignore */
        generateAddressesAndGetBalance: PropTypes.func.isRequired,
        manuallySyncAccount: PropTypes.func.isRequired,
        /** @ignore */
        transitionForSnapshot: PropTypes.func.isRequired,
        /** @ignore */
        activeStepIndex: PropTypes.number.isRequired,
        /** @ignore */
        activeSteps: PropTypes.array.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };
    static renderProgressChildren(activeStepIndex, sizeOfActiveSteps, t) {
        if (activeStepIndex === -1) {
            return null;
        }

        return t('snapshotTransition:attachProgress', {
            currentAddress: activeStepIndex + 1,
            totalAddresses: sizeOfActiveSteps,
        });
    }

    

  componentDidUpdate(prevProps) {
    const { wallet, ui } = this.props;

    if (
      prevProps.ui.isTransitioning === ui.isTransitioning &&
      prevProps.ui.isAttachingToTangle === ui.isAttachingToTangle &&
      prevProps.wallet.balanceCheckFlag === wallet.balanceCheckFlag &&
      prevProps.ui.isSyncing === ui.isSyncing
    ) {
      return;
    }

    if (
      ui.isSyncing ||
      ui.isTransitioning ||
      ui.isAttachingToTangle ||
      wallet.balanceCheckFlag
    ) {
      Electron.updateMenu("enabled", false);
      // this.props.setWalletBusy(true);
    } else {
      // this.props.setWalletBusy(false);
      Electron.updateMenu("enabled", true);
      Electron.garbageCollect();
    }
  }
  /**
   * Trigger manual account sync Worker task
   * @returns {Promise}
   */
  syncAccount = async () => {
    const { account, wallet, accountNames } = this.props;

    const seedStore = await new SeedStore[account.meta.type](
      wallet.password,
      accountNames,
      account.meta
    );

    this.props.manuallySyncAccount(seedStore, accountNames);
  };

  /**
   * Trigger snapshot transition Worker task
   * @returns {Promise}
   */
  startSnapshotTransition = async () => {
    const { wallet, addresses } = this.props;
    const { accountName, meta } = this.props.account;

    const seedStore = await new SeedStore[meta.type](
      wallet.password,
      accountName,
      meta
    );

    this.props.transitionForSnapshot(seedStore, addresses, meta.type);
  };

  /**
   * Trigger snapshot transition completion
   * @returns {Promise}
   */
  transitionBalanceOk = async () => {
    this.props.setBalanceCheckFlag(false);
    const { account, wallet, accountNames } = this.props;

    const seedStore = await new SeedStore[account.meta.type](
      wallet.password,
      accountNames,
      account.meta
    );

    this.props.completeSnapshotTransition(
      seedStore,
      accountNames,
      wallet.transitionAddresses
    );
  };

  /**
   * Trigger snapshot transition
   * @returns {Promise}
   */
  transitionBalanceWrong = async () => {
    this.props.setBalanceCheckFlag(false);
    const { account, wallet, accountNames } = this.props;
    const seedStore = await new SeedStore[account.meta.type](
      wallet.password,
      accountNames,
      account.meta
    );

    const currentIndex = wallet.transitionAddresses.length;

    this.props.generateAddressesAndGetBalance(
      seedStore,
      currentIndex,
      accountNames
    );
  };
  render() {
    const { ui, wallet, t, activeStepIndex, activeSteps } = this.props;
    const sizeOfActiveSteps = size(activeSteps);

    if (
      (ui.isTransitioning || ui.isAttachingToTangle) &&
      !wallet.balanceCheckFlag
    ) {
      return (
        <Loading
          loop
          transparent={false}
          title={t("advancedSettings:snapshotTransition")}
          subtitle={
            <React.Fragment>
              {!ui.isAttachingToTangle ? (
                <div>
                  {t("snapshotTransition:transitioning")} <br />
                  {t("snapshotTransition:generatingAndDetecting")}{" "}
                  {t("global:pleaseWaitEllipses")}
                </div>
              ) : (
                <div>
                  {t("snapshotTransition:attaching")} <br />
                  {t("loading:thisMayTake")} {t("global:pleaseWaitEllipses")}{" "}
                  <br />
                  {Snapshot.renderProgressChildren(
                    activeStepIndex,
                    sizeOfActiveSteps,
                    t
                  )}
                </div>
              )}
            </React.Fragment>
          }
        />
      );
    }
    return (
      <div>
        <Top
          bal={"none"}
          main={"block"}
          user={"none"}
          history={this.props.history}
        />
        <section className="spage_1">
          <div className={classNames(css.foo_bxx12)}>
          <Scrollbar>
            <div className={css.scroll}>
             
                <article>
                  <h3 style={{ marginLeft: "14vw" ,marginTop:'-8vw'}}>
                    {t("advancedSettings:snapshotTransition")}
                  </h3>
                  <p>
                    {t("snapshotTransition:snapshotExplanation")} <br />
                    {t("snapshotTransition:hasSnapshotTakenPlace")}
                  </p>
                  <Button
                    style={{ marginLeft: "16vw" }}
                    className="small"
                    onClick={this.startSnapshotTransition}
                    loading={ui.isTransitioning || ui.isAttachingToTangle}
                  >
                    {t("snapshotTransition:transition")}
                  </Button>
                  <ModalConfirm
                    isOpen={wallet.balanceCheckFlag}
                    category="primary"
                    onConfirm={this.transitionBalanceOk}
                    onCancel={this.transitionBalanceWrong}
                    content={{
                      title: t("snapshotTransition:detectedBalance", {
                        amount: round(formatValue(wallet.transitionBalance), 1),
                        unit: formatUnit(wallet.transitionBalance)
                      }),
                      message: t("snapshotTransition:isThisCorrect"),
                      confirm: t("global:yes"),
                      cancel: t("global:no")
                    }}
                  />
                   <h3 style={{ marginLeft: "16vw"}}>{t('advancedSettings:manualSync')}</h3>
                        {ui.isSyncing ? (
                            <p>
                                {t('manualSync:syncingYourAccount')} <br />
                                {t('manualSync:thisMayTake')}
                            </p>
                        ) : (
                            <p>
                                {t('manualSync:outOfSync')} <br />
                                {t('manualSync:pressToSync')}
                            </p>
                        )}
                        <Button
                            style={{ marginLeft: "16vw" }}
                            onClick={this.syncAccount}
                            className="small"
                            loading={ui.isSyncing}
                            disabled={ui.isTransitioning || ui.isAttachingToTangle}
                        >
                            {t('manualSync:syncAccount')}
                        </Button>
                </article>
         
            </div>
            </Scrollbar>
          </div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  settings: state.settings,
  addresses: getAddressesForSelectedAccount(state),
  accountNames: getSelectedAccountName(state),
  account: selectAccountInfo(state),
  activeStepIndex: state.progress.activeStepIndex,
  activeSteps: state.progress.activeSteps
});

const mapDispatchToProps = {
    completeSnapshotTransition,
    transitionForSnapshot,
    manuallySyncAccount,
    generateAddressesAndGetBalance,
    setBalanceCheckFlag,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withI18n()(Snapshot));
