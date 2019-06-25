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
import schemas, { getDeprecatedStoragePath, STORAGE_PATH as latestStoragePath, v_0Schema } from './schemas';
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

class Account {
    
}
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

    /**
     * Creates a wallet object if it does not already exist.
     * @method createIfNotExists
     */
    static createIfNotExists() {
        const shouldCreate = isEmpty(Wallet.getObjectForId());

        if (shouldCreate) {
            realm.write(() =>
                realm.create('Wallet', {
                    version: Wallet.version,
                    settings: { notifications: {} },
                    accountInfoDuringSetup: { meta: {} },
                }),
            );
        }
    }
}

/**
 * Migrates realm from deprecated to latest storage path
 *
 * @method migrateToNewStoragePath
 *
 * @param {object} config - {{ encryptionKey: {array}, schemaVersion: {number}, path: {string}, schema: {array} }}
 *
 * @returns {undefined}
 */
const migrateToNewStoragePath = (config) => {
    const oldRealm = new Realm(config);

    const walletData = oldRealm.objectForPrimaryKey('Wallet', config.schemaVersion);

    const newRealm = new Realm(assign({}, config, { path: latestStoragePath }));

    newRealm.write(() => {
        if (!isEmpty(walletData)) {
            newRealm.create('Wallet', walletData);
        }
    });

    oldRealm.write(() => oldRealm.deleteAll());
};


/**
 * Deletes all objects in storage and deletes storage file for provided config
 *
 * @method purge
 *
 * @returns {Promise<any>}
 */
const purge = () =>
    new Promise((resolve, reject) => {
        try {
            realm.removeAllListeners();
            realm.write(() => realm.deleteAll());

            Realm.deleteFile(schemas[size(schemas) - 1]);

            resolve();
        } catch (error) {
            reject(error);
        }
    });

/**
 * Initialises storage.
 *
 * @method initialise
 * @param {Promise} getEncryptionKeyPromise
 *
 * @returns {Promise}
 */
const initialise = (getEncryptionKeyPromise) => {
    Realm = getRealm();

    return getEncryptionKeyPromise().then((encryptionKey) => {
        let hasVersionZeroRealmAtDeprecatedPath = false;
        try {
            hasVersionZeroRealmAtDeprecatedPath =
                Realm.schemaVersion(getDeprecatedStoragePath(0), encryptionKey) !== -1;
        } catch (error) { }

        const versionZeroConfig = {
            encryptionKey,
            schemaVersion: 0,
            path: getDeprecatedStoragePath(0),
            schema: v_0Schema,
        };
        console.log('storage', versionZeroConfig);
        if (
            hasVersionZeroRealmAtDeprecatedPath
            // Make sure version one realm file doesn't exist
            // If both version zero and version one files exist,
            // that probably means that a user already migrated to version one schema but version zero file wasn't removed
        ) {
            migrateToNewStoragePath(versionZeroConfig);
        }

        try {
            Realm.deleteFile(versionZeroConfig);
        } catch (error) { }

        const schemasSize = size(schemas);
        realm = new Realm(assign({}, schemas[schemasSize - 1], { encryptionKey }));

        initialiseSync();
    });
};



/**
 * Initialises storage.
 *
 * @method initialiseSync
 *
 * @returns {Promise}
 */
const initialiseSync = () => {
    Wallet.createIfNotExists();
};

/**
 * Purges persisted data and reinitialises storage.
 *
 * @method reinitialise
 * @param {Promise<function>}
 *
 * @returns {Promise}
 */
const reinitialise = (getEncryptionKeyPromise) => purge().then(() => initialise(getEncryptionKeyPromise));

export { realm, Wallet, initialise, initialiseSync, reinitialise };