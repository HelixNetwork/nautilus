import { ipcRenderer as ipc, clipboard, remote } from 'electron';
import electronSettings from 'electron-settings';
import Realm from '../realm';
/**
 * Global Electron helper for native support
 */
const Electron = {
/**
 * Return Realm instance
 * @returns {Object} - Realm instance
 */
    getRealm: () => {
        return Realm;
    },
};

export default Electron;