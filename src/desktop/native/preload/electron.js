import { ipcRenderer as ipc, clipboard, remote } from 'electron';
import electronSettings from 'electron-settings';
import keytar from 'keytar';
import Realm from '../realm';
import fs from 'fs';
const dialog = require('electron').remote.dialog;
const kdbx = require('../kdbx');
let onboardingSeed = null;
let onboardingGenerated = false;
let onboardingName = null;

const KEYTAR_SERVICE = remote.app.isPackaged ? 'Helix wallet' : 'Helix wallet (dev)';

const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

let locales = {
    multipleTx: 'You received multiple transactions to {{account}}',
    valueTx: 'You received {{value}} to {{account}}',
    messageTx: 'You received a message to {{account}}',
    confirmedIn: 'Incoming {{value}} transaction was confirmed at {{account}}',
    confirmedOut: 'Outgoing {{value}} transaction was confirmed at {{account}}',
};

/**
 * Global Electron helper for native support
 */
const Electron = {

    getRealm: () => {
        return Realm;
    },

    getUserDataPath: () => {
        return remote.app.getPath('userData');
    },

    /**
     * Get keychain account entry by account name
     * @param accountName - Target account name
     * @returns {promise} Promise resolves in account object
     */
    readKeychain: (accountName) => {
        console.log("account",accountName);
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
     * Remove keychain account by account name
     * @param accountName - Target account name
     * @returns {promise} Promise resolves in a success boolean
     */
    removeKeychain: (accountName) => {
        return keytar.deletePassword(KEYTAR_SERVICE, accountName);
    },

    /**
    * Set onboarding seed variable to bypass Redux
    * @param {array} Seed - Target seed byte array
    * @param {boolean} isGenerated - Is the seed generated using Trinity
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
    setOnboardingName: (name) => {
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
                key.indexOf('reduxPersist') === 0 && Object.assign(data, { [key.split(':')[1]]: JSON.parse(value) }),
        );
        return data;
    },

    /**
     * Focus main wallet window
     */
    focus: (view) => {
        ipc.send('window.focus', view);
    },

    /**
     * Export SeedVault file
     * @param {array} - Seed object array
     * @param {string} - Plain text password to use for SeedVault
     * @returns {undefined}
     */
    exportSeeds: async (seeds, password) => {
        console.log(seeds);
        try {
            const content = await kdbx.exportVault(seeds, password);
            const now = new Date();
            const path = await dialog.showSaveDialog(remote.getCurrentWindow(), {
                title: 'Export keyfile',
                defaultPath: `seedvault-${now
                    .toISOString()
                    .slice(0, 16)
                    .replace(/[-:]/g, '')
                    .replace('T', '-')}.kdbx`,
                buttonLabel: 'Export',
                filters: [{ name: 'SeedVault File', extensions: ['kdbx'] }],
            });
            if (!path) {
                throw Error('Export cancelled');
            }
            fs.writeFileSync(path, new Buffer(content));
            return false;
        } catch (error) {
            console.log("CONTENTError===", error);
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
    changeLanguage: (t) => {
        ipc.send('menu.language', {
            about: t('settings:aboutTrinity'),
            errorLog: t('notificationLog:errorLog'),
            checkUpdate: t('checkForUpdates'),
            sendFeedback: 'Send feedback',
            settings: capitalize(t('home:settings')),
            accountSettings: t('settings:accountManagement'),
            accountName: t('addAdditionalSeed:accountName'),
            viewSeed: t('accountManagement:viewSeed'),
            viewAddresses: t('accountManagement:viewAddresses'),
            tools: t('accountManagement:tools'),
            newAccount: t('accountManagement:addNewAccount'),
            language: t('languageSetup:language'),
            node: t('node'),
            currency: t('settings:currency'),
            theme: t('settings:theme'),
            changePassword: t('settings:changePassword'),
            advanced: t('settings:advanced'),
            hide: t('settings:hide'),
            hideOthers: t('settings:hideOthers'),
            showAll: t('settings:showAll'),
            quit: t('settings:quit'),
            edit: t('settings:edit'),
            undo: t('settings:undo'),
            redo: t('settings:redo'),
            cut: t('settings:cut'),
            copy: t('settings:copy'),
            paste: t('settings:paste'),
            selectAll: t('settings:selectAll'),
            account: t('account'),
            balance: capitalize(t('home:balance')),
            send: capitalize(t('home:send')),
            receive: capitalize(t('home:receive')),
            history: capitalize(t('home:history')),
            logout: t('settings:logout'),
            help: t('help'),
            logoutConfirm: t('logoutConfirmationModal:logoutConfirmation'),
            yes: t('yes'),
            no: t('no'),
            updates: {
                errorRetrievingUpdateData: t('updates:errorRetrievingUpdateData'),
                noUpdatesAvailable: t('updates:noUpdatesAvailable'),
                noUpdatesAvailableExplanation: t('updates:noUpdatesAvailableExplanation'),
                newVersionAvailable: t('updates:newVersionAvailable'),
                newVersionAvailableExplanation: t('updates:newVersionAvailableExplanation'),
                installUpdate: t('updates:installUpdate'),
                installUpdateExplanation: t('updates:installUpdateExplanation'),
            },
        });

        locales = {
            multipleTx: t('notifications:multipleTx', { account: '{{account}}' }),
            valueTx: t('notifications:valueTx', { account: '{{account}}', value: '{{value}}' }),
            messageTx: t('notifications:messageTx', { account: '{{account}}', value: '{{value}}' }),
            confirmedIn: t('notifications:confirmedIn', { account: '{{account}}', value: '{{value}}' }),
            confirmedOut: t('notifications:confirmedOut', { account: '{{account}}', value: '{{value}}' }),
        };
    },

    getOnboardingGenerated: () => {
        return onboardingGenerated;
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
};

export default Electron;