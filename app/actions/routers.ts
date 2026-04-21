// app/actions/cisco.ts
"use server";

import { Client } from "ssh2";

interface CiscoResult {
  success: boolean;
  data?: string;
  error?: string;
}

export async function executeCiscoCommand(command: string): Promise<CiscoResult> {
  const allowed = ["show", "ping", "traceroute", "terminal"];
  const isAllowed = allowed.some(pref => command.toLowerCase().startsWith(pref));
  
  if (!isAllowed) {
    return { success: false, error: "Only 'show' and 'ping' commands are allowed for security." };
  }

  const conn = new Client();

  return new Promise((resolve) => {
    conn
      .on("ready", () => {
        // Cisco routers usually require a shell for interactive commands
        conn.exec(command, (err, stream) => {
          if (err) {
            resolve({ success: false, error: err.message });
            return;
          }

          let output = "";
          stream
            .on("close", (code: number) => {
              conn.end();
              resolve({ success: true, data: output });
            })
            .on("data", (data: Buffer) => {
              output += data.toString();
            })
            .stderr.on("data", (data: Buffer) => {
              output += data.toString();
            });
        });
      })
      .on("error", (err) => {
        resolve({ success: false, error: "Connection Failed: " + err.message });
      })
      .connect({
        host: process.env.CISCO_ROUTER_IP,
        port: 22,
        username: process.env.CISCO_USERNAME,
        password: process.env.CISCO_PASSWORD,
        // For older Cisco gear, you may need to add:
        // readyTimeout: 10000,
      });
  });
}
