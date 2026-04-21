// app/actions/cisco-diagnostics.ts
"use server";
import { executeCiscoCommand } from "./routers"; // Import your SSH logic

export async function runCiscoPing(targetIp: string) {
  // Cisco command: ping <ip> repeat 10
  const command = `ping ${targetIp} repeat 10`;
  const res = await executeCiscoCommand(command);

  if (!res.success) return { success: false, error: res.error };

  const output = res.data || "";
  
  // Basic Cisco Parsing logic
  const successRateMatch = output.match(/Success rate is (\d+) percent/);
  const rttMatch = output.match(/min\/avg\/max = (\d+)\/(\d+)\/(\d+) ms/);

  return {
    success: true,
    raw: output,
    loss: successRateMatch ? `${100 - parseInt(successRateMatch[1])}%` : "Unknown",
    average: rttMatch ? `${rttMatch[2]}ms` : "N/A",
    // Convert Cisco "!!!!!" into an array for your UI
    latencies: output.includes('!!!!') ? ["Stable Link Detected"] : ["Packet Loss Detected"],
  };
}
