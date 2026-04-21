"use server";
import { prisma } from "@/lib/prisma";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function checkPingStatus(ip: string, lineId: string) {
  if (!ip || ip === "N/A") return { success: false, msg: "No IP" };

  try {
    // -c 1 for Linux/Mac, -n 1 for Windows. 
    // This example uses -n 1 for your Windows development environment.
    const command = process.platform === "win32" 
      ? `ping -n 1 -w 1000 ${ip}` 
      : `ping -c 1 -W 1 ${ip}`;

      const { stdout } = await execPromise(command);

      // Regex to extract latency (matches "time=12ms" or "time<1ms")
      const match = stdout.match(/time[=<]([\d\.]+)\s*ms/);
      const rtt = match ? match[1] : null;
  
      const result = { 
        success: true, 
        msg: "Online", 
        latency: rtt ? `${rtt} ms` : "N/A" 
      };

      // Save to History
      const history = await prisma.pingHistory.create({
        data: {
          status: result.success ? "Online" : "Offline",
          latency: result.latency,
          leasedLineId: lineId
        }
      });

      return { ...result, history };

  } catch (error) {
    return { success: false, msg: "Offline", latency: null };
  }
  
}

export async function getPingHistory(lineId: string) {
  return await prisma.pingHistory.findMany({
    where: { leasedLineId: lineId },
    orderBy: { timestamp: 'desc' },
    take: 5
  });
}


export async function runManualPing(ip: string, count: number = 10) {
  if (!ip) return { success: false, error: "IP required" };

  try {
    const isWindows = process.platform === "win32";
    // Windows: -n (count), -w (timeout). Linux: -c (count), -W (timeout)
    const command = isWindows 
      ? `ping -n ${count} -w 1000 ${ip}` 
      : `ping -c ${count} -W 1 ${ip}`;

    const { stdout } = await execPromise(command);

    // 1. Extract individual latencies for the history/summary
    const matches = Array.from(stdout.matchAll(/time[=<]([\d\.]+)\s*ms/g));
    const latencies = matches.map(m => `${m[1]} ms`);

    // 2. Extract Average Latency from the summary line
    const avgMatch = stdout.match(/Average = ([\d\.]+)ms/) || stdout.match(/avg\/max\/mdev = [\d\.]+\/([\d\.]+)/);
    const average = avgMatch ? `${avgMatch[1]} ms` : "N/A";

    // 3. Check for packet loss
    const lostMatch = stdout.match(/(\d+)% packet loss/) || stdout.match(/Lost = (\d+)/);
    const loss = lostMatch ? `${lostMatch[1]}%` : "Unknown";

    return {
      success: true,
      latencies,
      average,
      loss,
      raw: stdout
    };
  } catch (error: any) {
    return { success: false, error: "Destination unreachable or timed out." };
  }
}
