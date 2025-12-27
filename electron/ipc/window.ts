import { ipcMain, BrowserWindow } from "electron"

ipcMain.on('window-minimize', () => {
  BrowserWindow.getFocusedWindow()?.minimize()
})

ipcMain.on('window-maximize', () => {
  const win = BrowserWindow.getFocusedWindow()
  if (!win) return
  win.isMaximized() ? win.unmaximize() : win.maximize()
})

ipcMain.on('window-close', () => {
  BrowserWindow.getFocusedWindow()?.close()
})
