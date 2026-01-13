import fs from "fs";
import path from "path";
import { app } from "electron";
import { SignedLicense } from "./verify";

const LICENSE_PATH = path.join(app.getPath("userData"), "license.elec");

export function saveLicense(license: SignedLicense): void {
  fs.writeFileSync(LICENSE_PATH, JSON.stringify(license, null, 2), {
  mode: 0o600
});
}

export function loadLicense(): SignedLicense | null {
  if (!fs.existsSync(LICENSE_PATH)) return null;

  try {
    const raw = fs.readFileSync(LICENSE_PATH, "utf-8");
    return JSON.parse(raw) as SignedLicense;
  } catch {
    return null;
  }
}

export function licenseExists(): boolean {
  return fs.existsSync(LICENSE_PATH);
}
