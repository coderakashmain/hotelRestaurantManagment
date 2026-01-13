import { ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('api', {
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
  },

  send: (channel: string, data?: any) => {
    ipcRenderer.send(channel, data);
  },

  invoke: (channel: string, ...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args);
  },

  loginAttempt: (data: { username: string; password: string }) => {
    ipcRenderer.send("login-attempt", data);
  },
  activateLicense: (code: string) => {
    return ipcRenderer.invoke("activate-license", code);
  },

  activationSuccess: () => {
    ipcRenderer.send("activation-success");
  },
  onActivationResult: (callback: any) => {
    ipcRenderer.removeAllListeners("activation-result");
    ipcRenderer.on("activation-result", (_event, result) => callback(result));
  },

  buyLicense: () => {
    ipcRenderer.send("buy-license");
  },


  //  Listen for login result from backend
  onLoginResult: (callback: (result: { success: boolean; message?: string }) => void) => {
    ipcRenderer.on("login-result", (_event, result) => callback(result));
  },
  loginSuccess: () => ipcRenderer.send('login-success'),

  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
});
