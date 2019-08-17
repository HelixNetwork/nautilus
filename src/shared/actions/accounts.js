import assign from "lodash/assign";
import some from "lodash/some";
import isEmpty from "lodash/isEmpty";
import isNumber from "lodash/isNumber";
import { Account, Wallet } from "../database";
import {
  selectedAccountTasksFactory,
  selectedAccountSetupInfoFactory,
  getAccountNamesFromState,
  getAccountInfoDuringSetup,
  selectedAccountStateFactory
} from "../selectors/accounts";
import Errors from "../libs/errors";
import {
  generateAccountInfoErrorAlert,
  generateSyncingCompleteAlert,
  generateSyncingErrorAlert,
  generateAccountDeletedAlert,
  generateNodeOutOfSyncErrorAlert,
  generateUnsupportedNodeErrorAlert,
  generateAccountSyncRetryAlert,
  generateLedgerCancelledAlert
} from "../actions/alerts";

import {
  nodesConfigurationFactory,
  getNodesFromState,
  getSelectedNodeFromState
} from "../selectors/global";
import { syncAccount, getAccountData } from "../libs/hlx/accounts";
import { setSeedIndex } from "./wallet";
import { changeNode } from "./settings";
import { withRetriesOnDifferentNodes, getRandomNodes } from "../libs/hlx/utils";
import { DEFAULT_RETRIES } from "../config";
import { AccountsActionTypes } from "./types";

/**
 * Dispatch when account information is successfully synced on login
 *
 * @method accountInfoFetchSuccess
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const accountInfoFetchSuccess = payload => ({
  type: AccountsActionTypes.ACCOUNT_INFO_FETCH_SUCCESS,
  payload
});

/**
 * Dispatch when an error occurs during account sync on login
 *
 * @method accountInfoFetchError
 *
 * @returns {{type: {string} }}
 */
export const accountInfoFetchError = () => ({
  type: AccountsActionTypes.ACCOUNT_INFO_FETCH_ERROR
});

/**
 * Dispatch to store account information during setup
 *
 * @method setAccountInfoDuringSetup
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setAccountInfoDuringSetup = payload => {
  Wallet.updateAccountInfoDuringSetup(payload);
  return {
    type: AccountsActionTypes.SET_ACCOUNT_INFO_DURING_SETUP,
    payload
  };
};


/**
 * Performs a manual sync for an account. Syncs full account information with the ledger.
 *
 * @method manuallySyncAccount
 * @param {object} seedStore - SeedStore class object
 * @param {string} accountName
 * @param {boolean} [quorum]
 *
 * @returns {function} dispatch
 */
export const manuallySyncAccount = (seedStore, accountName, quorum = false) => {
    return (dispatch, getState) => {
        dispatch(manualSyncRequest());

        const existingAccountState = selectedAccountStateFactory(accountName)(getState());

        return new NodesManager(nodesConfigurationFactory({ quorum })(getState()))
            .withRetries(() => dispatch(generateAccountSyncRetryAlert()))(getAccountData)(
                seedStore,
                accountName,
                existingAccountState,
            )
            .then((result) => {
                dispatch(generateSyncingCompleteAlert());

                // Update account in storage (realm)
                Account.update(accountName, result);
                dispatch(manualSyncSuccess(result));
            })
            .catch((err) => {
                dispatch(generateErrorAlert(generateSyncingErrorAlert, err));
                dispatch(manualSyncError());
            });
    };
};
/**
 * Dispatch when account is about to be manually synced
 *
 * @method manualSyncRequest
 *
 * @returns {{type: {string} }}
 */
export const manualSyncRequest = () => ({
  type: AccountsActionTypes.MANUAL_SYNC_REQUEST,
});
/**
 * Dispatch to update address data for provided account
 *
 * @method updateAddresses
 * @param {string} accountName
 * @param {object} addresses
 * @returns {{type: string, accountName: string, addresses: object }}
 */
export const updateAddresses = (accountName, addresses) => ({
  type: AccountsActionTypes.UPDATE_ADDRESSES,
  accountName,
  addresses
});

/**
 * Dispatch when information for an additional account is about to be fetched
 *
 * @method fullAccountInfoFetchRequest
 *
 * @returns {{type: {string} }}
 */
export const fullAccountInfoFetchRequest = () => ({
  type: AccountsActionTypes.FULL_ACCOUNT_INFO_FETCH_REQUEST
});

/**
 * Assign account index to each account if not already assigned
 *
 * @method assignAccountIndexIfNecessary
 * @param {object} accountInfo
 *
 * @returns {function(*)}
 */
export const assignAccountIndexIfNecessary = accountInfo => dispatch => {
  if (
    !isEmpty(accountInfo) &&
    some(accountInfo, ({ index }) => !isNumber(index))
  ) {
    dispatch(assignAccountIndex());
  }
};

export const setOnboardingComplete = payload => {
  Wallet.setOnboardingComplete();

  return {
    type: AccountsActionTypes.SET_ONBOARDING_COMPLETE,
    payload
  };
};

/**
 * Dispatch when account information is about to be fetched on login
 *
 * @method accountInfoFetchRequest
 *
 * @returns {{type: {string} }}
 */
export const accountInfoFetchRequest = () => ({
  type: AccountsActionTypes.ACCOUNT_INFO_FETCH_REQUEST
});

