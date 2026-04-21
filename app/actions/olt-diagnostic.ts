// app/actions/olt-diagnostic.ts
"use server";

import { prisma } from "@/lib/prisma";
import { exec } from "child_process";
import { promisify } from "util";
import { executeCiscoCommand } from "./routers"; // Your existing SSH logic
import { revalidatePath } from "next/cache";

const execPromise = promisify(exec);




/**
 * Helper to ping an IP locally using Windows CMD
 */
async function localPing(ip: string) {
  try {
    // -n 1: Send 1 packet
    // -w 1000: Wait 1 second for timeout
    const { stdout } = await execPromise(`ping -n 1 -w 1000 ${ip}`);
    
    // Parse Windows Ping Output
    const isSuccess = stdout.includes("Reply from");
    const latencyMatch = stdout.match(/time[=<](\d+)ms/);
    const latency = latencyMatch ? `${latencyMatch[1]}ms` : "N/A";

    return {
      success: isSuccess,
      latency: latency
    };
  } catch (error) {
    return { success: false, latency: "Timeout" };
  }
}

export async function pingAllOlts() {
  // Fetch OLTs from database
  const olts = await prisma.olt.findMany({ 
    select: { ip: true, id: true, name: true } 
  });
  
  const results = [];
  
  // Local pings are faster than SSH, but we still loop to prevent 
  // massive CPU spikes if you have hundreds of OLTs.
  for (const olt of olts) {
    const res = await localPing(olt.ip);

    //Update DB status
    await prisma.olt.update({
      where: {id: olt.id},
      data:{ status: res.success }
    })
    
    results.push({
      id: olt.id,
      name: olt.name,
      success: res.success,
      latency: res.latency
    });
  }

  // Clear cache for the dashboard and inventory pages
  revalidatePath("/olt/dashboard");
  revalidatePath("/olt/manage");

  return results;
}


export async function runOltDiagnostic(ip: string, mode: "local" | "router") {
  if (mode === "router") {
    // 1. Cisco SSH Ping
    const command = `ping ${ip} repeat 5`;
    const res = await executeCiscoCommand(command);
    if (!res.success) return { success: false, error: res.error };
    
    const output = res.data || "";
    const successRate = output.match(/Success rate is (\d+) percent/);
    const rtt = output.match(/min\/avg\/max = (\d+)\/(\d+)\/(\d+) ms/);

    return {
      success: true,
      mode: "router",
      loss: successRate ? `${100 - parseInt(successRate[1])}%` : "Unknown",
      latency: rtt ? `${rtt[2]}ms` : "N/A",
      raw: output
    };
  } else {
    // 2. Local Windows Ping
    try {
      const { stdout } = await execPromise(`ping -n 5 ${ip}`);
      const isSuccess = stdout.includes("Reply from");
      const latencyMatch = stdout.match(/Average = (\d+)ms/);
      const lossMatch = stdout.match(/(\d+)% loss/);

      return {
        success: isSuccess,
        mode: "local",
        loss: lossMatch ? `${lossMatch[1]}%` : "0%",
        latency: latencyMatch ? `${latencyMatch[1]}ms` : "N/A",
        raw: stdout
      };
    } catch (error) {
      return { success: false, error: "Local host could not reach the IP." };
    }
  }
}