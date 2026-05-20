// lib/olt-parser.ts

function getAlphionStatus(flags: string) {
  const f = flags.toUpperCase();
  
  // Note: We check for exact matches within pipes |Op| to avoid partial matches
  if (f.includes("|OP|")) return "Operational";
  if (f.includes("|PO|")) return "Popup";
  if (f.includes("|PR|")) return "Pre-Provision";
  if (f.includes("|RA|")) return "Ranging";
  if (f.includes("|IN|")) return "Initial";
  if (f.includes("|EM|")) return "Emergency Stop";
  if (f.includes("|ST|")) return "Standby";
  
  return "Offline";
}

export function parseOltOutput(rawOutput: string, make: string) {
  // 1. STRIP ANSI COLORS, PAGINATION, AND HIDDEN CHARS
  // Note: We use \x20-\x7E but EXPLICITLY allow \r and \n to keep the lines intact
  const cleanData = rawOutput
    .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, " ") 
    .replace(/--More--/gi, "")                
    .replace(/[^\x20-\x7E\r\n]/g, "");       

  const lines = cleanData.split(/\r?\n/);
  const parsedData: any[] = [];

  if (make !== "ALPHION") {
    // Standard logic for other brands...
    lines.forEach((line) => {
      const match = line.match(/(\d+\/\d+\/\d+)\s+(\S+)\s+([A-Z0-9]{8,})\s+(\w+)\s+([-\d.]+)/i);
      if (match) {
        parsedData.push({
          pon: match[1], sn: match[3],
          status: match[4].toLowerCase().includes("on") ? "Online" : "Offline",
          power: match[5] + " dBm", name: "User-" + match[3].slice(-4)
        });
      }
    });
  } else {
    lines.forEach((line) => {
      const row = line.trim();

      // if (row.includes("APHN")) console.log("ROW_FOUND:", JSON.stringify(row));
      // 1. IDENTIFICATION: A valid Alphion row must start with a digit/digit (Port)
      // and contain a 12-character Serial Number starting with APHN
      if (/^\d+\/\d+/.test(row) && row.toUpperCase().includes("APHN")) {
        
        // 2. SPLIT BY WHITESPACE: This handles the variable gaps (3 spaces or 30 spaces)
        const parts = row.split(/\s+/).filter(p => p.length > 0);

        /**
         * ARRAY MAPPING (Based on your raw output sample):
         * parts[0] -> "1/1"
         * parts[1] -> "APHN407A0888"
         * parts[2] -> "270761"
         * parts[3] -> "asee1445"
         * parts[4] -> "H|Op|S"
         */
        if (parts.length >= 5) {
          const flags = parts[4].toUpperCase();

          parsedData.push({
            pon: parts[0],
            sn: parts[1],
            account: parts[2],
            name: parts[3],
            actVer: parts[5],
            // In Alphion flags, 'OP' stands for Operational
            // status: flags.includes("OP") ? "Online" : "Offline",
            status: getAlphionStatus(flags),
            power: "Active", 
          });
        }
      }
    });
  }

  console.log(`[PARSER] Finished processing. Items found: ${parsedData.length}`);
  return parsedData;
}


