// import { app } from "electron";

// export const enableAutoStart = () => {
//   if (process.platform === "win32") {
//     app.setLoginItemSettings({
//       openAtLogin: true,
//       openAsHidden: true, // starts minimized
//     });

//     console.log("[AUTO-START] Enabled on Windows");
//   }
// };

import { app } from "electron";

export const enableAutoStart = async () => {
    if (process.platform === "win32") {
      // native fallback
      app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: true,
      });
      return;
    }
  
    // cross-platform
    const AutoLaunch = (await import("auto-launch")).default;
  
    const launcher = new AutoLaunch({
      name: "retrax",
      isHidden: true,
    });
  
    if (!(await launcher.isEnabled())) {
      await launcher.enable();
    }
  };
  
