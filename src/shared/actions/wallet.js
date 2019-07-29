// import extend from 'lodash/extend';
// import map from 'lodash/map';
// import noop from 'lodash/noop';
// import findLastIndex from 'lodash/findLastIndex';
// import reduce from 'lodash/reduce';
import { WalletActionTypes } from './types';
import { accumulateBalance, attachAndFormatAddress, syncAddresses } from '../libs/hlx/addresses';

export const ActionTypes = {
    MAP_STORAGE_TO_STATE: 'HELIX/SETTINGS/MAP_STORAGE_TO_STATE',
    SET_PASSWORD: 'HELIX/WALLET/SET_PASSWORD',
    CLEAR_WALLET_DATA: 'HELIX/WALLET/CLEAR_WALLET_DATA',
    GENERATE_NEW_ADDRESS_ERROR: 'HELIX/WALLET/GENERATE_NEW_ADDRESS_ERROR',

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
        return syncAddresses()(seed, existingAccountData.addresses, genFn)
            .then((latestAddressData) => {
                console.log("ADDRESS===",latestAddressData);                
                dispatch(updateAddresses(accountName, latestAddressData));
                dispatch(generateNewAddressSuccess());
            })
            .catch(() => {
                console.log("ERRORRR...");
                
                dispatch(generateNewAddressError())});
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
    type: ActionTypes.GENERATE_NEW_ADDRESS_ERROR,
});

/**
 * Dispatch when new addresses are successfully generated
 *
 * @method generateNewAddressSuccess
 *
 * @returns {{type: {string} }}
 */
export const generateNewAddressSuccess = () => ({
    type: ActionTypes.GENERATE_NEW_ADDRESS_SUCCESS,
});

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
export const setSeedIndex = (payload) =>
    ({
    type: WalletActionTypes.SET_SEED_INDEX,
    payload,
});