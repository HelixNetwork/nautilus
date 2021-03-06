import assign from 'lodash/assign';
import some from 'lodash/some';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import {
    selectedAccountTasksFactory,
    selectedAccountSetupInfoFactory,
    getAccountNamesFromState,
    getAccountInfoDuringSetup,
    selectedAccountStateFactory,
} from 'selectors/accounts';
import {
    generateAccountInfoErrorAlert,
    generateSyncingCompleteAlert,
    generateSyncingErrorAlert,
    generateAccountDeletedAlert,
    generateAccountSyncRetryAlert,
    generateErrorAlert,
} from 'actions/alerts';

import { nodesConfigurationFactory } from 'selectors/global';
import { syncAccount, getAccountData } from 'libs/hlx/accounts';
import NodesManager from 'libs/hlx/NodeManager';
import orderBy from 'lodash/orderBy';
import map from 'lodash/map';
import { Account, Wallet } from '../database';
import { setSeedIndex } from './wallet';
import { AccountsActionTypes } from './types';
/**
 * Dispatch when account information is successfully synced on login
 *
 * @method accountInfoFetchSuccess
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const accountInfoFetchSuccess = (payload) => ({
    type: AccountsActionTypes.ACCOUNT_INFO_FETCH_SUCCESS,
    payload,
});

/**
 * Dispatch when an error occurs during account sync on login
 *
 * @method accountInfoFetchError
 *
 * @returns {{type: {string} }}
 */
export const accountInfoFetchError = () => ({
    type: AccountsActionTypes.ACCOUNT_INFO_FETCH_ERROR,
});

/**
 * Dispatch to store account information during setup
 *
 * @method setAccountInfoDuringSetup
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setAccountInfoDuringSetup = (payload) => {
    Wallet.updateAccountInfoDuringSetup(payload);
    return {
        type: AccountsActionTypes.SET_ACCOUNT_INFO_DURING_SETUP,
        payload,
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
 * Dispatch when account is successfully synced
 *
 * @method manualSyncSuccess
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const manualSyncSuccess = (payload) => ({
    type: AccountsActionTypes.MANUAL_SYNC_SUCCESS,
    payload,
});

/**
 * Dispatch when an error occurs during manual sync
 *
 * @method manualSyncError
 *
 * @returns {{type: {string} }}
 */
export const manualSyncError = () => ({
    type: AccountsActionTypes.MANUAL_SYNC_ERROR,
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
    addresses,
});

/**
 * Dispatch when information for an additional account is about to be fetched
 *
 * @method fullAccountInfoFetchRequest
 *
 * @returns {{type: {string} }}
 */
export const fullAccountInfoFetchRequest = () => ({
    type: AccountsActionTypes.FULL_ACCOUNT_INFO_FETCH_REQUEST,
});
/**
 * Deletes an account.
 *
 * @method deleteAccount
 * @param {string} accountName
 *
 * @returns {function} dispatch
 */
export const deleteAccount = (accountName) => (dispatch) => {
    dispatch(removeAccount(accountName));
    dispatch(generateAccountDeletedAlert());
};

/**
 * Assign account index to each account if not already assigned
 *
 * @method assignAccountIndexIfNecessary
 * @param {object} accountInfo
 *
 * @returns {function(*)}
 */
export const assignAccountIndexIfNecessary = (accountInfo) => (dispatch) => {
    if (!isEmpty(accountInfo) && some(accountInfo, ({ index }) => !isNumber(index))) {
        dispatch(assignAccountIndex());
    }
};

/**
 * Dispatch to set onboarding as completed
 *
 * @method setOnboardingComplete
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setOnboardingComplete = (payload) => {
    Wallet.setOnboardingComplete();

    return {
        type: AccountsActionTypes.SET_ONBOARDING_COMPLETE,
        payload,
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
    type: AccountsActionTypes.ACCOUNT_INFO_FETCH_REQUEST,
});

/**
 * Gets latest account information: including transfers, balance and spend status information.
 *
 * @method getAccountInfo
 * @param {object} seedStore - SeedStore class object
 * @param {string} accountName
 * @param {function} notificationFn - New transaction callback function
 * @param {boolean} [withQuorum]
 *
 * @returns {function} dispatch
 */
export const getAccountInfo = (seedStore, accountName, notificationFn, quorum = false) => {
    return (dispatch, getState) => {
        dispatch(accountInfoFetchRequest());

        const existingAccountState = selectedAccountStateFactory(accountName)(getState());
        const settings = getState().settings;

        return new NodesManager(nodesConfigurationFactory({ quorum })(getState()))
            .withRetries(() => dispatch(generateAccountSyncRetryAlert()))(syncAccount)(
                existingAccountState,
                seedStore,
                notificationFn,
                settings,
            )
            .then((result) => {
                // Update account in storage (realm)
                Account.update(accountName, result);

                dispatch(accountInfoFetchSuccess(result));
            })
            .catch((err) => {
                setTimeout(() => dispatch(generateErrorAlert(generateAccountInfoErrorAlert, err)), 500);
                dispatch(accountInfoFetchError());
            });
    };
};

/**
 * Dispatch when an error occurs during the process of fetching information for an additional account
 *
 * @method fullAccountInfoFetchError
 *
 * @returns {{type: {string} }}
 */

export const fullAccountInfoFetchError = () => ({
    type: AccountsActionTypes.FULL_ACCOUNT_INFO_FETCH_ERROR,
});

