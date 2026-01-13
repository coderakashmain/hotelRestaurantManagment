import axios from "axios";
import dotenv from "dotenv";
import { app, ipcMain, shell } from "electron";
import { saveLicense } from "./license";
import { getMachineId } from "./machine";
import { SignedLicense, verifyLicense } from "./verify";

dotenv.config();

const API_BASE =
  process.env.API_BASE || "http://localhost:3000/api";

export async function activateLicense(
  activationCode: string
): Promise<void> {
  const machineId = getMachineId();

  try {
    const res = await axios.post<SignedLicense>(
      `${API_BASE}/activate`,
      { activationCode, machineId }
    );

    if (!verifyLicense(res.data)) {
      throw new Error("INVALID_LICENSE_SIGNATURE");
    }
    

    saveLicense(res.data);
  } catch (error : any) {
  
     if (error.message === "INVALID_LICENSE_SIGNATURE") {
    throw error;
  }
  if (axios.isAxiosError(error)) {
    const msg =
      error.response?.data?.error ||
      "Activation failed. Invalid code.";

    throw new Error(msg);
  }
    throw new Error("ACTIVATION_FAILED");
  }
}

ipcMain.handle("activate-license", async (_event, code: string) => {
  try {

    await activateLicense(code);
    return { success: true };
  }  catch (err: any) {
    return { success: false, message: err.message };
  }
});

ipcMain.on("activation-success", () => {
  app.relaunch();
  app.exit(0);
});

ipcMain.on("buy-license", () => {
  shell.openExternal("https://our-payment-page.com");
});
