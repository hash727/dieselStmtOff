// app/actions/olt-management.ts
"use server";

import { prisma } from "@/lib/prisma";
import { executeSshCommand } from "@/lib/ssh-client";
import { executeTelnetCommand } from "@/lib/telnet-client";
import { OLT_COMMAND_MAP } from "@/lib/olt-commands";
import { decrypt } from "@/lib/encryption";
import { parseAlphionServices, 
         parseNetlinkOnuDeepDiagnostics, 
         parseNetlinkOnuInfo, 
         parseNetlinkOnuStates, 
         parseNetlinkPortRunningConfigs, 
         parseNetlinkSfpMetrics, 
         parseOltOutput, 
         parseSyrotechChassisHUD, 
         parseSyrotechOpmDiag, 
         parseSyrotechPortOnus,
         parseSyrotechPortRunningConfigs
} from "@/lib/olt-parser";

export async function getOltOnuDetails(oltId: string) {
  const olt = await prisma.olt.findUnique({ where: { id: oltId } });
  if (!olt) return { success: false, error: "OLT record not found." };

  const decryptedPassword = olt.sshPassword ? decrypt(olt.sshPassword) : "";
  const username = olt.sshUsername || "admin";
  const vendor = olt.make as keyof typeof OLT_COMMAND_MAP;
  const config = OLT_COMMAND_MAP[vendor];
  
  const showCommand = config?.showOnu || "show pon all onu state";
  const termCommand = config?.terminalLength0 || "";

  try {
    let rawData = "";

    if (olt.protocol === "TELNET") {
      const res = await executeTelnetCommand(olt.ip, showCommand, username, decryptedPassword);
      if (!res.success) return res;
      rawData = res.data || "";
    } else {
      // 1. Combine commands for SSH
      const finalCommand = termCommand ? `${termCommand} && ${showCommand}` : showCommand;

      // 2. WAIT for the full SSH buffer
      const res = await executeSshCommand(olt.ip, username, decryptedPassword, finalCommand);
      
      if (!res.success || !res.data) {
        return { success: false, error: res.error || "No data received from SSH" };
      }

      rawData = res.data;
    }

    // 3. SERVER-SIDE LOG: Check if rawData actually has content here
    console.log(`[SERVER] Received ${rawData.length} bytes from ${olt.name}`);

    // 4. SAFER SANITIZATION: Prevents wiping out the string if regex fails
    const sanitizedRaw = rawData
      .replace(/[^\x20-\x7E\r\n]/g, "") // Keep printable ASCII + line breaks
      .replace(/--More--/g, "");

    // 5. PARSE DATA
    const customers = parseOltOutput(sanitizedRaw, olt.make);
    console.log(`[SERVER] Parsed ${customers.length} customers in OLT Make: ${olt.make}.`);

    // 6. SERIALIZABLE RETURN
    return {
      success: true,
      data: JSON.parse(JSON.stringify(customers)), // Ensure it's a plain object
      raw: sanitizedRaw || "Data arrived but was not displayable."
    };
    
  } catch (err: any) {
    console.error(`[NOC ERROR] ${olt.name}:`, err.message);
    return { success: false, error: `NOC Bridge Failure: ${err.message}` };
  }
}

