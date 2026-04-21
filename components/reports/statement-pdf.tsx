"use client";

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

import { Svg, Path } from "@react-pdf/renderer";

// Helper for Lucide-style icons in PDF
const FuelIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
    <Path d="M3 22L15 22M4 9L14 9M14 22V4C14 2.89543 13.1046 2 12 2L6 2C4.89543 2 4 2.89543 4 4V22M14 15L20 15M20 15C21.1046 15 22 15.8954 22 17V19C22 20.1046 21.1046 21 20 21C18.8954 21 18 20.1046 18 19" />
  </Svg>
);

const TimerIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
    <Path d="M10 2L14 2M12 14L15 11M12 6V1M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.52285 22 12 22Z" />
  </Svg>
);

const styles = StyleSheet.create({
  page: { padding: 30, paddingBottom: 85, fontSize: 9, fontFamily: "Helvetica", color: "#333" },
  
  // 1. Centered Header (Logo & Heading side-by-side)
  headerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  logo: { width: 45, height: 45 },
  headerTextGroup: { flexDirection: "column" },
  reportTitle: { fontSize: 16, fontWeight: "bold", textTransform: "uppercase" },
  officeName: { fontSize: 10, color: "#64748b", marginTop: 2 },

  // 2. Table Layout & Column Styles
  table: { width: "100%", borderTop: 0.5, borderColor: "#cbd5e1" },
  tableHeader: { 
    flexDirection: "row", 
    backgroundColor: "#f1f5f9", 
    borderBottomWidth: 0.5, 
    borderColor: "#cbd5e1", 
    padding: 5,
    fontWeight: "bold"
  },
  tableRow: { 
    flexDirection: "row", 
    borderBottomWidth: 0.5, 
    borderColor: "#e2e8f0", 
    padding: 4, 
    alignItems: "center",
    minHeight: 24 
  },
  colDate: { width: "12%" },
  colTimes: { width: "34%", flexDirection: "row", justifyContent: "space-between", paddingRight: 8 },
  colDuration: { width: "12%", textAlign: "center" },
  colMeter: { width: "18%", textAlign: "center" },
  colQty: { width: "14%", textAlign: "center" },
  colBal: { width: "14%", textAlign: "right" },
  cellText: { fontSize: 6.5, color: "#475569" }, 

  // 3. Centered Summary Table (Vertical Rows)
  summarySection: { marginTop: 25, alignItems: "center" },
  summaryHeading: { 
    fontSize: 11, 
    fontWeight: "bold", 
    textTransform: "uppercase", 
    marginBottom: 8, 
    color: "#1e293b",
    borderBottom: "1pt solid #cbd5e1", // Optional: adds an underline for a cleaner look
    paddingBottom: 2,
    width: 260, // Matches summaryBox width
    textAlign: "center"
  },
  summaryBox: { width: 260, border: "0.5pt solid #94a3b8" },
  summaryRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    padding: 5, 
    borderBottomWidth: 0.5, 
    borderColor: "#e2e8f0" 
  },
  summaryLabel: { fontSize: 8, color: "#475569" },
  summaryValue: { fontSize: 8, fontWeight: "bold" },

  // 4. Positioned Footers
  // footerSignatureRow: {
  //   position: "absolute",
  //   bottom: 55,
  //   left: 30,
  //   right: 30,
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "flex-end",
  // },
  footerSignatureRow: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  dateGenerated: { fontSize: 7.5, color: "#64748b" },
  // signatoryBox: { width: 150, textAlign: "center" },
  signatoryBox: {
    width: 180,
    textAlign: "center",
  },
  // signatoryLine: { borderTop: "1pt solid #000", marginTop: 35, paddingTop: 4, fontWeight: "bold" },
  signatoryLine: {
    borderTop: "0.5pt solid #000",
    marginTop: 40, // Space for physical signature
    paddingTop: 5,
  },
  signatoryText: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  pageNumber: { position: "absolute", bottom: 25, left: 0, right: 0, textAlign: "center", fontSize: 7, color: "#94a3b8" },
  
  designationText: {
    fontSize: 7,
    color: "#64748b",
    marginTop: 2,
  },

  systemFooter: { 
    position: "absolute", 
    bottom: 12, 
    left: 0, 
    right: 0, 
    textAlign: "center", 
    fontSize: 6.5, 
    color: "#cbd5e1",
    textTransform: "uppercase"
  }
});

