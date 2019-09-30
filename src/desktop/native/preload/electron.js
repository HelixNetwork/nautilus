import { ipcRenderer as ipc, clipboard, remote } from "electron";
import { indexToChar } from "libs/hlx/converter";
import { getChecksum as checksum } from "libs/hlx/utils";

import electronSettings from "electron-settings";
import keytar from "keytar";
import Realm from "../realm";
import helixTangled from '../helixTangled';
import fs from "fs";
import { formatHlx } from "libs/hlx/utils";
const dialog = require("electron").remote.dialog;
const kdbx = require("../kdbx");
const argon2 = require("argon2");
let onboardingSeed = null;
let onboardingGenerated = false;
let onboardingName = null;

const KEYTAR_SERVICE = remote.app.isPackaged
  ? "Nautilus wallet"
  : "Nautilus wallet (dev)";

const capitalize = string => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

let locales = {
  multipleTx: "You received multiple transactions to {{account}}",
  valueTx: "You received {{value}} to {{account}}",
  messageTx: "You received a message to {{account}}",
  confirmedIn: "Incoming {{value}} transaction was confirmed at {{account}}",
  confirmedOut: "Outgoing {{value}} transaction was confirmed at {{account}}"
};

/**
 * Global Electron helper for native support
 */
const Electron = {
  getRealm: () => {
    return Realm;
  },

  getUserDataPath: () => {
    return remote.app.getPath("userData");
  },

  /**
   * Set clipboard value, in case of Seed array, trigger Garbage Collector
   * @param {string|array} Content - Target content
   * @returns {undefined}
   */
  clipboard: content => {
    if (content) {
      const clip =
        typeof content === "string"
          ? content
          : Array.from(content)
              .map(byte => indexToChar(byte))
              .join("");
      clipboard.writeText(clip);
      if (typeof content !== "string") {
        global.gc();
      }
    } else {
      clipboard.clear();
    }
  },

    /**
     * Do Proof of Work
     * @param {boolean} batchedPow - Should return batched PoW function
     * @returns {function} Proof of Work
     */
    getPowFn: (batchedPow) => {
      return batchedPow ? helixTangled.batchedPowFn : helixTangled.powFn;
  },

  /**
   * Generate address
   * @param {array} seed - Input seed
   * @param {number} index - Address index
   * @param {number} security - Address generation security level
   * @param {total} total - Amount of addresses to generate
   * @returns {string} Generated address
   */
  genFn: async (seed, index, security, total) => {
      if (!total || total === 1) {
          return await helixTangled.genFn(seed, index, security);
      }

      const addresses = [];

      for (let i = 0; i < total; i++) {
          const address = await helixTangled.genFn(seed, index + i, security);
          addresses.push(address);
      }

      return addresses;
  },


  /**
   * Get keychain account entry by account name
   * @param accountName - Target account name
   * @returns {promise} Promise resolves in account object
   */
  readKeychain: accountName => {
    return keytar.getPassword(KEYTAR_SERVICE, accountName);
  },

  /**
   * Set keychain account entry by account name
   * @param accountName - Target account name
   * @param content - Target account content
   * @returns {promise} Promise resolves in success boolean
   */
  setKeychain: (accountName, content) => {
    return keytar.setPassword(KEYTAR_SERVICE, accountName, content);
  },

  /**
   * Get all keychain account entries
   * @returns {promise} Promise resolves in an Array of entries
   */
  listKeychain: () => {
    return keytar.findCredentials(KEYTAR_SERVICE);
  },

  /**
   * Remove keychain account by account name
   * @param accountName - Target account name
   * @returns {promise} Promise resolves in a success boolean
   */
  removeKeychain: accountName => {
    return keytar.deletePassword(KEYTAR_SERVICE, accountName);
  },

  /**
   * Set onboarding seed variable to bypass Redux
   * @param {array} Seed - Target seed txByte array
   * @param {boolean} isGenerated - Is the seed generated using Helix
   * @returns {undefined}
   */
  setOnboardingSeed: (seed, isGenerated) => {
    onboardingSeed = seed;
    onboardingGenerated = isGenerated ? true : false;
  },

  /**
   * Get onboarding seed value
   * @returns {array} Onboarding seed value
   */
  getOnboardingSeed: () => {
    return onboardingSeed;
  },
  /**
   * Set onboarding account name
   * @param {string} name - Onboarding account name
   * @returns {undefined}
   */
  setOnboardingName: name => {
    onboardingName = name;
  },
  /**
   * Get onboarding account name
   * @returns {array} Onboarding account name
   */
  getOnboardingName: () => {
    return onboardingName;
  },

  /**
   * Get all local storage items
   * @returns {object} Storage items
   */
  getAllStorage() {
    const storage = electronSettings.getAll();
    const data = {};

    Object.entries(storage).forEach(
      ([key, value]) =>
        key.indexOf("reduxPersist") === 0 &&
        Object.assign(data, { [key.split(":")[1]]: JSON.parse(value) })
    );
    return data;
  },

  /**
   * Focus main wallet window
   */
  focus: view => {
    ipc.send("window.focus", view);
  },

  /**
   * Export SeedVault file
   * @param {array} - Seed object array
   * @param {string} - Plain text password to use for SeedVault
   * @returns {undefined}
   */
  exportSeeds: async (seeds, password) => {
    try {
      const content = await kdbx.exportVault(seeds, password);
      const now = new Date();
      const path = await dialog.showSaveDialog(remote.getCurrentWindow(), {
        title: "Export keyfile",
        defaultPath: `seedvault-${now
          .toISOString()
          .slice(0, 16)
          .replace(/[-:]/g, "")
          .replace("T", "-")}.kdbx`,
        buttonLabel: "Export",
        filters: [{ name: "SeedVault File", extensions: ["kdbx"] }]
      });
      if (!path) {
        throw Error("Export cancelled");
      }
      fs.writeFileSync(path, new Buffer(content));
      return false;
    } catch (error) {
      return error.message;
    }
  },

  /**
   * Decrypt SeedVault file
   * @param {buffer} buffer - SeedVault file content
   * @param {string} - Plain text password for SeedVailt decryption
   * @returns {array} Seed object array
   */
  importSeed: async (buffer, password) => {
    const seeds = await kdbx.importVault(buffer, password);
    return seeds;
  },

  /**
   * Set native menu and notification locales
   * @param {function} t - i18n locale helper
   * @returns {undefiend}
   */
  changeLanguage: t => {
    ipc.send("menu.language", {
      about: t("settings:aboutHelix"),
      errorLog: t("notificationLog:errorLog"),
      checkUpdate: t("checkForUpdates"),
      sendFeedback: "Send feedback",
      settings: capitalize(t("home:settings")),
      accountSettings: t("settings:accountManagement"),
      accountName: t("addAdditionalSeed:accountName"),
      viewSeed: t("accountManagement:viewSeed"),
      viewAddresses: t("accountManagement:viewAddresses"),
      tools: t("accountManagement:tools"),
      newAccount: t("accountManagement:addNewAccount"),
      language: t("languageSetup:language"),
      node: t("node"),
      currency: t("settings:currency"),
      theme: t("settings:theme"),
      changePassword: t("settings:changePassword"),
      advanced: t("settings:advanced"),
      hide: t("settings:hide"),
      hideOthers: t("settings:hideOthers"),
      showAll: t("settings:showAll"),
      quit: t("settings:quit"),
      edit: t("settings:edit"),
      undo: t("settings:undo"),
      redo: t("settings:redo"),
      cut: t("settings:cut"),
      copy: t("settings:copy"),
      paste: t("settings:paste"),
      selectAll: t("settings:selectAll"),
      account: t("account"),
      balance: capitalize(t("home:balance")),
      send: capitalize(t("home:send")),
      receive: capitalize(t("home:receive")),
      history: capitalize(t("home:history")),
      logout: t("settings:logout"),
      help: t("help"),
      logoutConfirm: t("logoutConfirmationModal:logoutConfirmation"),
      yes: t("yes"),
      no: t("no"),
      updates: {
        errorRetrievingUpdateData: t("updates:errorRetrievingUpdateData"),
        noUpdatesAvailable: t("updates:noUpdatesAvailable"),
        noUpdatesAvailableExplanation: t(
          "updates:noUpdatesAvailableExplanation"
        ),
        newVersionAvailable: t("updates:newVersionAvailable"),
        newVersionAvailableExplanation: t(
          "updates:newVersionAvailableExplanation"
        ),
        installUpdate: t("updates:installUpdate"),
        installUpdateExplanation: t("updates:installUpdateExplanation")
      }
    });

    locales = {
      multipleTx: t("notifications:multipleTx", { account: "{{account}}" }),
      valueTx: t("notifications:valueTx", {
        account: "{{account}}",
        value: "{{value}}"
      }),
      messageTx: t("notifications:messageTx", {
        account: "{{account}}",
        value: "{{value}}"
      }),
      confirmedIn: t("notifications:confirmedIn", {
        account: "{{account}}",
        value: "{{value}}"
      }),
      confirmedOut: t("notifications:confirmedOut", {
        account: "{{account}}",
        value: "{{value}}"
      })
    };
  },

  getOnboardingGenerated: () => {
    return onboardingGenerated;
  },

  /**
   * Hash input using argon2
   * @param {Uint8Array} input - Input data
   * @param {Uint8Array} salt - Salt used fro hashing
   * @returns {Uint8Array} Raw Argon2 hash
   */
  argon2: (input, salt) => {
    return argon2.hash(input, {
      raw: true,
      salt: Buffer.from(salt)
    });
  },

  /**
   * Get currrent operating system
   * @returns {string} Operating system code - win32|linux|darwin
   */
  getOS: () => {
    return process.platform;
  },

  /**
   * Get currrent release number
   * @returns {string}
   */
  getVersion: () => {
    return version;
  },

  garbageCollect: () => {
    global.gc();
  },

  /**
   * Add native window wallet event listener
   * @param {string} event - Target event name
   * @param {function} callback - Event trigger callback
   * @returns {undefined}
   */
  onEvent: function(event, callback) {
    let listeners = this._eventListeners[event];
    if (!listeners) {
      listeners = this._eventListeners[event] = [];
      ipc.on(event, (e, args) => {
        listeners.forEach(call => {
          call(args);
        });
      });
    }
    listeners.push(callback);
  },
  /**
   * Remove native window wallet event listener
   * @param {string} event - Target event name
   * @param {function} callback - Event trigger callback
   * @returns {undefined}
   */
  removeEvent: function(event, callback) {
    const listeners = this._eventListeners[event];
    listeners.forEach((call, index) => {
      if (call === callback) {
        listeners.splice(index, 1);
      }
    });
  },

  _eventListeners: {},

  /**
   * Remove all local storage items
   * @returns {undefined}
   */
  clearStorage() {
    const keys = electronSettings.getAll();
    Object.keys(keys).forEach(key => this.removeStorage(key));
  },

  /**
   * Reload Wallet window to initial location
   * @returns {undefined}
   */
  reload: () => {
    remote.getCurrentWindow().webContents.goToIndex(0);
  },

  /**
   * Calculate seed checksum
   * @param {array} bytes - Target seed byte array
   * @returns {string | array} Seed checksum
   */
  getChecksum: async bytes => {
    let txBytes = "";
    for (let i = 0; i < bytes.length; i++) {
      txBytes = txBytes.concat(indexToChar(bytes[i]));
    }
    const final_checksum = await checksum(txBytes);
    return final_checksum;
  },
 /**
     * Set local storage item by item key
     * @param {string} Key - Target item key
     * @param {any} Storage - Target item value
     * @returns {boolean} If item update is succesfull
     */
    setStorage(key, item) {
      return electronSettings.set(key, item);
  },

  /**
   * Remove local storage item by item key
   * @param {string} Key - Target item key
   * @returns {boolean} If item removal is succesfull
   */
  removeStorage(key) {
      return electronSettings.delete(key);
  },
  /**
   * Proxy native menu attribute settings
   * @param {string} Attribute - Target attribute
   * @param {any} Value - Target attribute value
   * @returns {undefined}
   */
  updateMenu: (attribute, value) => {
    ipc.send("menu.update", {
      attribute: attribute,
      value: value
    });
  },

  /**
   * Trigger auto update
   * @returns {undefined}
   */
  autoUpdate: () => {
    ipc.send("updates.check");
  },

  /**
     * Create and show a native notification based on new transactions
     * @param {string} accountName - target account name
     * @param {array} transactions - new transactions
     * @param {array} confirmations - recently confirmed transactions
     * @param {object} settings - wallet settings
     */
  notify: (accountName, transactions, confirmations, settings) => {
      if (!transactions.length && !confirmations.length) {
          return;
      }

      if (!settings.notifications || !settings.notifications.general) {
          return;
      }

      let message = '';

      if (transactions.length > 1) {
          message = locales.multipleTx;
      } else if (transactions.length && transactions[0].transferValue === 0) {
          if (!settings.notifications.messages) {
              return;
          }
          message = locales.messageTx;
      } else if (transactions.length) {
          message = locales.valueTx.replace('{{value}}', formatHlx(transactions[0].transferValue));
      } else if (settings.notifications.confirmations) {
          message = confirmations[0].incoming ? locales.confirmedIn : locales.confirmedOut;
          message = message.replace('{{value}}', formatHlx(confirmations[0].transferValue));
      }

      const notification = new Notification('Trinity', {
          body: message.replace('{{account}}', accountName),
      });

      notification.onclick = () => {
          remote.getCurrentWindow().webContents.send('account.switch', accountName);
      };
  },
};

export default Electron;
