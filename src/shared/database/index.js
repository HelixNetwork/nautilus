import assign from 'lodash/assign';
import each from 'lodash/each';
import find from 'lodash/find';
import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import map from 'lodash/map';
import merge from 'lodash/merge';
import orderBy from 'lodash/orderBy';
import size from 'lodash/size';
import some from 'lodash/some';
import schemas, { getDeprecatedStoragePath, STORAGE_PATH as latestStoragePath, v0Schema } from './schemas';
// Initialise realm instance
let realm = {}; // eslint-disable-line import/no-mutable-exports

// Initialise Realm constructor as null and reinitialise after importing the correct (platform) Realm dependency
let Realm = null;

/**
 * Imports Realm dependency
 *
 * @method getRealm
 * @returns {object}
 */
export const getRealm = () => {
    return Electron.getRealm();
};

/**
 * Model for wallet data and settings.
 */
class Wallet {
    static version = Number(schemas[size(schemas) - 1].schemaVersion);
    /**
     * Gets object for provided id (version)
     *
     * @method getObjectForId
     * @param {number} id
     *
     * @returns {object}
     */
    static getObjectForId(id = Wallet.version) {
        return realm.objectForPrimaryKey('Wallet', id);
    }

    /**
     * Gets wallet data.
     *
     * @return {Realm.Results}
     */
    static get data() {
        return realm.objects('Wallet');
    }

    /**
     * Wallet settings for most recent version.
     */
    static get latestSettings() {
        const dataForCurrentVersion = Wallet.getObjectForId();

        return dataForCurrentVersion.settings;
    }

    /**
     * Wallet data (as plain object) for most recent version.
     */
    static get latestDataAsPlainObject() {
        const data = Wallet.latestData;

        return parse(serialise(data));
    }

    /**
     * Wallet data for most recent version.
     */
    static get latestData() {
        return Wallet.getObjectForId();
    }

    /**
     * Updates active locale.
     *
     * @method updateLocale
     * @param {string} payload
     */
    static updateLocale(payload) {
        realm.write(() => {
            Wallet.latestSettings.locale = payload;
        });
    }
}
export { realm, Wallet };