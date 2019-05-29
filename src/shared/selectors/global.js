import { createSelector } from 'reselect';
import Themes from '../themes/themes';

/**
 *   Selects settings prop from state.
 *
 *   @method getSettingsFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getSettingsFromState = (state) => state.settings || {};

/**
 * Selects active theme name from state.settings
 */
export const getThemeNameFromState = createSelector(getSettingsFromState, (state) => state.themeName);

/**
 * Selects active theme object
 */
export const getThemeFromState = createSelector(
    getThemeNameFromState,
    (themeName) => Themes[themeName] || Themes.Default,
);