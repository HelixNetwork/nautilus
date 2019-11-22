import cloneDeep from 'lodash/cloneDeep';
import includes from 'lodash/includes';
import unset from 'lodash/unset';
import xor from 'lodash/xor';
import vSchema0 from './v_0';
import v1Schema, { migration as v1Migration } from './v_1';

import { initialState as reduxSettingsState } from '../../reducers/settings';
import { account as reduxAccountsState } from '../../reducers/accounts';

import { __TEST__, __DEV__ } from '../../config';

const STORAGE_PATH = __TEST__
    ? 'helix.realm'
    : // eslint-disable-next-line no-undef
      `${Electron.getUserDataPath()}/helix${__DEV__ ? '-dev' : ''}.realm`;

/**
 * Gets deprecated realm storage path
 *
 * @method getDeprecatedStoragePath
 *
 * @param {number} schemaVersion
 *
 * @returns {string}
 */
const getDeprecatedStoragePath = (schemaVersion) =>
    __TEST__
        ? `helix-${schemaVersion}.realm`
        : // eslint-disable-next-line no-undef
          `${Electron.getUserDataPath()}/helix${__DEV__ ? '-dev' : ''}-${schemaVersion}.realm`;

/**
 * Updates (redux) state object schema to current wallet version
 *
 * @method updateSchema
 *
 * @param {object} input - target state object
 *
 * @returns {object} - updated state object
 */
export const updateSchema = (input) => {
    const state = cloneDeep(input);

    const latestReduxSettingsKeys = Object.keys(reduxSettingsState);
    const oldReduxSettingsKeys = Object.keys(state.settings);

    const latestReduxAccountsKeys = Object.keys(reduxAccountsState);
    const oldReduxAccountsKeys = Object.keys(state.accounts);

    // Find a difference of the properties between of old state and new state
    const newSettingsKeys = xor(latestReduxSettingsKeys, oldReduxSettingsKeys);
    const newAccountsKeys = xor(latestReduxAccountsKeys, oldReduxAccountsKeys);

    newSettingsKeys.forEach((key) => {
        // If property is new, then assign it to the state.settings object
        if (includes(latestReduxSettingsKeys, key) && !includes(oldReduxSettingsKeys, key)) {
            state.settings[key] = reduxSettingsState[key];
        }

        // If the property is old (and not present in the latest state.settings object), remove it
        if (includes(oldReduxSettingsKeys, key) && !includes(latestReduxSettingsKeys, key)) {
            unset(state.settings, key);
        }
    });

    newAccountsKeys.forEach((key) => {
        // If property is new, then assign it to the state.accounts object
        if (includes(latestReduxAccountsKeys, key) && !includes(oldReduxAccountsKeys, key)) {
            state.accounts[key] = reduxAccountsState[key];
        }

        // If the property is old (and not present in the latest state.accounts object), remove it
        if (includes(oldReduxAccountsKeys, key) && !includes(latestReduxAccountsKeys, key)) {
            unset(state.accounts, key);
        }
    });

    const convertToNodeObject = (url) => ({
        url,
        pow: false,
        token: '',
        password: '',
    });

    // Types of state.settings.node, state.settings.nodes and state.settings.customNodes are changed in the latest redux schema
    // Previously, they were stored as strings e.g., state.settings.node: <string>, state.settings.node: <string>[]
    // But in the latest redux schema, they are stored as an object with properties (url, pow, token, password)
    state.settings.customNodes.forEach(convertToNodeObject);
    state.settings.nodes.forEach(convertToNodeObject);

    state.settings.node = convertToNodeObject(state.settings.node);

    return state;
};

export default [
    {
        schema: vSchema0,
        schemaVersion: 0,
        path: STORAGE_PATH,
    },
    {
        schema: v1Schema,
        schemaVersion: 1,
        migration: v1Migration,
        path: STORAGE_PATH,
    },
];

export { vSchema0, v1Schema, STORAGE_PATH, getDeprecatedStoragePath };

// export { vSchema0, STORAGE_PATH};
