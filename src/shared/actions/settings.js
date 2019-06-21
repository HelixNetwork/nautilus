import i18next from '../libs/i18next';
import { Wallet } from '../database';
export const ActionTypes = {
    SET_LOCALE: 'HELIX/SETTINGS/LOCALE',
    UPDATE_THEME: 'HELIX/SETTINGS/UPDATE_THEME',
    SET_LANGUAGE: 'HELIX/SETTINGS/SET_LANGUAGE',
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