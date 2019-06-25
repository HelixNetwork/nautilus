import { ipcRenderer as ipc, clipboard, remote } from 'electron';
import electronSettings from 'electron-settings';
import keytar from 'keytar';
import Realm from '../Realm';

let onboardingSeed = null;
let onboardingGenerated = false;

const KEYTAR_SERVICE = remote.app.isPackaged ? 'Helix wallet' : 'Helix wallet (dev)';
/**
 * Global Electron helper for native support
 */
const Electron = {
    getVersion: () => {
        return 'hi';
    },

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
};

export default Electron;