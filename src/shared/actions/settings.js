import i18next from '../libs/i18next';
import { Wallet } from '../database';
import { getSelectedNodeFromState } from '../selectors/global';
import { changeHelixNode } from '../libs/hlx'
import { SettingsActionTypes } from '../actions/types';
import { generateAlert, generateNodeOutOfSyncErrorAlert, generateUnsupportedNodeErrorAlert } from '../actions/alerts';

/**
 * Change wallet's active language
 *
 * @method setLocale
 * @param {string} locale
 *
 * @returns {function} dispatch
 */
export function setLocale(locale) {
    return (dispatch) => {
        i18next.changeLanguage(locale);
        Wallet.updateLocale(locale);
        return dispatch({
            type: SettingsActionTypes.SET_LOCALE,
            payload: locale,
        });
    };
}

/**
 * Change wallet's active theme
 *
 * @method updateTheme
 *
 * @param {string} payload
 *
 * @returns {function} dispatch
 */
export function updateTheme(payload) {
    return (dispatch) => {
        dispatch({
            type: SettingsActionTypes.UPDATE_THEME,
            payload,
        });
    };
}

/**
 * Dispatch when user has accepted wallet's terms and conditions
 *
 * @method acceptTerms
 *
 * @returns {{type: {string} }}
 */
export const acceptTerms = () => {
    Wallet.acceptTerms();
    return {
        type: SettingsActionTypes.ACCEPT_TERMS,
    };
};

/**
 * Dispatch when user has accepted wallet's privacy agreement
 *
 * @method acceptPrivacy
 *
 * @returns {{type: {string} }}
 */
export const acceptPrivacy = () => {
    Wallet.acceptPrivacyPolicy();
    return {
        type: SettingsActionTypes.ACCEPT_PRIVACY,
    };
};

/**
 * Dispatch to change selected IRI node
 *
 * @method changeNode
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const changeNode = (payload) => (dispatch, getState) => {
    if (getSelectedNodeFromState(getState()) !== payload) {
        dispatch(setNode(payload));
        // Change provider on global helix instance
        changeHelixNode(payload);
    }
};

/**
 * Dispatch to set a randomly selected node as the active node for wallet
 *
 * @method setRandomlySelectedNode
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setRandomlySelectedNode = (payload) => {
    Wallet.setRandomlySelectedNode(payload);

    return {
        type: SettingsActionTypes.SET_RANDOMLY_SELECTED_NODE,
        payload,
    };
};

/**
 * Dispatch to set updated list of IRI nodes for wallet
 *
 * @method setNodeList
 * @param {array} payload
 *
 * @returns {{type: {string}, payload: {array} }}
 */
export const setNodeList = (payload) => {
    Node.addNodes(payload);

    return {
        type: SettingsActionTypes.SET_NODELIST,
        payload,
    };
};

/**
 * Dispatch to update auto promotion configuration for wallet
 *
 * @method setAutoPromotion
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setAutoPromotion = (payload) => {
    Wallet.updateAutoPromotionSetting(payload);

    return {
        type: SettingsActionTypes.SET_AUTO_PROMOTION,
        payload,
    };
};

/**
 * Dispatch when a network call for fetching currency information (conversion rates) is about to be made
 *
 * @method currencyDataFetchRequest
 *
 * @returns {{type: {string} }}
 */
const currencyDataFetchRequest = () => ({
    type: SettingsActionTypes.CURRENCY_DATA_FETCH_REQUEST,
});

/**
 * Dispatch when there is an error fetching currency information
 *
 * @method currencyDataFetchError
 *
 * @returns {{type: {string} }}
 */
const currencyDataFetchError = () => ({
    type: SettingsActionTypes.CURRENCY_DATA_FETCH_ERROR,
});

/**
 * Dispatch when currency information (conversion rates) is about to be fetched
 *
 * @method currencyDataFetchSuccess
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const currencyDataFetchSuccess = (payload) => {
    Wallet.updateCurrencyData(payload);

    return {
        type: SettingsActionTypes.CURRENCY_DATA_FETCH_SUCCESS,
        payload,
    };
};

/**
 * Fetch currency information (conversion rates) for wallet
 *
 * @method getCurrencyData
 *
 * @param {string} currency
 * @param {boolean} withAlerts
 *
 * @returns {function(*): Promise<any>}
 */
export function getCurrencyData(currency, withAlerts = false) {
    const url = 'https://trinity-exchange-rates.herokuapp.com/api/latest?base=USD';
    return (dispatch) => {
        dispatch(currencyDataFetchRequest());

        return fetch(url)
            .then(
                (response) => response.json(),
                () => {
                    dispatch(currencyDataFetchError());

                    if (withAlerts) {
                        dispatch(
                            generateAlert(
                                'error',
                                i18next.t('settings:couldNotFetchRates'),
                                i18next.t('settings:couldNotFetchRatesExplanation', { currency: currency }),
                            ),
                        );
                    }
                },
            )
            .then((json) => {
                const conversionRate = get(json, `rates.${currency}`) || 1;
                const availableCurrencies = keys(get(json, 'rates'));

                const payload = { conversionRate, currency, availableCurrencies };

                // Update redux
                dispatch(currencyDataFetchSuccess(payload));

                if (withAlerts) {
                    dispatch(
                        generateAlert(
                            'success',
                            i18next.t('settings:fetchedConversionRates'),
                            i18next.t('settings:fetchedConversionRatesExplanation', { currency: currency }),
                        ),
                    );
                }
            });
    };
}