export const StatementPDF = ({ data, officeName, openingBalance: passedOpeningBalance }: any) => {
  // --- Data Logic (Calculated oldest to newest) ---
  const openingBalance = passedOpeningBalance ?? data.length > 0 
    ? (data[0].runningBalance - (data[0].quantity || 0) + (data[0].dieselConsumption || 0)) 
    : 0;

  const totalDieselRefilled = data.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  const totalConsumption = data.reduce((sum: number, item: any) => sum + (item.dieselConsumption || 0), 0);
  const totalEngineRun = data.reduce((sum: number, item: any) => sum + (item.engineRunDuration || 0), 0);
  const totalPowerCut = data.reduce((sum: number, item: any) => sum + (item.powerCutDuration || 0), 0);
  
  //   Total diesel for the month
  const totalDeisel4Month = openingBalance + totalDieselRefilled;
  // Per Hour Consumption Calculation
  const consumptionPerHour = totalEngineRun > 0 ? (totalConsumption / totalEngineRun) : 0;
  
  // Closing Balance (Final row of the ledger)
  const stockBalance = data.length > 0 ? data[data.length - 1].runningBalance : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER SECTION */}
        <View style={styles.headerContainer}>
          <Image src="/logo.png" style={styles.logo} />
          <View style={styles.headerTextGroup}>
            <Text style={styles.reportTitle}>BHARATH SANCHAR NIGAM LIMITED</Text>
            <Text style={{fontSize: 6, fontWeight: "bold", textAlign: "center"}}>(A Govt. of India Enterprises)</Text>
            <Text style={{fontSize: 9, fontWeight: "bold"}}>o/o SDOP, BELLARY BA, BELLARY</Text>
            <Text style={styles.officeName}>DG Statement for : {officeName}</Text>
          </View>
        </View>

        {/* LEDGER DATA TABLE */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDate}>Date</Text>
            <View style={styles.colTimes}>
              <Text style={styles.cellText}>P.Off </Text>
              <Text style={styles.cellText}>E.On</Text>
              <Text style={styles.cellText}>P.On</Text>
              <Text style={styles.cellText}> E.Off</Text>
            </View>
            <Text style={styles.colDuration}>Run(h)</Text>
            <Text style={styles.colMeter}>Meter(O-C)</Text>
            <Text style={styles.colQty}>Diesel(+)</Text>
            <Text style={styles.colBal}>Balance</Text>
          </View>

          {/* OPENING BALANCE ROW */}
          {/* <View style={styles.tableRow}>
            <Text style={styles.colDate}>
              {data.length > 0 ? new Date(data[0].date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').fill('01', 0, 1).join('/') : '--'}
            </Text>
            <Text style={{ width: "74%", fontStyle: "italic", fontSize: 8, color: "#64748b" }}>
              OPENING BALANCE CARRIED FORWARD
            </Text>
            <Text style={styles.colBal}>{openingBalance.toFixed(2)}</Text>
          </View> */}

          {/* Log data Rows */}
          {data.map((log: any, i: number) => {
            
              // SPECIAL HANDLING FOR OPENING ROW
              if (log.rowType === 'OPENING') {
                return (
                  <View key={i} style={styles.tableRow}>
                    <Text style={styles.colDate}>{new Date(log.date).toLocaleDateString('en-GB')}</Text>
                    <Text style={{ width: "74%", fontStyle: "italic", fontSize: 8, color: "#64748b" }}>
                      OPENING BALANCE CARRIED FORWARD
                    </Text>
                    <Text style={styles.colBal}>{log.runningBalance.toFixed(2)}</Text>
                  </View>
                );
              }
              
            const isDiesel = log.rowType === 'DIESEL';

            
            return (
              <View key={i} style={styles.tableRow} wrap={false}>
                <Text style={styles.colDate}>{new Date(log.date).toLocaleDateString('en-GB')}</Text>
                {isDiesel ? (
                  <Text style={{ width: "65%", fontStyle: "italic", color: "#059669", fontSize: 8 }}>
                    ADDED HSD FOR {officeName.toUpperCase()} (DG Sl.No: {log.engineSerial}): +{log.quantity} L
                  </Text>
                ) : (
                  <>
                    <View style={styles.colTimes}>
                      <Text style={styles.cellText}>{log.powerOff ? new Date(log.powerOff).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false}) : '--'}</Text>
                      <Text style={styles.cellText}>{log.engineOn ? new Date(log.engineOn).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false}) : '--'}</Text>
                      <Text style={styles.cellText}>{log.powerOn ? new Date(log.powerOn).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false}) : '--'}</Text>
                      <Text style={styles.cellText}>{log.engineOff ? new Date(log.engineOff).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false}) : '--'}</Text>
                    </View>
                    <Text style={styles.colDuration}>{log.engineRunDuration?.toFixed(2)}</Text>
                    <Text style={styles.colMeter}>{log.openMeterReading}-{log.closeMeterReading}</Text>
                  </>
                )}
                <Text style={[styles.colQty, { color: isDiesel ? "#059669" : "#dc2626" }]}>
                  {/* {isDiesel ? `+${log.quantity}` : `-${log.dieselConsumption?.toFixed(2)}`} */}
                  {isDiesel? `+${log.quantity}` : ''}
                </Text>
                <Text style={styles.colBal}>{log.runningBalance.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        {/* CLOSING BALANCE ROW */}
        <View style={[styles.tableRow, { backgroundColor: "#f8fafc" }]}>
          <Text style={styles.colDate}>
            {data.length > 0 ? new Date(data[data.length - 1].date).toLocaleDateString('en-GB') : '--'}
          </Text>
          <Text style={{ width: "74%", fontWeight: "bold", fontSize: 8 }}>
            CLOSING STOCK BALANCE AS ON DATE
          </Text>
          <Text style={[styles.colBal, { fontWeight: "bold" }]}>
            {stockBalance.toFixed(2)} L
          </Text>
        </View>

        {/* SUMMARY SECTION (Centered) */}
        <View style={styles.summarySection} wrap={false}>
             {/* New Heading Added Here */}
          <Text style={styles.summaryHeading}>Summary of DG Run:</Text>

          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Opening Balance:</Text>
              <Text style={styles.summaryValue}>{openingBalance.toFixed(2)} L</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Diesel Refilled (+):</Text>
              <Text style={styles.summaryValue}>{totalDieselRefilled.toFixed(2)} L</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Diesel for Month (=):</Text>
              <Text style={styles.summaryValue}>{totalDeisel4Month.toFixed(2)} L</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Power Cut Duration:</Text>
              <Text style={styles.summaryValue}>{totalPowerCut.toFixed(2)} Hrs</Text>
            </View>
            <View style={styles.summaryRow}>
              {/* <Text style={styles.summaryLabel}>Total Engine Run Duration:</Text> */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <TimerIcon />
                    <Text style={styles.summaryLabel}>Total Engine Run Duration:</Text>
                </View>
                <Text style={styles.summaryValue}>{totalEngineRun.toFixed(2)} Hrs</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Diesel Consumption (-):</Text>
              <Text style={styles.summaryValue}>{totalConsumption.toFixed(2)} L</Text>
            </View>
            <View style={styles.summaryRow}>
              {/* <Text style={styles.summaryLabel}>Consumption Per Hour:</Text> */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <FuelIcon />
                    <Text style={styles.summaryLabel}>Consumption Per Hour:</Text>
                </View>
                <Text style={styles.summaryValue}>{consumptionPerHour.toFixed(2)} L/Hr</Text>
            </View>
            <View style={[styles.summaryRow, { backgroundColor: "#f8fafc", borderBottomWidth: 0 }]}>
              <Text style={[styles.summaryLabel, { fontWeight: "bold" }]}>Closing Diesel Stock:</Text>
              <Text style={[styles.summaryValue, { fontSize: 10 }]}>{stockBalance.toFixed(2)} L</Text>
            </View>
          </View>
        </View>

        {/* FOOTER: Date (Left) and Authorized Signature (Right) */}
        <View style={styles.footerSignatureRow} fixed>
          <Text style={styles.dateGenerated}>
            Report Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
          </Text>
           {/* Left Side: Preparer/JTO */}
          <View style={styles.signatoryBox}>
            <View style={styles.signatoryLine} />
            <Text style={styles.signatoryText}>Junior Telecom Officer (U)</Text>
            <Text style={styles.designationText}>o/o SDOP, BSNL, Bellary</Text>
          </View>

          <View style={styles.signatoryBox}>
            <View style={styles.signatoryLine} />
            <Text style={styles.signatoryText}>Sub-Divisional Engineer,</Text>
            <Text style={styles.designationText}>o/o GMTD, Bellary,</Text>
          </View>
        </View>

        {/* ABSOLUTE BOTTOM PAGE INFO */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
        <Text style={styles.systemFooter} fixed>
          This is a system generated report. No signature required if verified electronically. © 2026 SDOP BSNL Bellary.
        </Text>

      </Page>
    </Document>
  );
};
