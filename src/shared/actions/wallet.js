import { accumulateBalance, attachAndFormatAddress, syncAddresses } from 'libs/hlx/addresses';
import { updateAddresses, updateAccountAfterTransition, syncAccountDuringSnapshotTransition } from 'actions/accounts';
import NodesManager from 'libs/hlx/NodeManager';

import { getRemotePoWFromState, nodesConfigurationFactory } from 'selectors/global';
import { getBalances } from 'libs/hlx/extendedApi';
import map from 'lodash/map';
import i18next from 'libs/i18next';
import Errors from 'libs/errors';
import findLastIndex from 'lodash/findLastIndex';
import noop from 'lodash/noop';
import { setActiveStepIndex, startTrackingProgress, reset as resetProgress } from 'actions/progress';
import reduce from 'lodash/reduce';
import { selectedAccountStateFactory, getSelectedAccountName } from 'selectors/accounts';
import { generateTransitionErrorAlert, generateAlert } from './alerts';
import { WalletActionTypes } from './types';
import { DEFAULT_SECURITY } from '../config';

/**
 * Dispatch to map storage (persisted) data to redux state
 *
 * @method mapStorageToState
 * @param {object} payload

 * @returns {{type: {string}, payload: {object} }}
 */
export const mapStorageToState = (payload) => ({
    type: WalletActionTypes.MAP_STORAGE_TO_STATE,
    payload,
});

/**
 * Dispatch when validating an address
 *
 * @method addressValidationRequest
 *
 * @returns {{type: {string} }}
 */
export const addressValidationRequest = () => ({
    type: WalletActionTypes.ADDRESS_VALIDATION_REQUEST,
});

/**
 * Dispatch when an address has been successfully validated
 *
 * @method addressValidationSuccess
 *
 * @returns {{type: {string} }}
 */
export const addressValidationSuccess = () => ({
    type: WalletActionTypes.ADDRESS_VALIDATION_SUCCESS,
});

/**
 * Dispatch when new addresses are about to be generated
 *
 * @method generateNewAddressRequest
 *
 * @returns {{type: {string} }}
 */
export const generateNewAddressRequest = () => ({
    type: WalletActionTypes.GENERATE_NEW_ADDRESS_REQUEST,
});

/**
 * Generate new receive address for wallet
 *
 * @method generateNewAddress
 *
 * @param {string} seed
 * @param {string} accountName
 * @param {object} existingAccountData
 * @param {function} genFn
 *
 * @returns {function(*): Promise<any>}
 */
export const generateNewAddress = (seed, accountName, existingAccountData, genFn) => {
    return (dispatch) => {
        dispatch(generateNewAddressRequest());
        return syncAddresses()(seed, existingAccountData.addressData, genFn)
            .then((latestAddressData) => {
                dispatch(updateAddresses(accountName, latestAddressData));
                dispatch(generateNewAddressSuccess());
            })
            .catch(() => {
                dispatch(generateNewAddressError());
            });
    };
};

/**
 * Dispatch in case an error occurs during new addresses generation
 *
 * @method generateNewAddressError
 *
 * @returns {{type: {string} }}
 */
export const generateNewAddressError = () => ({
    type: WalletActionTypes.GENERATE_NEW_ADDRESS_ERROR,
});

/**
 * Dispatch when new addresses are successfully generated
 *
 * @method generateNewAddressSuccess
 *
 * @returns {{type: {string} }}
 */
export const generateNewAddressSuccess = () => ({
    type: WalletActionTypes.GENERATE_NEW_ADDRESS_SUCCESS,
});

export const setPassword = (payload) => ({
    type: WalletActionTypes.SET_PASSWORD,
    payload,
});

export const clearWalletData = () => ({
    type: WalletActionTypes.CLEAR_WALLET_DATA,
});

/**
 * Dispatch to set active seed (account) index in state
 *
 * @method setSeedIndex
 * @param {number} payload
 *
 * @returns {{type: {string}, payload: {number} }}
 */
export const setSeedIndex = (payload) => ({
    type: WalletActionTypes.SET_SEED_INDEX,
    payload,
});

