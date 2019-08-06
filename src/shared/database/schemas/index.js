import v_0Schema from './v_0';

import { __TEST__, __DEV__ } from '../../config';

const STORAGE_PATH = __TEST__ ? 'helix.realm' : `${Electron.getUserDataPath()}/helix${__DEV__ ? '-dev' : ''}.realm`;

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
        : `${Electron.getUserDataPath()}/helix${__DEV__ ? '-dev' : ''}-${schemaVersion}.realm`;

export default [
    {
        schema: v_0Schema,
        schemaVersion: 0,
        path: STORAGE_PATH,
    }
];

export { v_0Schema, STORAGE_PATH, getDeprecatedStoragePath };

// export { v_0Schema, STORAGE_PATH};