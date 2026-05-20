// lib/telnet-client.ts
import net from "net";

export async function executeTelnetCommand(
  ip: string,
  command: string,
  user?: string | null,
  pass?: string | null
): Promise<{ success: boolean; data?: string; error?: string }> {
  return new Promise((resolve) => {
    const socket = net.connect({ host: ip, port: 23, family: 4 });
    
    let output = "";
    let loginSent = false;
    let passwordSent = false;
    let enableSent = false;
    let enablePassSent = false;
    let commandSent = false;
    let moreCounter = 0;

    socket.setTimeout(25000); // Increased timeout window to allow large multiple-page dumps

    socket.on("connect", () => {
      console.log(`[PAGINATED-TCP] Connected to OLT at ${ip}`);
    });

    socket.on("data", (data) => {
      const chunk = data.toString();
      output += chunk;

      const cleanLine = chunk.trim();

      // --- 1. LIVE PAGINATION INTERACTION LAYER ---
      // If the OLT stream pauses on a --More-- query, press spacebar to load next batch
      if (chunk.includes("--More--")) {
        moreCounter++;
        console.log(`[PAGINATED-TCP] Intercepted pagination page #${moreCounter}. Sending Spacebar...`);
        
        // Netlink devices require a single standard space instruction to shift frames
        socket.write(" "); 
        return;
      }

      // --- 2. AUTHENTICATION HANDSHAKE SEQUENCE ---
      if ((chunk.toLowerCase().includes("username:") || chunk.toLowerCase().includes("login:")) && !loginSent) {
        socket.write(`${user || "admin"}\r\n`);
        loginSent = true;
        return;
      }

      if (chunk.toLowerCase().includes("password:") && loginSent && !passwordSent) {
        socket.write(`${pass || ""}\r\n`);
        passwordSent = true;
        return;
      }

      if (cleanLine.includes(">") && passwordSent && !enableSent) {
        socket.write("enable\r\n");
        enableSent = true;
        return;
      }

      if (chunk.toLowerCase().includes("password:") && enableSent && !enablePassSent) {
        socket.write(`${pass || ""}\r\n`);
        enablePassSent = true;
        return;
      }

      // --- 3. COMMAND EXECUTION ---
      if (cleanLine.includes("#") && enablePassSent) {
        if (!commandSent) {
          socket.write(`${command}\r\n`);
          commandSent = true;
        } else {
          // If we see the prompt again, verify it's the actual terminal ending, 
          // not text inside a banner or timestamp log row
          if (cleanLine.endsWith("#") || cleanLine.endsWith("(config)#")) {
            setTimeout(() => {
              socket.destroy(); // All pages fetched successfully, close stream socket
            }, 2500); 
          }
        }
      }
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({ success: false, error: "Chassis data gathering timeout reached" });
    });

    socket.on("error", (err) => {
      socket.destroy();
      resolve({ success: false, error: `Socket Connection Error: ${err.message}` });
    });

    socket.on("close", () => {
      console.log(`[PAGINATED-TCP] Session concluded. Stream payload: ${output.length} bytes.`);
      resolve({ success: true, data: output });
    });
  });
}
