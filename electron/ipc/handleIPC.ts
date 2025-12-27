import { ipcMain } from "electron";

export function handleIPC(
  channel: string,
  handler: (...args: any[]) => any
) {
  ipcMain.handle(channel, async (_event, ...args) => {
    try {
      return await handler(...args);
    } catch (err: any) {
      return {
        error: err?.message || "Internal error",
      };
    }
  });
}
