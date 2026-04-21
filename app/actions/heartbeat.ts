// app/actions/heartbeat.ts
"use server";

import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function checkGatewayStatus() {
  try {
    // Ping gateway once with a 1s timeout
    const { stdout } = await execPromise(`ping -n 1 -w 1000 10.36.57.1`);
    return stdout.includes("Reply from");
  } catch {
    return false;
  }
}
