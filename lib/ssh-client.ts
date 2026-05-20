// lib/ssh-client.ts
import { Client } from "ssh2";

export async function executeSshCommand(
  ip: string, 
  username?: string | null,
  password?: string | null,
  finalCommand?: string | null
): Promise<{ success: boolean; data?: string; error?: string }> {
  
  return new Promise((resolve) => {
    const conn = new Client();
    let fullBuffer = ""; // The master accumulator
    let commandSent = false;

    conn
      .on('keyboard-interactive', (name, instructions, lang, prompts, finish) => {
        finish([password ?? ""]);
      })
      .on("ready", () => {
        conn.shell({ term: 'vt100' }, (err, stream) => {
          if (err) {
            conn.end();
            return; // Error handled by conn.on("error")
          }

          let loginSent = false;
          let passwordSent = false;
          let enableSent = false;
          let enablePassSent = false;

          stream.on("data", (data: Buffer) => {
            const chunk = data.toString('utf8');
            fullBuffer += chunk; // ACCUMULATING HERE
            
            // Console log to verify accumulation
            console.log(`[DEBUG] Received ${data.length} bytes. Total: ${fullBuffer.length}`);

            // Handle Pagination
            if (chunk.includes("--More--")) {
              stream.write(" ");
              return;
            }

            // Authentication Handshake logic
            if (chunk.toLowerCase().includes("login:") && !loginSent) {
              stream.write(`${username}\n`);
              loginSent = true;
            } else if (chunk.toLowerCase().includes("password:") && loginSent && !passwordSent) {
              stream.write(`${password}\n`);
              passwordSent = true;
            } else if (chunk.trim().endsWith(">") && passwordSent && !enableSent) {
              stream.write(`enable\n`);
              enableSent = true;
            } else if (chunk.toLowerCase().includes("password:") && enableSent && !enablePassSent) {
              stream.write(`${password}\n`);
              enablePassSent = true;
            }

            // Command Execution logic
            if (chunk.trim().endsWith("#") && enablePassSent) {
              if (!commandSent) {
                stream.write(`${finalCommand}\r\n`);
                commandSent = true;
              } else {
                // Command was sent, we see '#' again, wait for last flush then kill connection
                setTimeout(() => {
                  conn.destroy(); // FORCE trigger the 'close' event below
                }, 2000);
              }
            }
          });
        });
      })
      .on("error", (err) => {
        // Resolve early only on error
        resolve({ success: false, error: `SSH Error: ${err.message}` });
      })
      .on("close", () => {
        // THE ONLY PLACE WE RETURN DATA
        console.log(`[FINAL] SSH Closed. Returning ${fullBuffer.length} bytes.`);
        resolve({ 
          success: fullBuffer.length > 0, 
          data: fullBuffer 
        });
      })
      .connect({
        host: ip, port: 22, username: username || "admin", password: password || "",
        readyTimeout: 15000, tryKeyboard: true,
        algorithms: {
          kex: ['diffie-hellman-group-exchange-sha1', 'diffie-hellman-group14-sha1', 'diffie-hellman-group1-sha1'],
          cipher: ['aes128-cbc', '3des-cbc', 'aes128-ctr', 'aes192-ctr', 'aes256-ctr'],
          serverHostKey: ['ssh-rsa', 'ssh-dss'],
          hmac: ['hmac-sha1', 'hmac-sha1-96']
        }
      });
  });
}