export function parseAlphionServices(rawOutput: string) {
  // Split by the horizontal line separator
  const sections = rawOutput.split(/--------------------------------------------------------------------------------/);
  const services: any[] = [];
  let currentUni = "";

  sections.forEach((section) => {
    const text = section.trim();
    if (!text) return;

    // 1. Detect if this section is a Header (contains UNI info)
    if (text.includes("PON/ONU/UNI")) {
      const match = text.match(/PON\/ONU\/UNI\s+:\s+(\S+)/);
      if (match) currentUni = match[1];
      return;
    }

    // 2. Detect if this section is a Service Block
    if (text.includes("Service-ID")) {
      const data: any = { uni: currentUni };
      
      // Extract key fields using individual Regex lookups
      data.id = text.match(/Service-ID\s+:\s+(\d+)/)?.[1];
      data.type = text.match(/Service-Type\s+:\s+(\w+)/)?.[1];
      data.name = text.match(/Service Name\s+:\s+(\S+)/)?.[1];
      data.vlan = text.match(/S-VLAN\s+:\s+(\d+)/)?.[1];
      data.state = text.match(/State\s+:\s+(\w+)/)?.[1];
      data.profile = text.match(/ProfileGrpName\s+:\s+(\S+)/)?.[1];
      data.bwMax = text.match(/BW-Max\(kbps\)\s+:\s+(\d+)/)?.[1];
      data.phone = text.match(/PhoneNumber\s+:\s+(\S+)/)?.[1];

      services.push(data);
    }
  });

  return services;
}

export function parseNetlinkOnuList(rawOutput: string) {
  const lines = rawOutput.split(/\r?\n/);
  const onus: any[] = [];

  lines.forEach(line => {
    // Matches: 1/1 (ID), Serial, Status (Operational/Down)
    // Adjust indices based on your Netlink CLI columns
    const match = line.trim().match(/^(\d+)\s+([A-Z0-9]{12,})\s+(\w+)/i);
    
    if (match) {
      onus.push({
        pon: match[1], // This will be "1", "2", etc.
        sn: match[2],
        account: match[1],
        status: match[3].toLowerCase().includes("op") ? "Operational" : "Offline",
        name: "Netlink-Node"
      });
    }
  });
  return onus;
}