/**
 * Dispatch to (automatically) assign accountIndex to every account in state
 *
 * @method assignAccountIndex
 *
 * @returns {{type: {string} }}
 */
export const assignAccountIndex = () => ({
    type: AccountsActionTypes.ASSIGN_ACCOUNT_INDEX,
});

/**
 * Dispatch to update account state after sending a transaction*
 *
 * @method updateAccountInfoAfterSpending
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const updateAccountInfoAfterSpending = (payload) => ({
    type: AccountsActionTypes.UPDATE_ACCOUNT_INFO_AFTER_SPENDING,
    payload,
});

/**
 * Dispatch to update account state before manually promoting a transaction
 *
 * @method syncAccountBeforeManualPromotion
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const syncAccountBeforeManualPromotion = (payload) => ({
    type: AccountsActionTypes.SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION,
    payload,
});

/**
 * Dispatch to update account state after a transaction reattachment
 *
 * @method updateAccountAfterReattachment
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const updateAccountAfterReattachment = (payload) => ({
    type: AccountsActionTypes.UPDATE_ACCOUNT_AFTER_REATTACHMENT,
    payload,
});

/**
 * Dispatch to set basic account info in state
 *
 * For example: To keep track of whether a seed was generated within Nautilus
 *
 * @method setBasicAccountInfo
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setBasicAccountInfo = (payload) => ({
    type: AccountsActionTypes.SET_BASIC_ACCOUNT_INFO,
    payload,
});

/**
 * Dispatch when account information for an additional account is successfully fetched
 *
 * @method fullAccountInfoFetchSuccess
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const fullAccountInfoFetchSuccess = (payload) => ({
    type: AccountsActionTypes.FULL_ACCOUNT_INFO_FETCH_SUCCESS,
    payload,
});

/**
 * Gets full account information for the first seed added to the wallet.
 *
 * @method getFullAccountInfo
 * @param {object} seedStore - SeedStore class object
 * @param {string} accountName
 * @param {boolean} [quorum]
 *
 * @returns {function} dispatch
 */
export const getFullAccountInfo = (seedStore, accountName, quorum = false) => {
    return (dispatch, getState) => {
        dispatch(fullAccountInfoFetchRequest());

        const existingAccountNames = getAccountNamesFromState(getState());
        const usedExistingSeed = getAccountInfoDuringSetup(getState()).usedExistingSeed;

        return new NodesManager(nodesConfigurationFactory({ quorum })(getState()))
            .withRetries(() => dispatch(generateAccountSyncRetryAlert()))(getAccountData)(seedStore, accountName)
            .then((result) => {
                const seedIndex = existingAccountNames.length;

                dispatch(setSeedIndex(seedIndex));
                dispatch(setBasicAccountInfo({ accountName, usedExistingSeed }));

                const resultWithAccountMeta = assign({}, result, {
                    meta: getAccountInfoDuringSetup(getState()).meta,
                    index: seedIndex,
                    name: result.accountName,
                    ...selectedAccountTasksFactory(accountName)(getState()),
                    ...selectedAccountSetupInfoFactory(accountName)(getState()),
                });

                // Create account in storage (realm)
                Wallet.addAccount(resultWithAccountMeta);

                // Update redux store with newly fetched account info
                dispatch(fullAccountInfoFetchSuccess(resultWithAccountMeta));
            })
            .catch((err) => {
                dispatch(fullAccountInfoFetchError());
                if (existingAccountNames.length !== 0) {
                    seedStore.removeAccount(accountName);
                }
                setTimeout(() => dispatch(generateErrorAlert(generateAccountInfoErrorAlert, err)), 500);
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
export const changeAccountName = (payload) => {
    const { oldAccountName, newAccountName } = payload;
    Account.migrate(oldAccountName, newAccountName);

    return {
        type: AccountsActionTypes.CHANGE_ACCOUNT_NAME,
        payload,
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
export const updateAccountAfterTransition = (payload) => ({
    type: AccountsActionTypes.UPDATE_ACCOUNT_AFTER_TRANSITION,
    payload,
});
/**
 * Dispatch to remove an account and its associated data from state
 *
 * @method removeAccount
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const removeAccount = (payload) => {
    Account.delete(payload);

    return {
        type: AccountsActionTypes.REMOVE_ACCOUNT,
        payload,
    };
};

/**
 *  Sync local account in case signed inputs were exposed to the network (and the network call failed)
 *
 *   @method syncAccountOnValueTransactionFailure
 *   @param {array} attachedTransactions
 *   @param {object} attachedAddressObject
 *   @param {object} accountState
 *
 *   @returns {object}
 **/
export const syncAccountDuringSnapshotTransition = (attachedTransactions, attachedAddressObject, accountState) => {
    // Check if attached address is already part of existing address data
    const existingAddressObject = find(accountState.addressData, { address: attachedAddressObject.address });

    return {
        ...accountState,
        addressData: existingAddressObject // If address is already part of existing address data, then simply replace the existing address object with the attached one
            ? map(accountState.addressData, (addressObject) => {
                  if (addressObject.address === attachedAddressObject.address) {
                      return attachedAddressObject;
                  }

                  return addressObject;
              }) // If address is not part of existing address data, then add it to address data
            : orderBy([...accountState.addressData, attachedAddressObject], 'index', ['asc']),
        transactions: [
            ...accountState.transactions,
            ...map(attachedTransactions, (transaction) => ({
                ...transaction,
                persistence: false,
                broadcasted: true,
                fatalErrorOnRetry: false,
            })),
        ],
    };
};
