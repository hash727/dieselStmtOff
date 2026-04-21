// utils/anomaly-logic.ts
export function detectFuelAnomaly(
    openingStock: number, 
    consumption: number, 
    reportedClosing: number, 
    threshold = 2
  ) {
    const expectedClosing = openingStock - consumption;
    const variance = expectedClosing - reportedClosing;
  
    return {
      isAnomaly: variance > threshold,
      variance: variance.toFixed(2),
      message: `Discrepancy of ${variance.toFixed(2)}L detected (Possible leak/theft)`
    };
  }
  