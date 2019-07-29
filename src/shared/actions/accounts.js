import assign from 'lodash/assign';
import some from 'lodash/some';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import { Wallet } from '../database';
import {
    selectedAccountTasksFactory,
    selectedAccountSetupInfoFactory,
    getAccountNamesFromState,
    getAccountInfoDuringSetup,
    selectedAccountStateFactory,
} from '../selectors/accounts';
import Errors from '../libs/errors';
import {
    generateAccountInfoErrorAlert,
    generateSyncingCompleteAlert,
    generateSyncingErrorAlert,
    generateAccountDeletedAlert,
    generateNodeOutOfSyncErrorAlert,
    generateUnsupportedNodeErrorAlert,
    generateAccountSyncRetryAlert,
    generateLedgerCancelledAlert,
} from '../actions/alerts';

import { nodesConfigurationFactory, getNodesFromState, getSelectedNodeFromState } from '../selectors/global';
export const ActionTypes = {
    SET_ACCOUNT_INFO_DURING_SETUP: 'HELIX/ACCOUNTS/SET_ACCOUNT_INFO_DURING_SETUP',
    SET_ONBOARDING_COMPLETE: 'HELIX/ACCOUNTS/SET_ONBOARDING_COMPLETE',
    FULL_ACCOUNT_INFO_FETCH_REQUEST: 'HELIX/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_REQUEST',
    FULL_ACCOUNT_INFO_FETCH_ERROR: 'HELIX/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_ERROR',
    FULL_ACCOUNT_INFO_FETCH_SUCCESS: 'HELIX/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_SUCCESS',
    ACCOUNT_INFO_FETCH_SUCCESS: 'HELIX/ACCOUNTS/ACCOUNT_INFO_FETCH_SUCCESS',
    ACCOUNT_INFO_FETCH_ERROR: 'HELIX/ACCOUNTS/ACCOUNT_INFO_FETCH_ERROR',
}
import { syncAccount, getAccountData } from '../libs/hlx/accounts';
import { setSeedIndex } from './wallet';
import { changeNode } from './settings';
import { withRetriesOnDifferentNodes, getRandomNodes } from '../libs/hlx/utils';
import { DEFAULT_RETRIES } from '../config';
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
    type: ActionTypes.ACCOUNT_INFO_FETCH_SUCCESS,
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
    type: ActionTypes.ACCOUNT_INFO_FETCH_ERROR,
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
        type: ActionTypes.SET_ACCOUNT_INFO_DURING_SETUP,
        payload,
    };
};

/**
 * Dispatch when information for an additional account is about to be fetched
 *
 * @method fullAccountInfoFetchRequest
 *
 * @returns {{type: {string} }}
 */
export const fullAccountInfoFetchRequest = () => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_FETCH_REQUEST,
});


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

export const setOnboardingComplete = (payload) => {
    Wallet.setOnboardingComplete();

    return {
        type: ActionTypes.SET_ONBOARDING_COMPLETE,
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


export const getAccountInfo = (seed, accountName, notificationFn,navigator = null, genFn) => {
    return (dispatch, getState) => {
        dispatch(accountInfoFetchRequest());

        const existingAccountState = selectedAccountStateFactory(accountName)(getState());
        console.log('exst',existingAccountState);
        const selectedNode = getSelectedNodeFromState(getState());
        console.log('selnode',selectedNode);
        return withRetriesOnDifferentNodes(
            [selectedNode, ...getRandomNodes(getNodesFromState(getState()), DEFAULT_RETRIES, [selectedNode])],
            () => dispatch(generateAccountSyncRetryAlert()),
        )(syncAccount)(existingAccountState, seed, genFn, notificationFn)
            .then(({ node, result }) => {
                console.log('node',node);
                console.log('res',result);
                dispatch(changeNode(node));
                dispatch(accountInfoFetchSuccess(result));
            })
            .catch((err) => {
                console.log('err',err)
                if (navigator) {
                    navigator.pop({ animated: false });
                }

                dispatch(accountInfoFetchError());
                dispatch(generateAccountInfoErrorAlert(err));
            });
    };
};

// export const getAccountInfo = (seedStore, accountName, notificationFn, quorum = false) => {

//     return (dispatch, getState) => {
//         dispatch(accountInfoFetchRequest());

//         const existingAccountState = selectedAccountStateFactory(accountName)(getState());
//         console.log(existingAccountState);
//         const settings = getState().settings;
//         console.log('set',settings)
//         return new NodesManager(nodesConfigurationFactory({ quorum })(getState()))
//             .withRetries(() => dispatch(generateAccountSyncRetryAlert()))(syncAccount)(
//                 existingAccountState,
//                 seedStore,
//                 notificationFn,
//                 settings,
//             )
//             .then((result) => {
//                 // Update account in storage (realm)
//                 Account.update(accountName, result);
//                 console.log('re',result);
//                 dispatch(accountInfoFetchSuccess(result));
//             })
//             .catch((err) => {
//                 console.log('err', err);
//                 setTimeout(() => dispatch(generateAlert(generateAccountInfoErrorAlert, err)), 500);
//                 dispatch(accountInfoFetchError());
//             });
//     };
// };

export const fullAccountInfoFetchError = () => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_FETCH_ERROR,
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
 * For example: To keep track of whether a seed was generated within Helix
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


export const getFullAccountInfo = (seedStore, accountName, withQuorum = false) => {
    return (dispatch, getState) => {
        dispatch(fullAccountInfoFetchRequest());

        const selectedNode = getSelectedNodeFromState(getState());
        console.log('selectednode',selectedNode);
        const existingAccountNames = getAccountNamesFromState(getState());
        const usedExistingSeed = getAccountInfoDuringSetup(getState()).usedExistingSeed;
        withRetriesOnDifferentNodes(
            [selectedNode, ...getRandomNodes(getNodesFromState(getState()), DEFAULT_RETRIES, [selectedNode])],
            () => dispatch(generateAccountSyncRetryAlert()),
        )((...args) => getAccountData(...[...args, withQuorum]))(seedStore, accountName)
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
                    ...selectedAccountSetupInfoFactory(accountName)(getState()),
                });

                // Create account in storage (realm)
                Wallet.addAccount(resultWithAccountMeta);

                // Update redux store with newly fetched account info
                dispatch(fullAccountInfoFetchSuccess(resultWithAccountMeta));
            })
            .catch((err) => {
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