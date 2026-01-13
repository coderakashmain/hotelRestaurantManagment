import fs from "fs";
import path from "path";
import { app } from "electron";

const TRIAL_FILE: string = path.join(app.getPath("userData"), "trial.json");
const TRIAL_DAYS = 15;

interface TrialData {
  machineId: string;
  trialStart: string; // ISO date string
}

export function initTrial(machineId: string): void {
  if (!fs.existsSync(TRIAL_FILE)) {
    const trialData: TrialData = {
      machineId,
      trialStart: new Date().toISOString(),
    };

    fs.writeFileSync(TRIAL_FILE, JSON.stringify(trialData, null, 2));
  }
}

export function isTrialValid(): boolean {
  if (!fs.existsSync(TRIAL_FILE)) return false;

  const raw = fs.readFileSync(TRIAL_FILE, "utf-8");
  const data: TrialData = JSON.parse(raw);

  const daysUsed =
    (Date.now() - new Date(data.trialStart).getTime()) / 86_400_000;
  
  return daysUsed <= TRIAL_DAYS;
}
