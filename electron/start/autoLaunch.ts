import { app } from "electron";

export const enableAutoStart = () => {
  if (process.platform === "win32") {
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true, // starts minimized
    });

    console.log("[AUTO-START] Enabled on Windows");
  }
};