export const getAccountInfo = (
  seed,
  accountName,
  notificationFn,
  navigator = null,
  genFn,
  withQuorum = false
) => {
  return (dispatch, getState) => {
    dispatch(accountInfoFetchRequest());

    const existingAccountState = selectedAccountStateFactory(accountName)(
      getState()
    );
    const selectedNode = getSelectedNodeFromState(getState());
    return withRetriesOnDifferentNodes(
      [
        selectedNode,
        ...getRandomNodes(getNodesFromState(getState()), DEFAULT_RETRIES, [
          selectedNode
        ])
      ],
      () => dispatch(generateAccountSyncRetryAlert())
    )((...args) => syncAccount(...[...args, withQuorum]))(
      existingAccountState,
      seed,
      genFn,
      notificationFn
    )
      .then(({ node, result }) => {
        dispatch(changeNode(node));
        dispatch(accountInfoFetchSuccess(result));
      })
      .catch(err => {
        if (navigator) {
          navigator.pop({ animated: false });
        }

        dispatch(accountInfoFetchError());
        dispatch(generateAccountInfoErrorAlert(err));
      });
  };
};

export const fullAccountInfoFetchError = () => ({
  type: AccountsActionTypes.FULL_ACCOUNT_INFO_FETCH_ERROR
});

/**
 * Dispatch to update account state after sending a transaction*
 *
 * @method updateAccountInfoAfterSpending
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const updateAccountInfoAfterSpending = payload => ({
  type: AccountsActionTypes.UPDATE_ACCOUNT_INFO_AFTER_SPENDING,
  payload
});

/**
 * Dispatch to update account state before manually promoting a transaction
 *
 * @method syncAccountBeforeManualPromotion
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const syncAccountBeforeManualPromotion = payload => ({
  type: AccountsActionTypes.SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION,
  payload
});

/**
 * Dispatch to update account state after a transaction reattachment
 *
 * @method updateAccountAfterReattachment
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const updateAccountAfterReattachment = payload => ({
  type: AccountsActionTypes.UPDATE_ACCOUNT_AFTER_REATTACHMENT,
  payload
});

/**
 * Dispatch to set basic account info in state
 *
 * For example: To keep track of whether a seed was generated within Helix
 *
 * @method setBasicAccountInfo
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setBasicAccountInfo = payload => ({
  type: AccountsActionTypes.SET_BASIC_ACCOUNT_INFO,
  payload
});

/**
 * Dispatch when account information for an additional account is successfully fetched
 *
 * @method fullAccountInfoFetchSuccess
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const fullAccountInfoFetchSuccess = payload => ({
  type: AccountsActionTypes.FULL_ACCOUNT_INFO_FETCH_SUCCESS,
  payload
});

export const getFullAccountInfo = (
  seedStore,
  accountName,
  withQuorum = false
) => {
  return (dispatch, getState) => {
    dispatch(fullAccountInfoFetchRequest());

    const selectedNode = getSelectedNodeFromState(getState());
    const existingAccountNames = getAccountNamesFromState(getState());
    const usedExistingSeed = getAccountInfoDuringSetup(getState())
      .usedExistingSeed;
    withRetriesOnDifferentNodes(
      [
        selectedNode,
        ...getRandomNodes(getNodesFromState(getState()), DEFAULT_RETRIES, [
          selectedNode
        ])
      ],
      () => dispatch(generateAccountSyncRetryAlert())
    )((...args) => getAccountData(...[...args, withQuorum]))(
      seedStore,
      accountName
    )
      .then(({ node, result }) => {
        dispatch(changeNode(node));

        const seedIndex = existingAccountNames.length;

        dispatch(setSeedIndex(seedIndex));
        dispatch(setBasicAccountInfo({ accountName, usedExistingSeed }));

        const resultWithAccountMeta = assign({}, result, {
          meta: getAccountInfoDuringSetup(getState()).meta,
          index: seedIndex,
          name: result.accountName,
          ...selectedAccountTasksFactory(accountName)(getState()),
          ...selectedAccountSetupInfoFactory(accountName)(getState())
        });

        // Create account in storage (realm)
        Wallet.addAccount(resultWithAccountMeta);

        // Update redux store with newly fetched account info
        dispatch(fullAccountInfoFetchSuccess(resultWithAccountMeta));
      })
      .catch(err => {
        const dispatchErrors = () => {
          if (err.message === Errors.NODE_NOT_SYNCED) {
            dispatch(generateNodeOutOfSyncErrorAlert());
          } else if (err.message === Errors.UNSUPPORTED_NODE) {
            dispatch(generateUnsupportedNodeErrorAlert());
          } else {
            dispatch(generateAccountInfoErrorAlert(err));
          }
        };
        dispatch(fullAccountInfoFetchError());
        if (existingAccountNames.length === 0) {
          setTimeout(dispatchErrors, 500);
        } else {
          dispatchErrors();
          seedStore.removeAccount(accountName);
        }
      });
  };
};

/**
 * Dispatch to update account name in state
 *
 * @method changeAccountName
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const changeAccountName = payload => {
  const { oldAccountName, newAccountName } = payload;
  Account.migrate(oldAccountName, newAccountName);

  return {
    type: AccountsActionTypes.CHANGE_ACCOUNT_NAME,
    payload
  };
};

/**
 * Dispatch to update account state after snapshot transition
 *
 * @method updateAccountAfterTransition
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const updateAccountAfterTransition = payload => ({
  type: ActionTypes.UPDATE_ACCOUNT_AFTER_TRANSITION,
  payload
});
