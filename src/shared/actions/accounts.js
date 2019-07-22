import assign from 'lodash/assign';
import some from 'lodash/some';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import { Wallet } from '../database';
export const ActionTypes = {
    SET_ACCOUNT_INFO_DURING_SETUP: 'HELIX/ACCOUNTS/SET_ACCOUNT_INFO_DURING_SETUP',
    SET_ONBOARDING_COMPLETE: 'HELIX/ACCOUNTS/SET_ONBOARDING_COMPLETE'
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
    Wallet.updateAccountInfoDuringSetup(payload);
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
                setTimeout(() => dispatch(generateErrorAlert(generateAccountInfoErrorAlert, err)), 500);
                dispatch(accountInfoFetchError());
            });
    };
};

export const getFullAccountInfo = (seedStore, accountName, quorum = false) => {
    return (dispatch, getState) => {
        dispatch(fullAccountInfoFetchRequest());

        const existingAccountNames = getAccountNamesFromState(getState());
        const usedExistingSeed = getAccountInfoDuringSetup(getState()).usedExistingSeed;

        return new NodesManager(nodesConfigurationFactory({ quorum })(getState()))
            .withRetries(() => dispatch(generateAccountSyncRetryAlert()))(getAccountData)(seedStore, accountName)
            .then((result) => {
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
                dispatch(fullAccountInfoFetchError());
                if (existingAccountNames.length !== 0) {
                    seedStore.removeAccount(accountName);
                }
                setTimeout(() => dispatch(generateErrorAlert(generateAccountInfoErrorAlert, err)), 500);
            });
    };
};