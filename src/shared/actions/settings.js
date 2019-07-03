import i18next from '../libs/i18next';
import { Wallet } from '../database';
export const ActionTypes = {
    SET_LOCALE: 'HELIX/SETTINGS/LOCALE',
    UPDATE_THEME: 'HELIX/SETTINGS/UPDATE_THEME',
    SET_LANGUAGE: 'HELIX/SETTINGS/SET_LANGUAGE',
    ACCEPT_TERMS: 'HELIX/SETTINGS/ACCEPT_TERMS',
    ACCEPT_PRIVACY: 'HELIX/SETTINGS/ACCEPT_PRIVACY',
}
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
            type: ActionTypes.SET_LOCALE,
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
            type: ActionTypes.UPDATE_THEME,
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
        type: ActionTypes.ACCEPT_TERMS,
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
        type: ActionTypes.ACCEPT_PRIVACY,
    };
};