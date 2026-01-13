import crypto from "crypto";
import fs from "fs";
import path from "path";
import { app } from "electron";
import { getMachineId } from "./machine";


function getPublicKeyPath(): string {
  if (app.isPackaged) {
    // Loaded from extraResources
    return path.join(process.resourcesPath, "public.pem");
  }

  // Dev mode (file lives in public/assets)
  return path.join(
    app.getAppPath(),
    "public",
    "assets",
    "public.pem"
  );
}

const publicKey: Buffer = fs.readFileSync(getPublicKeyPath());

export interface LicensePayload {
  machineId: string;
  expiry: string; // ISO date string
  [key: string]: unknown;
}

export interface SignedLicense {
  payload: LicensePayload;
  signature: string; // base64
}

export function verifyLicense(license: SignedLicense): boolean {
  try {
    const verify = crypto.createVerify("RSA-SHA256");

    // IMPORTANT: stable JSON order
    const payloadString = JSON.stringify(
      license.payload,
      Object.keys(license.payload).sort()
    );

    verify.update(payloadString);
    verify.end();

    const validSignature = verify.verify(
      publicKey,
      license.signature,
      "base64"
    );


    if (!validSignature) return false;

    // Machine binding
    if (license.payload.machineId !== getMachineId()) return false;

    // Expiry check
    if (license.payload.expiry) {
      if (new Date(license.payload.expiry) < new Date()) return false;
    }
    if (isClockTampered()) return false;



    return true;
  } catch (err) {
    console.error("License verification error:", err);
    return false;
  }
}

const TIME_PATH = path.join(app.getPath("userData"), "last_run.time");

export function isClockTampered(): boolean {
  const now = Date.now();

  if (fs.existsSync(TIME_PATH)) {
    const lastRun = Number(fs.readFileSync(TIME_PATH, "utf-8"));

    if (now < lastRun) {
      // Clock moved backwards 
      return true;
    }
  }

  // Save current time
  fs.writeFileSync(TIME_PATH, String(now), { mode: 0o600 });
  return false;
}
