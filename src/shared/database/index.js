import assign from "lodash/assign";
import each from "lodash/each";
import find from "lodash/find";
import includes from "lodash/includes";
import isArray from "lodash/isArray";
import isEmpty from "lodash/isEmpty";
import isUndefined from "lodash/isUndefined";
import map from "lodash/map";
import merge from "lodash/merge";
import orderBy from "lodash/orderBy";
import size from "lodash/size";
import some from "lodash/some";
import { serialise, parse } from "../libs/utils";
import schemas, {
  getDeprecatedStoragePath,
  STORAGE_PATH as latestStoragePath,
  v_0Schema
} from "./schemas";
import { preserveAddressLocalSpendStatus } from "libs/hlx/addresses";
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
  static getObjectForId(id) {
    return realm.objectForPrimaryKey("Account", id);
  }

  static get data() {
    return realm.objects("Account");
  }

  /**
   * Gets account data for all stored accounts.
   * @method getDataAsArray
   *
   * @returns {array}
   */
  static getDataAsArray() {
    const accounts = Account.data;

    return map(accounts, account =>
      assign({}, account, {
        addressData: map(account.addressData, data => assign({}, data)),
        transactions: map(account.transactions, transaction =>
          assign({}, transaction)
        ),
        meta: assign({}, account.meta)
      })
    );
  }

  /**
   * Orders accounts by indexes
   *
   * @method orderAccountsByIndex
   *
   * @returns {void}
   */
  static orderAccountsByIndex() {
    const orderedAccounts = orderBy(Account.getDataAsArray(), ["index"]);

    if (some(orderedAccounts, (account, index) => index !== account.index)) {
      realm.write(() => {
        each(orderedAccounts, (account, index) => {
          realm.create("Account", assign({}, account, { index }), true);
        });
      });
    }
  }

  /**
   * Creates account.
   * @method create
   *
   * @param {object} data
   */
  static create(data) {
    realm.write(() => realm.create("Account", data));
  }

  /**
   * Creates multiple accounts.
   * @method createMultiple
   *
   * @param {object} data
   */
  static createMultiple(accountsData) {
    realm.write(() => {
      each(accountsData, data => realm.create("Account", data));
    });
  }

  /**
   * Creates an account if it does not already exist.
   *
   * @method createIfNotExists
   * @param {string} name
   * @param {object} data
   */
  static createIfNotExists(name, data) {
    const shouldCreate = isEmpty(Account.getObjectForId(name));

    if (shouldCreate) {
      Account.create(assign({}, data, { name }));
    }
  }

  /**
   * Updates account.
   * @method updateTransactionsAndAddressData
   *
   * @param {string} name
   * @param {object} data
   */
  static update(name, data) {
    realm.write(() => {
      const existingData = Account.getObjectForId(name);
      const updatedData = assign({}, existingData, {
        ...data,
        name,
        addressData: isEmpty(data.addressData)
          ? existingData.addressData
          : preserveAddressLocalSpendStatus(
              map(existingData.addressData, data => assign({}, data)),
              data.addressData
            )
      });

      realm.create("Account", updatedData, true);
    });
  }

  /**
   * Deletes account.
   * @method delete
   *
   * @param {string} name
   */
  static delete(name) {
    realm.write(() => {
      const accountsBeforeDeletion = Account.getDataAsArray();
      const accountForDeletion = find(accountsBeforeDeletion, { name });

      if (accountForDeletion) {
        realm.delete(Account.getObjectForId(name));

        const accountsAfterDeletion = Account.getDataAsArray();
        const deletedAccountIndex = accountForDeletion.index;

        each(accountsAfterDeletion, account => {
          realm.create(
            "Account",
            assign({}, account, {
              index:
                account.index > deletedAccountIndex
                  ? account.index - 1
                  : account.index
            }),
            true
          );
        });
      }
    });
  }

  /**
   * Migrate account data under a new name.
   *
   * @method migrate
   *
   * @param {string} from - Account name
   * @param {string} to - New account name
   */
  static migrate(from, to) {
    const accountData = Account.getObjectForId(from);

    realm.write(() => {
      // Create account with new name.
      realm.create("Account", assign({}, accountData, { name: to }));
      // Delete account with old name.
      realm.delete(accountData);
    });
  }
}

/**
 * Model for node.
 */
class Node {
  /**
   * Gets object for provided id (url)
   *
   * @method getObjectForId
   * @param {string} id
   *
   * @returns {object}
   */
  static getObjectForId(id) {
    return realm.objectForPrimaryKey("Node", id);
  }

  /**
   * Returns a list of nodes
   *
   * @return {Realm.Results}
   */
  static get data() {
    return realm.objects("Node");
  }

  /**
   * Returns nodes as array
   *
   * @method getDataAsArray
   *
   * @return {array}
   */
  static getDataAsArray() {
    return map(Node.data, node => assign({}, node));
  }

  /**
   * Adds a custom node
   *
   * @method addCustomNode
   * @param {string} url Node URL
   */
  static addCustomNode(payload) {
    const { url, pow} = payload;
    realm.write(() => {
      realm.create("Node", {
        url,
        custom: true,
        pow
      });
    });
  }

