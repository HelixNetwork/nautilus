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

export const getSelectedAccountMeta = createSelector(
    selectAccountInfo,
    (account) => get(account, 'meta'),
);