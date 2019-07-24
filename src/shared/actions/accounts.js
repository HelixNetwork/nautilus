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
}
import { syncAccount, getAccountData } from '../libs/hlx/accounts';
import { setSeedIndex } from './wallet';
import { withRetriesOnDifferentNodes, getRandomNodes } from '../libs/hlx/utils';
import { DEFAULT_RETRIES } from '../config';
import Errors from '../libs/errors';


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
                setTimeout(() => dispatch(generateAlert(generateAccountInfoErrorAlert, err)), 500);
                dispatch(accountInfoFetchError());
            });
    };
};

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

export const getFullAccountInfo = (seedStore, accountName, withQuorum = false) => {
    console.log("here -", accountName);
    return (dispatch, getState) => {
        console.log('getstate',getState());
        dispatch(fullAccountInfoFetchRequest());

        const selectedNode = getSelectedNodeFromState(getState());
        const existingAccountNames = getAccountNamesFromState(getState());
        const usedExistingSeed = getAccountInfoDuringSetup(getState()).usedExistingSeed;

        console.log("here - nodes", selectedNode);
        console.log("here - name", existingAccountNames);
        console.log("here - seed", usedExistingSeed);
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
                console.log(err)
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