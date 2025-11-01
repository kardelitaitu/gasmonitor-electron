import { contextBridge, ipcRenderer } from 'electron';
import { GasTrackerData } from './config'; // Import GasTrackerData

declare global {
  interface Window {
    api: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      getWindowSize: () => Promise<[number, number]>;
      getWindowContentSize: () => Promise<[number, number]>;
      resize: (options: { width: number, height: number }) => void;
      findLowestGasFee: () => Promise<GasTrackerData>; // Changed return type
    };
  }
}

contextBridge.exposeInMainWorld('api', {
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
  getWindowSize: () => ipcRenderer.invoke('get-window-size'),
  getWindowContentSize: () => ipcRenderer.invoke('get-window-content-size'),
  resize: (options: { width: number, height: number }) => ipcRenderer.send('resize-window', options),
  findLowestGasFee: () => ipcRenderer.invoke('find-lowest-gas-fee'), // No parameters
});