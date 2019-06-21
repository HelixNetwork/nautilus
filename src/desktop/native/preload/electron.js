import { ipcRenderer as ipc, clipboard, remote } from 'electron';

/**
 * Global Electron helper for native support
 */
const Electron = {
    getVersion:() =>{
        return 'hi';
    }
};

export default Electron;