  /**
   * Removes a node.
   *
   * @method delete
   * @param {string} url
   */
  static delete(url) {
    const node = Node.getObjectForId(url);
    realm.write(() => realm.delete(node));
  }

  /**
   *
   * @method addNodes
   * @param {array} nodes
   */
  static addNodes(nodes) {
    if (size(nodes)) {
      const existingUrls = map(Node.getDataAsArray(), node => node.url);

      realm.write(() => {
        each(nodes, node => {
          // If it's an existing node, just update properties.
          if (includes(existingUrls, node.url)) {
            realm.create("Node", node, true);
          } else {
            realm.create("Node", node);
          }
        });
      });
    }
  }
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
    return realm.objectForPrimaryKey("Wallet", id);
  }

  /**
   * Gets wallet data.
   *
   * @return {Realm.Results}
   */

  static get data() {
    return realm.objects("Wallet");
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
   * Updates error log.
   *
   * @method updateErrorLog
   * @param {object | array} payload
   */
  static updateErrorLog(payload) {
    realm.write(() => {
      if (isArray(payload)) {
        each(payload, value => Wallet.latestData.errorLog.push(value));
      } else {
        Wallet.latestData.errorLog.push(payload);
      }
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
        realm.create("Wallet", {
          version: Wallet.version,
          settings: { notifications: {}, quorum: {} },
          accountInfoDuringSetup: { meta: {} }
        })
      );
    }
  }

  static acceptTerms() {
    realm.write(() => {
      Wallet.latestSettings.acceptedTerms = true;
    });
  }

  static acceptPrivacyPolicy() {
    realm.write(() => {
      Wallet.latestSettings.acceptedPrivacy = true;
    });
  }

  static updateAccountInfoDuringSetup(payload) {
    realm.write(() => {
      const data = Wallet.latestData;
      data.accountInfoDuringSetup = assign(
        {},
        data.accountInfoDuringSetup,
        payload
      );
    });
  }

  static setOnboardingComplete() {
    realm.write(() => {
      Wallet.latestData.onboardingComplete = true;
    });
  }

  static updateErrorLog(payload) {
    realm.write(() => {
      if (isArray(payload)) {
        each(payload, value => Wallet.latestData.errorLog.push(value));
      } else {
        Wallet.latestData.errorLog.push(payload);
      }
    });
  }

  /**
   * Adds new account and removes temporarily stored account info during setup
   *
   * @method addAccount
   *
   * @param {object} accountData
   */
  static addAccount(accountData) {
    realm.write(() => {
      const data = Wallet.latestData;
      data.accountInfoDuringSetup = {
        name: "",
        meta: {},
        usedExistingSeed: false
      };
      realm.create("Account", accountData);
    });
  }
  /**
   * Updates remote proof of work setting.
   *
   * @method updateRemotePoWSetting
   * @param {boolean} payload
   */
  static updateRemotePowSetting(payload) {
    realm.write(() => {
      Wallet.latestSettings.remotePoW = payload;
    });
  }

  static updateQuorumConfig(payload) {
    console.log(payload);
    const existingConfig = Wallet.latestData.quorum;
    realm.write(() => {
      Wallet.latestData.quorum = assign({}, existingConfig, payload);
    });
  }

    /**
     * Updates autoNodeList setting
     *
     * @method updateAutoNodeListSetting
     *
     * @param {boolean} payload
     */
    static updateAutoNodeListSetting(payload) {
      realm.write(() => {
          Wallet.latestSettings.autoNodeList = payload;
      });
  }

  static updateCurrencyData(payload) {
    const { conversionRate, currency, availableCurrencies } = payload;
    realm.write(() => {
      Wallet.latestSettings.currency = currency;
      Wallet.latestSettings.conversionRate = conversionRate;
      Wallet.latestSettings.availableCurrencies = availableCurrencies;
    });
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
const migrateToNewStoragePath = config => {
  const oldRealm = new Realm(config);
  const walletData = oldRealm.objectForPrimaryKey(
    "Wallet",
    config.schemaVersion
  );

  const newRealm = new Realm(assign({}, config, { path: latestStoragePath }));

  newRealm.write(() => {
    if (!isEmpty(walletData)) {
      newRealm.create("Wallet", walletData);
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
const initialise = getEncryptionKeyPromise => {
  Realm = getRealm();

  return getEncryptionKeyPromise().then(encryptionKey => {
    let hasVersionZeroRealmAtDeprecatedPath = false;
    try {
      hasVersionZeroRealmAtDeprecatedPath =
        Realm.schemaVersion(getDeprecatedStoragePath(0), encryptionKey) !== -1;
    } catch (error) {}

    const versionZeroConfig = {
      encryptionKey,
      schemaVersion: 0,
      path: getDeprecatedStoragePath(0),
      schema: v_0Schema
    };
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
    } catch (error) {}

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
const reinitialise = getEncryptionKeyPromise =>
  purge().then(() => initialise(getEncryptionKeyPromise));

export {
  realm,
  Wallet,
  initialise,
  initialiseSync,
  reinitialise,
  Account,
  Node
};
