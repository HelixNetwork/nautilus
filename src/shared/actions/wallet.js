// import extend from 'lodash/extend';
// import map from 'lodash/map';
// import noop from 'lodash/noop';
// import findLastIndex from 'lodash/findLastIndex';
// import reduce from 'lodash/reduce';

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