/**
 * Dispatch to update detected balance during snapshot transition
 *
 * @method updateTransitionBalance
 * @param {number} payload
 *
 * @returns {{type: {string}, payload: {number} }}
 */
export const updateTransitionBalance = (payload) => ({
    type: WalletActionTypes.UPDATE_TRANSITION_BALANCE,
    payload,
});

/**
 * Dispatch if an error occurs during snapshot transition
 *
 * @method snapshotTransitionError
 *
 * @returns {{type: {string} }}
 */
export const snapshotTransitionError = () => ({
    type: WalletActionTypes.SNAPSHOT_TRANSITION_ERROR,
});

/**
 * Dispatch to update generated addresses during snapshot transition
 *
 * @method updateTransitionAddresses
 * @param {array} payload
 *
 * @returns {{type: {string}, payload: {array} }}
 */
export const updateTransitionAddresses = (payload) => ({
    type: WalletActionTypes.UPDATE_TRANSITION_ADDRESSES,
    payload,
});
/**
 * Dispatch when addresses are about to be attached to tangle during snapshot transition
 *
 * @method snapshotAttachToTangleRequest
 *
 * @returns {{type: {string} }}
 */
export const snapshotAttachToTangleRequest = () => ({
    type: WalletActionTypes.SNAPSHOT_ATTACH_TO_TANGLE_REQUEST,
});

/**
 * Dispatch when addresses are successfully attached to tangle during snapshot transition
 *
 * @method snapshotAttachToTangleComplete
 *
 * @returns {{type: {string} }}
 */
export const snapshotAttachToTangleComplete = () => ({
    type: WalletActionTypes.SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE,
});

/**
 * Dispatch when snapshot transition is successfully completed
 *
 * @method snapshotTransitionSuccess
 *
 * @returns {{type: {string} }}
 */
export const snapshotTransitionSuccess = () => ({
    type: WalletActionTypes.SNAPSHOT_TRANSITION_SUCCESS,
});

/**
 * Completes snapshot transition by sequentially attaching addresses to tangle
 *
 * @method completeSnapshotTransition
 *
 * @param {object} seedStore - SeedStore class object
 * @param {string} accountName
 * @param {array} addresses
 * @param {boolean} withQuorum
 *
 * @returns {function}
 */
export const completeSnapshotTransition = (seed, accountName, addresses, powFn) => {
    return (dispatch, getState) => {
        dispatch(
            generateAlert(
                'info',
                i18next.t('snapshotTransition:attaching'),
                i18next.t('global:deviceMayBecomeUnresponsive'),
            ),
        );

        dispatch(snapshotAttachToTangleRequest());

        // Find balance on all addresses
        getBalances()(addresses)
            .then((balances) => {
                const allBalances = map(balances.balances, Number);
                const totalBalance = accumulateBalance(allBalances);
                const hasZeroBalance = totalBalance === 0;

                // If accumulated balance is zero, terminate the snapshot process
                if (hasZeroBalance) {
                    throw new Error(Errors.CANNOT_TRANSITION_ADDRESSES_WITH_ZERO_BALANCE);
                }

                const lastIndexWithBalance = findLastIndex(allBalances, (balance) => balance > 0);
                const relevantBalances = allBalances.slice(0, lastIndexWithBalance + 1);
                const relevantAddresses = addresses.slice(0, lastIndexWithBalance + 1);

                dispatch(startTrackingProgress(relevantAddresses));

                return reduce(
                    relevantAddresses,
                    (promise, address, index) => {
                        return promise.then((result) => {
                            dispatch(setActiveStepIndex(index));

                            return attachAndFormatAddress()(
                                address,
                                index,
                                relevantBalances[index],
                                seed,
                                // Pass proof of work function as null, if configuration is set to remote
                                getRemotePoWFromState(getState()) ? null : powFn,
                            )
                                .then(({ addressData, transfer }) => {
                                    const existingAccountState = selectedAccountStateFactory(accountName)(getState());

                                    const { newState } = syncAccountDuringSnapshotTransition(
                                        transfer,
                                        addressData,
                                        existingAccountState,
                                    );
                                    dispatch(updateAccountAfterTransition(newState));

                                    return result;
                                })
                                .catch(noop);
                        });
                    },
                    Promise.resolve(),
                );
            })
            .then(() => {
                dispatch(snapshotTransitionSuccess());
                dispatch(snapshotAttachToTangleComplete());
                dispatch(
                    generateAlert(
                        'success',
                        i18next.t('snapshotTransition:transitionComplete'),
                        i18next.t('snapshotTransition:transitionCompleteExplanation'),
                        20000,
                    ),
                );

                dispatch(resetProgress());
            })
            .catch((error) => {
                dispatch(snapshotTransitionError());
                dispatch(snapshotAttachToTangleComplete());
                dispatch(generateTransitionErrorAlert(error));
            });
    };
};

