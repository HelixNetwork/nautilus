import assign from 'lodash/assign';
import some from 'lodash/some';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
export const ActionTypes = {
    SET_ACCOUNT_INFO_DURING_SETUP: 'HELIX/ACCOUNTS/SET_ACCOUNT_INFO_DURING_SETUP',
}

/**
 * Dispatch to store account information during setup
 *
 * @method setAccountInfoDuringSetup
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setAccountInfoDuringSetup = (payload) => {

    return {
        type: ActionTypes.SET_ACCOUNT_INFO_DURING_SETUP,
        payload,
    };
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