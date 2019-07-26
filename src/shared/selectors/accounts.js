import each from 'lodash/each';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import pickBy from 'lodash/pickBy';
import reduce from 'lodash/reduce';
import filter from 'lodash/filter';
import transform from 'lodash/transform';
import { createSelector } from 'reselect';
import { accumulateBalance, getLatestAddress } from '../libs/hlx/addresses';
import { getSeedIndexFromState } from './global';


/**
 *   Selects accounts prop from state.
 *
 *   @method getAccountsFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getAccountsFromState = (state) => state.accounts || {};

/**
 *   Selects accountNames prop from accounts reducer state object.
 *   Uses getAccountFromState selector for slicing accounts state from the whole state object.
 *
 *   @method getAccountNamesFromState
 *   @param {object} state
 *   @returns {array}
 **/
export const getAccountNamesFromState = createSelector(
    getAccountsFromState,
    (state) => {
        // Get [{ index, name }] for all accounts
        console.log(state);
        const accountNames = map(state.accountInfo, ({ index }, name) => ({ index, name }));

        // Order them by (account) index
        const getAccountName = ({ name }) => name;
        return map(orderBy(accountNames, ['index']), getAccountName);
    },
);

/**
 *   Selects getAccountInfoDuringSetup prop from accounts reducer state object.
 *
 *   @method getAccountInfoDuringSetup
 *   @param {object} state
 *   @returns {object}
 **/
export const getAccountInfoDuringSetup = createSelector(
    getAccountsFromState,
    (state) => state.accountInfoDuringSetup || {},
);

export const isSettingUpNewAccount = createSelector(
    getAccountInfoDuringSetup,
    (accountInfoDuringSetup) =>
        accountInfoDuringSetup.completed === true &&
        !isEmpty(accountInfoDuringSetup.name) &&
        !isEmpty(accountInfoDuringSetup.meta),
);

export const getAccountInfoFromState = createSelector(
    getAccountsFromState,
    (state) => state.accountInfo || {},
);


export const getSelectedAccountName = createSelector(
    getAccountNamesFromState,
    getSeedIndexFromState,
    (accountNames, seedIndex) => {
        return get(accountNames, seedIndex);
    },
);

export const selectAccountInfo = createSelector(
    getAccountInfoFromState,
    getSelectedAccountName,
    (accountInfo, accountName) => {
        const account = get(accountInfo, accountName);
        return account || {};
    },
);

/**
 *   Selects latest address from account info state partial.
 *
 *   @method selectLatestAddressFromAccountFactory
 *   @param {object} accountName
 *   @returns {string}
 **/
export const selectLatestAddressFromAccountFactory = (withChecksum = true) =>
    createSelector(
        selectAccountInfo,
        (state) => getLatestAddress(state.addressData, withChecksum),
    );

export const getSelectedAccountMeta = createSelector(
    selectAccountInfo,
    (account) => get(account, 'meta'),
);

/**
 *   Selects getSetupInfoFromAccounts prop from accounts reducer state object.
 *   Uses getAccountFromState selector for slicing accounts state from the state object.
 *
 *   @method getSetupInfoFromAccounts
 *   @param {object} state
 *   @returns {object}
 **/
export const getSetupInfoFromAccounts = createSelector(
    getAccountsFromState,
    (state) => state.setupInfo || {},
);

/**
 * Factory function for selecting account setup information from state
 * @method selectedAccountSetupInfoFactory
 *
 * @param {string} accountName
 * @returns {function}
 */
export const selectedAccountSetupInfoFactory = (accountName) => {
    return createSelector(
        getSetupInfoFromAccounts,
        (setupInfo) => setupInfo[accountName] || {},
    );
};

/**
 *   Selects all relevant account information from the state object.
 *   When returned function (createSelector) is called with the whole state object,
 *   it slices off state partials for the accountName.
 *
 *   @method selectedAccountStateFactory
 *   @param {string} accountName
 *   @returns {function}
 **/
export const selectedAccountStateFactory = (accountName) => {
    return createSelector(
        getAccountInfoFromState,
        (accountInfo) => {
            if (accountName in accountInfo) {
                return { ...accountInfo[accountName], accountName };
            }

            return {};
        },
    );
};

/**
 * Factory function for selecting account related tasks from state
 * @method selectedAccountTasksFactory
 *
 * @param {string} accountName
 * @returns {function}
 */
export const selectedAccountTasksFactory = (accountName) => {
    return createSelector(
        getTasksFromAccounts,
        (tasks) => tasks[accountName] || {},
    );
};

/**
 *   Selects getTasksFromAccounts prop from accounts reducer state object.
 *   Uses getAccountFromState selector for slicing accounts state from the state object.
 *
 *   @method getTasksFromAccounts
 *   @param {object} state
 *   @returns {object}
 **/
export const getTasksFromAccounts = createSelector(
    getAccountsFromState,
    (state) => state.tasks || {},
);