/**
 * Dispatch to show/hide ('Is your balance correct?') during snapshot transition
 *
 * @method setBalanceCheckFlag
 * @param {boolean} payload

 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setBalanceCheckFlag = (payload) => ({
    type: WalletActionTypes.SET_BALANCE_CHECK_FLAG,
    payload,
});
/**
 * Fetch balances against addresses and update total transition balance
 *
 * @method getBalanceForCheck
 *
 * @param {array} addresses
 * @param {boolean} withQuorum
 *
 * @returns {function}
 */
export const getBalanceForCheck = (addresses, quorum = true) => {
    return (dispatch, getState) => {
        return new NodesManager(nodesConfigurationFactory({ quorum })(getState()))
            .withRetries()(getBalances)(addresses)
            .then((result) => {
                const balanceOnAddresses = accumulateBalance(map(result.balances, Number));

                dispatch(updateTransitionBalance(balanceOnAddresses));
                dispatch(setBalanceCheckFlag(true));
            })
            .catch((error) => {
                dispatch(snapshotTransitionError());
                dispatch(generateTransitionErrorAlert(error));
            });
    };
};
/**
 * Generates a batch of addresses from a seed and grabs balances for those addresses
 *
 * @method generateAddressesAndGetBalance
 *
 * @param {string | array} seed
 * @param {number} index
 * @param {string} accountName
 *
 * @returns {function}
 */
export const generateAddressesAndGetBalance = (seedStore, index, accountName, seedType = 'keychain') => {
    return (dispatch, getState) => {
        const options = {
            index,
            security: DEFAULT_SECURITY,
            total: seedType === 'ledger' ? 15 : 60,
        };

        return seedStore
            .generateAddress(options)
            .then((addresses) => {
                const latestAccountName = getSelectedAccountName(getState());

                if (latestAccountName === accountName) {
                    dispatch(updateTransitionAddresses(addresses));
                    dispatch(getBalanceForCheck(addresses));
                }
            })
            .catch((error) => {
                dispatch(snapshotTransitionError());
                dispatch(generateTransitionErrorAlert(error));
            });
    };
};

/**
 * Dispatch when snapshot transition is about to be performed
 *
 * @method snapshotTransitionRequest
 *
 * @returns {{type: {string} }}
 */
export const snapshotTransitionRequest = () => ({
    type: WalletActionTypes.SNAPSHOT_TRANSITION_REQUEST,
});

/**
 * Checks for balance against generated addresses for transition
 * In case there are no addresses generated yet, it will generate a batch of addresses
 * and will fetch balance against those
 *
 * @method transitionForSnapshot
 *
 * @param {object} seedStore - SeedStore class object
 * @param {array} addresses
 * @param {function} genFn
 *
 * @returns {function} - dispatch
 */
export const transitionForSnapshot = (seedStore, addresses) => {
    return (dispatch) => {
        dispatch(snapshotTransitionRequest());
        if (addresses.length > 0) {
            dispatch(getBalanceForCheck(addresses));
            dispatch(updateTransitionAddresses(addresses));
        } else {
            setTimeout(() => {
                dispatch(generateAddressesAndGetBalance(seedStore, 0));
            });
        }
    };
};