export async function getOltPowerDetails(oltId: string, pon: string) {
  const olt = await prisma.olt.findUnique({ where: { id: oltId } });
  if (!olt) return { success: false, error: "OLT not found" };

  const decryptedPassword = olt.sshPassword ? decrypt(olt.sshPassword) : "";
  const username = olt.sshUsername || "admin";
  const vendor = olt.make as keyof typeof OLT_COMMAND_MAP;
  const config = OLT_COMMAND_MAP[vendor];
  // const config = OLT_COMMAND_MAP[olt.make as keyof typeof OLT_COMMAND_MAP];
  // const powerCmd = config?.showPower || "show pon all onu optics";
  const powerCmd = `show onu ${pon} power levels`;

  try {
    const res = await executeSshCommand(olt.ip, username, decryptedPassword, powerCmd);
    if (!res.success) return { success: false, error: res.error, data: {} };

    // Parse logic for Alphion Optics table
    // Expects: 1/1  APHN...  -19.50 (Rx)  2.10 (Tx)
    const lines = res.data?.split(/\r?\n/) || [];
    const powerMap: Record<string, string> = {};

    lines.forEach(line => {
      // REGEX EXPLANATION:
      // ^(\d+\/\d+) -> Matches "1/1" at the start of the line
      // \s+         -> Matches spaces
      // (-?\d+)     -> Matches "-27" (The ONU-Rx value)
      const match = line.trim().match(/^(\d+\/\d+)\s+(-?\d+)/);
      if (match) {
        const ponIndex = match[1]; // e.g. "1/1"
        const rxPower = match[2];  // e.g. "-27"
        powerMap[ponIndex] = `${rxPower} dBm`;
      }
    });

    return { success: true, data: powerMap };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getOnuServices(oltId: string, onuId: string) {
  const olt = await prisma.olt.findUnique({ where: { id: oltId } });
  if (!olt) return { success: false, error: "OLT not found" };

  const decryptedPassword = olt.sshPassword ? decrypt(olt.sshPassword) : "";
  const username = olt.sshUsername || "admin";
  // const command = `config t && show onu ${onuId} optical_info && show onu ${onuId} distance`;
  const command = `show onu ${onuId} service all`

  try {
    const res = await executeSshCommand(olt.ip, username, decryptedPassword, command);
    if (!res.success) return res;

    console.log("GETONUSERVices: ", res);

    const parsed = parseAlphionServices(res.data || "");
    return { success: true, data: parsed, raw: res.data }; // Return both
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


export async function getNetlinkOnuPower(oltId: string, portId: string, onuIndexes: string[]) {
  const olt = await prisma.olt.findUnique({ where: { id: oltId } });
  if (!olt) return { success: false, error: "OLT not found" };

  const pass = olt.sshPassword ? decrypt(olt.sshPassword) : "";
  const user = olt.sshUsername || "admin";

  // 1. Build the massive command chain
  // Entering config and interface once, then running all 'show' commands
  let commandLines = [
    "configure t",
    `interface gpon 0/${portId}`
  ];

  // Add a 'show' line for every ONU index provided
  onuIndexes.forEach(idx => {
    commandLines.push(`show pon rx_power onu ${idx}`);
  });

  commandLines.push("exit", "exit");

  try {
    const finalCommand = commandLines.join("\n");
    const res = await executeTelnetCommand(olt.ip, finalCommand, user, pass);
    
    if (!res.success) return res;

    // 2. Parse the giant block of responses
    const powerMap: Record<string, string> = {};
    const lines = res.data?.split(/\r?\n/) || [];
    
    lines.forEach(line => {
      const row = line.trim();

      // Skip empty spaces, boundaries, and table title fields
      if (!row || row.includes("---") || row.toLowerCase().includes("power") || row.toLowerCase().includes("pon")) return;

      /**
       * PARSER MATCH LOGIC FOR:
       * 1       2       -25.850dBm
       * 
       * Regex Breakdown:
       * ^(\d+)         -> Group 1: PON Port Number (e.g. 1)
       * \s+            -> Table Space gaps
       * (\d+)          -> Group 2: ONU Index Number (e.g. 2)
       * \s+            -> Table Space gaps
       * (-?\d+\.?\d*)  -> Group 3: Rx Power level (captures negative sign, digits, and decimals like -25.850)
       * (?:dBm)?       -> Explicitly match and ignore the static trailing string units
       */
      const match = row.match(/^(\d+)\s+(\d+)\s+(-?\d+\.?\d*)(?:dBm)?/i);

      if (match) {
        const localOnuId = match[2]; // Extracts "2"
        const powerValue = match[3]; // Extracts "-25.850"
        
        // Key directly with the unique Flat index identifier string
        powerMap[localOnuId] = `${powerValue} dBm`;
      }
    });

    return { 
      success: true, 
      data: powerMap 
    };
  } catch (err: any) {
    console.error(`[NOC BULK SCAN ERROR] ${olt.ip}:`, err.message);
    return { success: false, error: err.message, data: {} };
  }
}


export async function getNetlinkInventory(oltId: string, portId: string) {
  const olt = await prisma.olt.findUnique({ where: { id: oltId } });
  if (!olt) return { success: false, error: "OLT not found" };

  const pass = olt.sshPassword ? decrypt(olt.sshPassword) : "";
  const user = olt.sshUsername || "admin";

  // Netlink sequence: Enter config -> Run command -> Exit
  const command = [
    "configure t",
    `show onu info ${portId}`,
    "exit"
  ].join("\n");

  try {
    console.log(`[NOC] Fetching Netlink Port ${portId}...`);
    const res = await executeTelnetCommand(olt.ip, command, user, pass);
    
    if (!res.success) return res;

    console.log(res);

    // Use the specific Info Parser for the AuthInfo table
    const customers = parseNetlinkOnuInfo(res.data || "");

    if (customers.length === 0) {
      console.warn("[NOC] Parser found 0 ONUs. Check RAW_NETLINK_OUTPUT.");
   }

    return { 
      success: true, 
      data: customers, 
      raw: res.data 
    };
  } catch (err: any) {
    console.error(`[NETLINK INVENTORY ERROR]:`, err.message);
    return { success: false, data: {}, error: err.message };
  }
}

/**
 * Fetches the entire chassis inventory across all 8 GPON interfaces 
 * in a single execution block to populate global counters instantly.
 */
export async function getNetlinkFullChassisInventory(oltId: string) {
  const olt = await prisma.olt.findUnique({ where: { id: oltId } });
  if (!olt) return { success: false, error: "OLT record not found." };

  const pass = olt.sshPassword ? decrypt(olt.sshPassword) : "";
  const user = olt.sshUsername || "admin";

  // Build a multi-port script sequence to fetch all data at once

  // Sequence 1: Extract all ONU configurations
  const commandSequence = ["configure t"];
  for (let p = 1; p <= 8; p++) {
    commandSequence.push(`show onu info ${p}`);
  }

  // Sequence 2: Interrogate individual SFP transceiver modules
  for (let p = 1; p <= 8; p++) {
    commandSequence.push(`show pon optical transceiver ${p}`);
  }

  commandSequence.push("exit");

  try {
    console.log(`[NOC] Executing Global Chassis Scan on Netlink OLT: ${olt.ip}`);
    const res = await executeTelnetCommand(olt.ip, commandSequence.join("\r\n"), user, pass);
    
    if (!res.success) return res;

    // Use the Sieve Parser to capture records across the whole block stream
    const masterInventory = parseNetlinkOnuInfo(res.data || "");
    const sfpTelemetry = parseNetlinkSfpMetrics(res.data || "");

    console.log("PON data >> :", masterInventory);

    console.log("SFT Data >>> : ", sfpTelemetry);

    return { 
      success: true, 
      data: masterInventory, 
      sfpData: sfpTelemetry, // Bundled SFP data object
      raw: res.data 
    };
  } catch (err: any) {
    console.error(`[NOC ERROR] Netlink Full Scan Failed:`, err.message);
    return { success: false, error: err.message || "Chassis connection failure" };
  }
}

export async function getNetlinkPortStates(oltId: string, portId: string) {
  const olt = await prisma.olt.findUnique({ where: { id: oltId } });
  if (!olt) return { success: false, error: "OLT definition missing." };

  const pass = olt.sshPassword ? decrypt(olt.sshPassword) : "";
  const user = olt.sshUsername || "admin";

  const commandSequence = [
    "configure t",
    `show onu state ${portId}`,
    "exit"
  ].join("\r\n");

  try {
    const res = await executeTelnetCommand(olt.ip, commandSequence, user, pass);
    if (!res.success) return res;

    const liveStates = parseNetlinkOnuStates(res.data || "");
    return { success: true, data: liveStates };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed reading link states" };
  }
}

export async function getNetlinkOnuDeepDiagnostics(oltId: string, portId: string, onuIndex: string) {
  const olt = await prisma.olt.findUnique({ where: { id: oltId } });
  if (!olt) return { success: false, error: "OLT not found", data: null };

  const pass = olt.sshPassword ? decrypt(olt.sshPassword) : "";
  const user = olt.sshUsername || "admin";

  // Build the complete contextual query pipeline script
  const diagnosticChain = [
    "configure t",
    `interface gpon 0/${portId}`,
    `show onu ${onuIndex} detail-info`,
    `show onu ${onuIndex} optical_info`,
    `show onu ${onuIndex} distance`,
    "exit",
    "exit"
  ].join("\n");

  try {
    console.log(`[NOC TELEMETRY] Deep scanning ONU ${portId}:${onuIndex} on OLT ${olt.ip}`);
    const res = await executeTelnetCommand(olt.ip, diagnosticChain, user, pass);
    
    if (!res.success) return res;

    console.log(`[SCAN RESULST] ONU ${portId}:${onuIndex} >>`,res)

    // Run structural parser to convert raw shell stream blocks to JSON object
    const deepTelemetry = parseNetlinkOnuDeepDiagnostics(res.data || "");
    return { success: true, data: deepTelemetry };
  } catch (err: any) {
    console.error(`[NOC DIAGNOSTIC FAILURE]:`, err.message);
    return { success: false, error: err.message || "Telemetry trace failed", data: null };
  }
}

export async function getNetlinkPortRunningConfigs(
  oltId: string, 
  portId: string,
  onuIndexes: string[]
): Promise<{ success: boolean; data: Record<string, string>; error?: string }> {
  
  const olt = await prisma.olt.findUnique({ where: { id: oltId } });
  if (!olt) {
    return { success: false, error: "OLT record missing from instance database parameters.", data: {} };
  }

  const pass = olt.sshPassword ? decrypt(olt.sshPassword) : "";
  const user = olt.sshUsername || "admin";

  // 1. Build structural context lines
  const commandLines = [
    "configure t",
    `interface gpon 0/${portId}`
  ];

  // 2. ✅ BIND THE GRANULAR RUN-CONFIG COMMAND LOOP INDIVIDUALLY FOR EVERY ACTIVE ONU
  onuIndexes.forEach(idx => {
    commandLines.push(`show running-config onu ${idx}`);
  });

  commandLines.push("exit", "exit");

  // Format to standard Carriage Return Line Feed mapping for execution
  const finalCommandChain = commandLines.join("\r\n");

  try {
    console.log(`[NOC COMMAND] Executing sequential configuration script pull for ${onuIndexes.length} nodes on Port ${portId}...`);
    const res = await executeTelnetCommand(olt.ip, finalCommandChain, user, pass);
    
    if (!res.success) {
      return { 
        success: false, 
        error: res.error || "Telnet command script delivery transaction failure.", 
        data: {} 
      };
    }

    // 3. Process raw string block chunk logs into unified JSON mapping dictionaries
    const parsedConfigs = parseNetlinkPortRunningConfigs(res.data || "");
    
    return { 
      success: true, 
      data: parsedConfigs as Record<string, string> 
    };
  } catch (err: any) {
    console.error(`[NETLINK RUNNING CONFIG GRANULAR BATCH EXTRACTION FAILURE]:`, err.message);
    return { 
      success: false, 
      error: err.message || "Failed gathering bulk target hardware provision blueprints", 
      data: {} 
    };
  }
}

/**
 * Interrogates a Syrotech EPON OLT to fetch global chassis summaries 
 * and port-by-port total vs. online ONU metrics.
 */
export async function getSyrotechChassisInventory(oltId: string) {
  const olt = await prisma.olt.findUnique({ where: { id: oltId } });
  if (!olt) return { success: false, error: "OLT record missing.", data: {}, ports: [] };

  const pass = olt.sshPassword ? decrypt(olt.sshPassword) : "";
  const user = olt.sshUsername || "admin";

  // Syrotech layout query execution prompt sequence
  const commands = [
    // "enable",
    // pass || "",
    "config terminal",
    "show pon baisc-info",
    "exit"
  ].join("\r\n");

  try {
    console.log(`[NOC COMMAND] Initializing Syrotech EPON Front Panel Scan: ${olt.ip}`);
    const res = await executeTelnetCommand(olt.ip, commands, user, pass);
    
    if (!res.success) return { success: false, error: res.error || "Telnet execution failed", data: {}, ports: [] };

    // Pass the raw data buffer stream directly into the block processor
    const parsedData = parseSyrotechChassisHUD(res.data || "");
    
    return { 
      success: true, 
      data: parsedData.globalInfo, 
      ports: parsedData.ports,
      raw: res.data 
    };
  } catch (err: any) {
    console.error(`[NOC SYROTECH TIMEOUT]`, err.message);
    return { success: false, error: err.message || "Chassis sync timed out", data: {}, ports: [] };
  }
}

// Syrotech EPON port invertory
export async function getSyrotechPortInventory(oltId: string, portId: string) {
  const olt = await prisma.olt.findUnique({ where: { id: oltId } });
  if (!olt) return { success: false, error: "OLT record missing.", data: [] };

  const pass = olt.sshPassword ? decrypt(olt.sshPassword) : "";
  const user = olt.sshUsername || "admin";

  // Syrotech Port sequence: Enter config interface -> Run info -> Run status -> Exit
  const commands = [
    "configure t",
    `interface epon 0/${portId}`,
    "show onu basic-info",
    "show onu status",
    "exit",
    "exit"
  ].join("\r\n");

  try {
    console.log(`[NOC] Fetching Syrotech EPON Port ${portId} detailed diagnostics...`);
    const res = await executeTelnetCommand(olt.ip, commands, user, pass);
    if (!res.success) return { success: false, error: res.error || "Telnet command failed", data: [] };

    const parsedOnus = parseSyrotechPortOnus(res.data || "", portId);
    return { 
      success: true, 
      data: parsedOnus,
      raw: res.data 
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed parsing port parameters", data: [] };
  }
}

export async function getSyrotechOpmDiagnostics(oltId: string, portId: string) {
  const olt = await prisma.olt.findUnique({ where: { id: oltId } });
  if (!olt) return { success: false, error: "OLT not found.", data: {} };

  const pass = olt.sshPassword ? decrypt(olt.sshPassword) : "";
  const user = olt.sshUsername || "admin";

  const commands = [
    "configure t",
    `interface epon 0/${portId}`,
    "show onu opm-diag",
    "exit",
    "exit"
  ].join("\r\n");

  try {
    const res = await executeTelnetCommand(olt.ip, commands, user, pass);
    if (!res.success) return { success: false, error: res.error || "Telnet failure", data: {} };

    console.log("Power RX: >> ", res);

    const parsedOpm = parseSyrotechOpmDiag(res.data || "");
    return { 
      success: true, 
      data: parsedOpm,
      raw: res.data
    };
  } catch (err: any) {
    return { success: false, error: err.message, data: {} };
  }
}

export async function getSyrotechPortRunningConfigs(oltId: string, portId: string) {
  const olt = await prisma.olt.findUnique({ where: { id: oltId } });
  if (!olt) return { success: false, error: "OLT record missing from instance parameters.", data: {} };

  const pass = olt.sshPassword ? decrypt(olt.sshPassword) : "";
  const user = olt.sshUsername || "admin";

  const commands = [
    "configure t",
    `interface epon 0/${portId}`,
    "show running-config onu", // Dumps script block commands for all configured ONUs on this port
    "exit",
    "exit"
  ].join("\r\n");

  try {
    console.log(`[NOC TELEMETRY] Sieve scanning configuration maps for Syrotech Port ${portId}...`);
    const res = await executeTelnetCommand(olt.ip, commands, user, pass);
    if (!res.success) return { success: false, error: res.error || "Telnet process failure", data: {} };

    const parsedConfigs = parseSyrotechPortRunningConfigs(res.data || "");
    return { success: true, data: parsedConfigs };
  } catch (err: any) {
    console.error(`[NOC SYROTECH CONFIG PROFILER FAILURE]:`, err.message);
    return { success: false, error: err.message || "Failed reading configuration metrics", data: {} };
  }
}