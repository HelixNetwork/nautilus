// import { ipcRenderer as ipc } from "electron";
import Electron from './electron';

// Define environment mode as Development
Electron.mode = 'dev';
// Disable default drag&drop
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

global.Electron = Electron;
