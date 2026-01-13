import axios from "axios";
import dotenv from "dotenv";
import { getMachineId } from "./machine";
import { initTrial, isTrialValid } from "./trial";
import { licenseExists, loadLicense } from "./license";
import { isClockTampered, verifyLicense } from "./verify";

dotenv.config();

const API_BASE: string =
  process.env.API_BASE || "http://localhost:3000/api";

export type LicenseStatus =
  | "LICENSED"
  | "TRIAL"
  | "ACTIVATION_REQUIRED";

export async function licensingCheck(): Promise<LicenseStatus> {
  const machineId = getMachineId();
  isClockTampered();
  // 1️ Local license (offline fast-path)
  if (licenseExists()) {
    const license = loadLicense();
    if (license && verifyLicense(license)) {
      return "LICENSED";
    }
  }

 
     
  // 2️ Ask server for machine status
  try {
    const res = await axios.post(`${API_BASE}/machine/status`, {
      machineId,
    });


 

   
    // 3️ Not registered → register + start trial
    if (!res.data.registered) {
      await axios.post(`${API_BASE}/register-machine`, {
        machineId,
        os: process.platform,
        appVersion: "1.0.0",
      });

      return "TRIAL";
    }
    
  } catch (err: any) {
    console.error(" AXIOS ERROR IN LICENSING CHECK:", {
      message: err.message,
      code: err.code,
      response: err.response?.data,
    });

    
  }

  initTrial(machineId);

  
  if (isTrialValid()) {
    return "TRIAL";
    // return "TRIAL";
  }

  // 5️ Trial expired
  return "ACTIVATION_REQUIRED";
}
