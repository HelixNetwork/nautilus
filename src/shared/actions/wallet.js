// import extend from 'lodash/extend';
// import map from 'lodash/map';
// import noop from 'lodash/noop';
// import findLastIndex from 'lodash/findLastIndex';
// import reduce from 'lodash/reduce';
import { WalletActionTypes } from './types'
export const ActionTypes = {
    MAP_STORAGE_TO_STATE: 'HELIX/SETTINGS/MAP_STORAGE_TO_STATE',
    SET_PASSWORD: 'HELIX/WALLET/SET_PASSWORD',
    CLEAR_WALLET_DATA: 'HELIX/WALLET/CLEAR_WALLET_DATA',
}


/**
 * Dispatch to map storage (persisted) data to redux state
 *
 * @method mapStorageToState
 * @param {object} payload

 * @returns {{type: {string}, payload: {object} }}
 */
export const mapStorageToState = (payload) => ({
    type: ActionTypes.MAP_STORAGE_TO_STATE,
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
 * Generate new receive address for wallet
 *
 * @method generateNewAddress
 *
 * @param {object} seedStore - SeedStore class object
 * @param {string} accountName
 * @param {object} existingAccountData
 *
 * @returns {function(*): Promise<any>}
 */
export const generateNewAddress = (seedStore, accountName, existingAccountData) => {
    return (dispatch, getState) => {
        dispatch(generateNewAddressRequest());

        return new NodesManager(nodesConfigurationFactory()(getState()))
            .withRetries(() => dispatch(generateAddressesSyncRetryAlert()))(syncAddresses)(
                seedStore,
                existingAccountData.addressData,
                existingAccountData.transactions,
            )
            .then((result) => {
                // Update address data in storage (realm)
                Account.update(accountName, { addressData: result });

                dispatch(updateAddressData(accountName, result));
                dispatch(generateNewAddressSuccess());
            })
            .catch((err) => {
                dispatch(
                    generateAlert(
                        'error',
                        i18next.t('global:somethingWentWrong'),
                        i18next.t('global:somethingWentWrongTryAgain'),
                        10000,
                        err,
                    ),
                );
                dispatch(generateNewAddressError());
            });
    };
};

export const setPassword = (payload) => ({
    type: ActionTypes.SET_PASSWORD,
    payload,
});

export const clearWalletData = () => ({
    type: ActionTypes.CLEAR_WALLET_DATA,
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