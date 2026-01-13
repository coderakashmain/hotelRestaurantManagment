import { machineIdSync } from "node-machine-id";

export function getMachineId(): string {
  return machineIdSync(true);
}