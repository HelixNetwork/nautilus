export const ActionTypes = {
    SET_LOCALE: 'HELIX/SETTINGS/LOCALE',
    UPDATE_THEME: 'HELIX/SETTINGS/UPDATE_THEME',
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