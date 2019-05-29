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