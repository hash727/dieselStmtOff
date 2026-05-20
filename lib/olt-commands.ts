export const OLT_COMMAND_MAP = {
  Syrotech: {
    terminalLength0: "terminal length 0",
    // showOnu: "show onu status",
    showOnu: "show pon all onu state",
    showPower: "show pon all onu power",
    save: "write"
  },
  Netlink: {
    terminalLength0: "terminal length 0",
    // Command to list ports (Slot info)
    showPorts: "configure t && show pon optical transceiver all",
    // Base command for ONUs - requires port ID suffix
    showOnu: "show onu state", 
    // Navigation sequence for specific ONU power
    showPowerPrefix: (ponId: string) => `config interface gpon 0/${ponId}`,
    showPowerCmd: (onuId: string) => `show pon rx_power onu ${onuId}`,
    save: "write"
  },
  Alphion: {
    terminalLength0: "no clipaging", // Alphion specific
    // showOnu: "show ont status all",
    showOnu: "show pon all onu state",
    showPower: "show pon all onu optics",
    save: "save"
  },
  Khwaish: {
    terminalLength0: "terminal length 0",
    showOnu: "show pon all onu state",
    showPower: "show pon all onu power",

    save: "write"
  }
};