export function parseNetlinkOnuInfo(rawOutput: string) {
  // 1. STRIP THE HARDWARE TERMINAL GRAPHICS CODES
  const cleanData = rawOutput
    // Remove Telnet negotiation binary bytes
    .replace(/[\xFF\xFD\xFC\xFB\xFA\x01\x03"]/g, " ")
    // Convert ANSI Cursor Jump Escape Sequences (\x1B[11C, \x1B[32C, etc.) into clean spaces
    .replace(/\r\x1B\[\d+C/g, " ")
    // Normal standard ANSI strip fallback
    .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, " ")
    // Flatten hidden non-printable bytes
    .replace(/[^\x20-\x7E\r\n]/g, " ")
    .replace(/--More--/gi, " ")
    .replace(/\x08+/g, " ");

  const lines = cleanData.split(/\r?\n/);
  const parsedData: any[] = [];

  lines.forEach((line) => {
    const row = line.trim();
    
    // Drop banners, system log alerts, configurations prompts, and boundaries
    if (!row || row.includes("---") || row.includes("Onuindex") || row.includes("gpon-olt") || row.includes("User Login")) return;

    /**
     * CLEAN DATA PATTERN MATCH:
     * GPON0/1:1  240-0000421  default  sn  APHN126b473c
     * 
     * Regex Breakdown:
     * GPON0\/(\d+):(\d+) -> Group 1: Physical Port ("1"), Group 2: Local ONU Index ("1")
     * \s+(\S+)           -> Group 3: Hardware Model Name ("240-0000421" / "H423")
     * \s+(\S+)           -> Group 4: Profile Name ("default")
     * \s+(\S+)           -> Group 5: Authentication Mode ("sn")
     * \s+([A-Za-z0-9]+)  -> Group 6: Serial Authentication Key / AuthInfo ("APHN126b473c")
     */
    const match = row.match(/GPON0\/(\d+):(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+([A-Za-z0-9]+)/i);

    if (match) {
      const physicalPort = match[1]; // e.g., "1"
      const localOnuId = match[2];    // e.g., "1", "2", "4"
      const modelName = match[3];     // e.g., "240-0000421" or "H423"
      const serialKey = match[6];     // e.g., "APHN126b473c"

      parsedData.push({
        port: physicalPort,       // Links to your selected card filter context
        pon: localOnuId,          // Flat serial ID index matching for target card loop
        model: modelName,
        sn: serialKey,
        status: "Operational",    // Base hardware registration online link state flag
        account: `ONU-${localOnuId}`,
        name: modelName.toLowerCase() === 'unknown' ? "Standard ONT" : modelName
      });
    }
  });

  console.log(`[PARSER] Sieve Scan Complete. Extracted ${parsedData.length} Netlink ONUs.`);
  return parsedData;
}

export function parseNetlinkOnuStates(rawOutput: string) {
  // Strip hidden terminal graphics padding and clear artifacts
  const cleanData = rawOutput
    .replace(/[\xFF\xFD\xFC\xFB\xFA\x01\x03"]/g, " ")
    .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, " ")
    .replace(/[^\x20-\x7E\r\n]/g, " ");

  const lines = cleanData.split(/\r?\n/);
  // Key-value pair configuration map: { "1": "working", "11": "dyinggasp" }
  const stateMap: Record<string, string> = {};

  lines.forEach((line) => {
    const row = line.trim();
    
    if (!row || row.includes("---") || row.includes("OnuIndex") || row.toLowerCase().includes("total:")) return;

    /**
     * EXTRACTS STATE METADATA FROM FIELDS:
     * GPON0/1:11  enable         disable       dyinggasp      APHN125b5b00
     * 
     * Regex Layout Structure:
     * GPON0\/\d+:(\d+) -> Group 1: Isolates flat ONU ID sequence ("11")
     * \s+\w+           -> Admin State field matching ("enable")
     * \s+\w+           -> OMCC State field matching ("disable")
     * \s+(\w+)         -> Group 2: The Target Phase State string ("dyinggasp" / "working" / "offline")
     */
    const match = row.match(/GPON0\/\d+:(\d+)\s+\w+\s+\w+\s+(\w+)/i);

    if (match) {
      const localOnuId = match[1];  // e.g. "11"
      const phaseState = match[2];  // e.g. "dyinggasp"
      
      stateMap[localOnuId] = phaseState.toLowerCase();
    }
  });

  return stateMap;
}

export function parseNetlinkOnuDeepDiagnostics(rawOutput: string) {
  // Strip messy hidden ANSI formatting jumps and carriage controls
  const scrubbedText = rawOutput
    .replace(/[\xFF\xFD\xFC\xFB\xFA\x01\x03"]/g, " ")
    .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, " ")
    .replace(/[^\x20-\x7E\r\n]/g, " ");

  const result: any = {
    uptime: "N/A",
    rxOnu: "N/A",
    rxOlt: "N/A",
    txOnu: "N/A",
    distance: "N/A",
    voltage: "N/A",
    temperature: "N/A",
    bias: "N/A",
    adminStatus: "unlock"
  };

  const lines = scrubbedText.split(/\r?\n/);
  
  lines.forEach((line) => {
    const row = line.trim();
    if (!row || row.includes("gpon-olt") || row.includes("---")) return;

    // --- 2. EXTRACT OPTICAL METRICS ---
    if (row.includes("Rx optical level(ONU)")) {
      const parts = row.split(":");
      if (parts[1]) result.rxOnu = `${parts[1].trim()} dBm`;
    }
    
    if (row.includes("Rx optical level(OLT)")) {
      const parts = row.split(":");
      if (parts[1]) result.rxOlt = `${parts[1].trim()} dBm`;
    }
    
    if (row.includes("Tx optical level") && !row.toLowerCase().includes("threshold")) {
      const parts = row.split(":");
      if (parts[1]) result.txOnu = `${parts[1].trim()} dBm`;
    }

    if (row.includes("Power feed voltage")) {
      const parts = row.split(":");
      if (parts[1]) result.voltage = parts[1].trim();
    }

    if (row.includes("Laser bias current")) {
      const parts = row.split(":");
      if (parts[1]) result.bias = parts[1].trim();
    }

    if (row.includes("Temperature") && !row.toLowerCase().includes("transceiver")) {
      const parts = row.split(":");
      if (parts[1]) result.temperature = parts[1].trim();
    }

    // --- 3. EXTRACT DISTANCE ---
    // Target sample row string: "onu 23 Distance: 3910m"
    if (row.toLowerCase().includes("distance:")) {
      const distanceMatch = row.match(/Distance\s*:\s*(\d+\w*)/i);
      if (distanceMatch) {
        result.distance = distanceMatch[1]; // Extracts "3910m"
      }
    }
  });

  return result;
}

export function parseNetlinkSfpMetrics(rawOutput: string) {
  const scrubbedText = rawOutput
    .replace(/[\xFF\xFD\xFC\xFB\xFA\x01\x03"]/g, " ")
    .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, " ")
    .replace(/[^\x20-\x7E\r\n]/g, " ");

  const lines = scrubbedText.split(/\r?\n/);
  const sfpMap: Record<string, { txPower: string; temp: string; isHealthy: boolean }> = {};
  
  let activeParsingPort: string | null = null;
  let currentTemp = "N/A";

  lines.forEach((line) => {
    const row = line.trim();
    if (!row) return;

    // Context Anchor 1: Trace which port sub-response section we are tracking
    // Command line look: "gpon-olt(config)# show pon optical transceiver 2"
    if (row.includes("show pon optical transceiver")) {
      const portMatch = row.match(/transceiver\s+(\d+)/i);
      if (portMatch) {
        activeParsingPort = portMatch[1];
        currentTemp = "N/A"; // Reset tracking states for next loop block
      }
      return;
    }

    if (!activeParsingPort) return;

    // Context Anchor 2: Parse Temperature parameter row
    if (row.includes("Temperature:")) {
      const parts = row.split(":");
      if (parts[1]) {
        currentTemp = parts[1].replace(/C/gi, "").trim() + "°C";
      }
    }

    // Context Anchor 3: Parse OLT Transceiver Output Laser Power row
    if (row.includes("TxPower:")) {
      const parts = row.split(":");
      if (parts[1]) {
        const txPowerVal = parts[1].replace(/dBm/gi, "").trim();
        const floatVal = parseFloat(txPowerVal);

        sfpMap[activeParsingPort] = {
          txPower: `${txPowerVal} dBm`,
          temp: currentTemp,
          // Laser is healthy if it is plugged in and actively emitting light (typically > 1.5 dBm)
          isHealthy: !isNaN(floatVal) && floatVal > 1.00
        };
        
        activeParsingPort = null; // Close current mapping slot context safely
      }
    }
  });

  return sfpMap;
}


export function parseNetlinkPortRunningConfigs(rawOutput: string): Record<string, string> {
  const scrubbedText = rawOutput
    .replace(/[\xFF\xFD\xFC\xFB\xFA\x01\x03"]/g, " ")
    .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, " ")
    .replace(/[^\x20-\x7E\r\n]/g, " ");

  const lines = scrubbedText.split(/\r?\n/);
  const configMap: Record<string, string[]> = {};
  let activeOnuId: string | null = null;

  lines.forEach((line) => {
    const row = line.trim();
    if (!row || row.includes("gpon-olt") || row.includes("---")) return;

    // Detect execution boundary starts (e.g., "onu add 1 ...", "onu 1 desc ...")
    const match = row.match(/^onu\s+(?:add\s+)?(\d+)\s+/i);
    if (match) {
      activeOnuId = match[1];
      if (!configMap[activeOnuId]) {
        configMap[activeOnuId] = [];
      }
      configMap[activeOnuId].push(row);
    }
  });

  // Convert separate arrays into clean string text blocks
  const finalMap: Record<string, string> = {};
  Object.keys(configMap).forEach((id) => {
    finalMap[id] = configMap[id].join("\n");
  });

  return finalMap;
}

// Syrotech EPON OLT parser
export function parseSyrotechChassisHUD(rawOutput: string) {
  const scrubbedText = rawOutput
    .replace(/[\xFF\xFD\xFC\xFB\xFA\x01\x03"]/g, " ")
    .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, " ")
    .replace(/[^\x20-\x7E\r\n]/g, " ");

  const lines = scrubbedText.split(/\r?\n/);
  
  const globalInfo: Record<string, string> = {
    mac: "N/A",
    status: "N/A",
    firmware: "N/A"
  };
  const ports: any[] = [];

  lines.forEach((line) => {
    const row = line.trim();
    if (!row) return;

    // 1. Extract Global Chassis Parameter Metadata Fields
    if (row.toLowerCase().includes("mac address")) {
      const parts = row.split(":");
      if(parts[1]) globalInfo.mac = parts[1].trim();
    }
    if (row.toLowerCase().includes("status")) {
      // Avoid cross-capturing port labels fields later
      if (!row.includes("PON")) {
        const parts = row.split(":");
        if(parts[1]) globalInfo.status = parts[1].trim();
      }
    }
    if (row.toLowerCase().includes("firmware version")) {
      const parts = row.split(":");
      if(parts[1]) globalInfo.firmware = parts[1].trim();
    }

    // 2. Extract EPON Port Allocation Matrices Lines
    // Matches patterns like: EPON0/3   10            4
    // Group 1: Interface Name (EPON0/3), Group 2: Total ONUs (10), Group 3: Online ONUs (4)
    const portMatch = row.match(/^(EPON\d+\/\d+)\s+(\d+)\s+(\d+)/i);
    if (portMatch) {
      const interfaceName = portMatch[1];
      const totalOnus = parseInt(portMatch[2]);
      const onlineOnus = parseInt(portMatch[3]);
      const portIndex = interfaceName.split('/')[1] || "1"; // Extracts "3" from "EPON0/3"

      ports.push({
        id: portIndex,
        interface: interfaceName,
        total: totalOnus,
        online: onlineOnus,
        offline: totalOnus - onlineOnus,
        uptimePercent: totalOnus > 0 ? Math.round((onlineOnus / totalOnus) * 100) : 100
      });
    }
  });

  return { globalInfo, ports };
}

// EPON ONU status 

export function parseSyrotechPortOnus(rawOutput: string, portId: string) {
  const scrubbedText = rawOutput
    .replace(/[\xFF\xFD\xFC\xFB\xFA\x01\x03"]/g, " ")
    .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, " ")
    .replace(/[^\x20-\x7E\r\n]/g, " ");

  const lines = scrubbedText.split(/\r?\n/);
  const onusMap: Record<string, any> = {};

  lines.forEach((line) => {
    const row = line.trim();
    if (!row || row.includes("---") || row.includes("ONU-ID") || row.includes("star_royal")) return;

    // 🎯 PASS 1: PARSE "show onu basic-info"
    // Format: EPON0/1:1   MONU      H313      A8E20769D36F  V3.7L  3.1.02-220505
    const basicMatch = row.match(/EPON\d+\/\d+:(\d+)\s+(\S+)\s+(\S+)\s+(\S+)/i);
    if (basicMatch && !row.toLowerCase().includes("online") && !row.toLowerCase().includes("offline")) {
      const idx = basicMatch[1];
      onusMap[idx] = {
        port: portId,
        pon: idx,
        vendorID: basicMatch[2],
        model: basicMatch[3],
        sn: basicMatch[4],
        status: "Offline", // Default, fallback if status parsing fails
        mac: "N/A",
        distance: "N/A",
        deregReason: "N/A",
        account: `ONU-${idx}`
      };
      return;
    }

    // 🎯 PASS 2: PARSE "show onu status"
    // Format: EPON0/1:1   online    a8:e2:07:69:d3:6f    29     114  ... Power Off ...
    const statusMatch = row.match(/EPON\d+\/\d+:(\d+)\s+(online|offline)\s+(\S+)\s+(\d+)/i);
    if (statusMatch) {
      const idx = statusMatch[1];
      const statusLabel = statusMatch[2];
      const macAddress = statusMatch[3];
      const distanceVal = statusMatch[4];

      // Detect deregistration strings inside the line (e.g. "Power Off" or "Wire Down")
      let reason = "N/A";
      if (row.toLowerCase().includes("power off")) reason = "Power Off";
      else if (row.toLowerCase().includes("wire down")) reason = "Wire Down";
      else if (row.toLowerCase().includes("lost")) reason = "Signal Lost";

      if (onusMap[idx]) {
        onusMap[idx].status = statusLabel.toLowerCase() === "online" ? "Operational" : "Offline";
        onusMap[idx].mac = macAddress.toUpperCase();
        onusMap[idx].distance = `${distanceVal}m`;
        onusMap[idx].deregReason = reason;
      }
    }
  });

  return Object.values(onusMap);
}

export function parseSyrotechOpmDiag(rawOutput: string): Record<string, string> {
  const scrubbedText = rawOutput
    .replace(/[\xFF\xFD\xFC\xFB\xFA\x01\x03"]/g, " ")
    .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, " ")
    .replace(/[^\x20-\x7E\r\n]/g, " ");

  const lines = scrubbedText.split(/\r?\n/);
  const powerMap: Record<string, string> = {};

  lines.forEach((line) => {
    const row = line.trim();
    
    // Drop boundaries, titles, headers, or lines containing the command name
    if (!row || row.includes("---") || row.toLowerCase().includes("onu-id") || row.toLowerCase().includes("opm-diag")) return;

    /**
     * 🎯 THE CHUNKING METHOD (Safer than direct strict regex spacing)
     * Example input: EPON0/1:2   51.58   3.37   20.80   2.10   -5.92
     * Splitting by one or more spaces breaks the columns into an indexed array cleanly.
     */
    const columns = row.split(/\s+/);

    // Ensure the line has all 6 columns before trying to extract data
    // Index 0: EPON0/1:2, Index 1: Temp, Index 2: Volt, Index 3: Bias, Index 4: TX, Index 5: RX
    if (columns.length >= 6 && columns[0].includes(":")) {
      const idParts = columns[0].split(":");
      const localOnuIdx = idParts[1]; // Extracts the standalone number "2"
      const rxPowerValue = columns[5]; // Extracts the final RX column value "-5.92"

      if (localOnuIdx && rxPowerValue) {
        powerMap[localOnuIdx] = `${rxPowerValue} dBm`;
      }
    }
  });

  console.log(`[OPM PARSER] Finished processing. Extracted entries: ${Object.keys(powerMap).length}`);
  return powerMap;
}

// lib/olt-parser.ts

export function parseSyrotechPortRunningConfigs(rawOutput: string): Record<string, string> {
  const scrubbedText = rawOutput
    .replace(/[\xFF\xFD\xFC\xFB\xFA\x01\x03"]/g, " ")
    .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, " ")
    .replace(/[^\x20-\x7E\r\n]/g, " ");

  const lines = scrubbedText.split(/\r?\n/);
  const configMap: Record<string, string> = {};

  lines.forEach((line) => {
    const row = line.trim();
    if (!row) return;

    /**
     * TARGET PATTERN EXTRACTOR FOR:
     * onu 1 description 244786
     * 
     * Regex Layout Structure:
     * ^onu\s+(\d+)\s+description\s+(\S+)
     * Group 1: Isolates flat ONU ID index key ("1")
     * Group 2: Isolates precise descriptive string token ("244786")
     */
    const match = row.match(/^onu\s+(\d+)\s+description\s+(\S+)/i);
    if (match) {
      const localOnuId = match[1];  // Extracts "1"
      const descValue = match[2];   // Extracts "244786"
      configMap[localOnuId] = descValue;
    }
  });

  return configMap;
}
