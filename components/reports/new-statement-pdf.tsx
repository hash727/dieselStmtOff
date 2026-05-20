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

const formatTime = (dateInput: string | Date | null) => {
    if (!dateInput) return "--";
    const date = new Date(dateInput);
    // Returns HH:mm (e.g., 14:30)
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
};

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
//   colDate: { width: "12%" },
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
  },

  // Row Containers
  row: { flexDirection: "row", minHeight: 20, borderBottomWidth: 1 },
  topRow: { borderTopWidth: 1 },
  bottomRow: { flexDirection: "row", minHeight: 20 },
  
  
  // Column Bases
  cell: { 
    borderRightWidth: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 2,
    textAlign: "center" 
  },
  lastCell: { borderRightWidth: 1 },
  firstCell: { borderLeftWidth: 1 },

  // Specific Widths
  colDate: { width: "10%" },
  colGroupPF: { width: "22%" }, // Power Failure Group
  colGroupEA: { width: "22%" }, // E/A operates Group
  colGroupEAMeter: { width: "26%" }, // E/A Meter Group
  colDiesel: { width: "20%" },

  // Sub-column Widths (inside groups)
  subColTime: { width: "30%", height: "100%", justifyContent: "center", textAlign: "center", borderRightWidth: 1 },
  subColMeter: { width: "30%", height: "100%", justifyContent: "center", textAlign: "center", borderRightWidth: 1 },
  subColDur: { width: "40%", height: "100%", justifyContent: "center", textAlign: "center", borderRightWidth: 1 },

  lastSubColTime: { width: "30%", height: "100%", justifyContent: "center", textAlign: "center" },
  lastSubColMeter: { width: "30%", height: "100%", justifyContent: "center", textAlign: "center" },
  lastSubColDur: { width: "40%", height: "100%", justifyContent: "center", textAlign: "center", fontWeight: 'bold' },

  totalSubCellBorder: { 
    borderLeftWidth: 1, 
    borderBottomWidth: 1, 
    borderRightWidth: 1,
    justifyContent: "center", 
    alignItems: "center", 
    padding: 2,
    textAlign: "center" 
  },

  //   Special Width for Opening/Diesel rows 
  colSpanMiddle: { width: "70%", justifyContent: 'center', paddingLeft: 10, borderRightWidth: 1 },

  // Text Styles
  headerText: { fontWeight: "bold", fontSize: 8 },
  verticalDivider: { flexDirection: "row", flex: 1, width: "100%" },

  summaryContainer: {
    marginTop: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
  },
  summaryMainHeader: {
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 4,
    textAlign: "center",
    backgroundColor: "#f8fafc",
  },
  summaryGrid: {
    flexDirection: "row",
    height: 40, // Height for header + data rows
  },
  summaryCol: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "space-between",
  },
  summaryColLast: {
    flex: 1,
    justifyContent: "space-between",
  },
  labelCell: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
    padding: 2,
    borderBottomWidth: 1,
    borderColor: "#000",
    height: 20,
  },
  valueCell: {
    fontSize: 8,
    textAlign: "center",
    padding: 2,
    height: 20,
    justifyContent: "center",
  }

});

export const NewStatementPDF = ({ data, officeName, openingBalance: passedOpeningBalance }: any) => {
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
            <Text style={{fontSize: 9, fontWeight: "bold"}}>o/o SDOP, BELLARY BA, BELLARY, e-mail: sdopbellary@gmail.com</Text>
            <Text style={styles.officeName}>DG Statement for : {officeName}</Text>
          </View>
        </View>
        
       

        

        {/* LEDGER DATA TABLE */}
        <View style={styles.table}>

             {/* TOP HEADER ROW */}
            <View style={[styles.row, styles.topRow, { backgroundColor: "#f9f9f9" }]}>
                <View style={[styles.firstCell, styles.cell, styles.colDate]}><Text style={styles.headerText}>Date</Text></View>
                <View style={[styles.cell, styles.colGroupPF, styles.verticalDivider]}><Text style={styles.headerText}>Power failure (HH:MM)</Text></View>
                <View style={[styles.cell, styles.colGroupEA, styles.verticalDivider]}><Text style={styles.headerText}>E/A operates (HH:MM)</Text></View>
                <View style={[styles.cell, styles.colGroupEAMeter, styles.verticalDivider]}><Text style={styles.headerText}>E/A </Text></View>
                <View style={[styles.cell, styles.colDiesel, styles.lastCell]}><Text style={styles.headerText}>Diesel Balance (Ltrs)</Text></View>
            </View>
          
          {/* SUB-HEADER ROW */}
          <View style={[styles.row, { height: 25 }]}>
            <View style={[styles.firstCell, styles.cell, styles.colDate, { backgroundColor: "#f0f0f0" }]} /> {/* Empty under Date */}
                
            
            {/* Power Failure Sub */}
            <View style={[styles.colGroupPF, styles.verticalDivider]}>
                <View style={styles.subColTime}><Text>From</Text></View>
                <View style={styles.subColTime}><Text>To</Text></View>
                <View style={[styles.subColDur, styles.cell]} wrap={true}><Text>Duration (minutes)</Text></View>
            </View>

            {/* E/A Operates Sub */}
            <View style={[styles.colGroupEA, styles.verticalDivider]}>
                <View style={styles.subColTime}><Text>From</Text></View>
                <View style={styles.subColTime}><Text>To</Text></View>
                <View style={[styles.subColDur, styles.cell]} wrap={true}><Text>Duration (minutes)</Text></View>
            </View>

            {/* E/A Meter Sub */}
            <View style={[styles.colGroupEAMeter, styles.verticalDivider]}>
                <View style={styles.subColMeter}><Text>OMR</Text></View>
                <View style={styles.subColMeter}><Text>CMR</Text></View>
                <View style={[styles.subColDur, styles.cell]} wrap={true}><Text>Duration (minutes)</Text></View>
            </View>

            <View style={[styles.cell, styles.colDiesel, styles.lastCell]}><Text>OB:</Text></View>
          </View>

          
          {/* DATA ROWS */}
          {data.map((log: any, i: number) => {
            const isDiesel = log.rowType === 'DIESEL';
            const isOpening = log.rowType === 'OPENING';

            if (isOpening || isDiesel) {
                return (
                    <View key={i} style={styles.row}>
                        <View style={[styles.firstCell, styles.cell, styles.colDate]}>
                            <Text>{new Date(log.date).toLocaleDateString('en-GB')}</Text>
                        </View>
                        {/* 68% matches PF + EA + EAMeter exactly */}
                        <View style={[styles.colSpanMiddle, isDiesel ? { backgroundColor: '#f0fdf4' } : {}]}>
                            <Text style={{ fontStyle: "italic", color: isDiesel ? "#059669" : "#64748b" }}>
                                {isOpening ? "OPENING BALANCE CARRIED FORWARD" : `ADDED HSD: +${log.quantity} L (DG Sl.No: ${log.engineSerial})`}
                            </Text>
                        </View>
                        <View style={[styles.cell, styles.colDiesel, styles.lastCell]}>
                            <Text style={{ fontWeight: "bold" }}>{log.runningBalance?.toFixed(2)}</Text>
                        </View>
                    </View>
                );
            }

            return (
                <View key={i} style={styles.row} wrap={false}>
                    <View style={[styles.firstCell, styles.cell, styles.colDate, { backgroundColor: "#f9f9f9" }]}>
                        <Text>{new Date(log.date).toLocaleDateString('en-GB')}</Text>
                    </View>

                    {/* Power Failure Group */}
                    <View style={[styles.colGroupPF, styles.verticalDivider]}>
                        <View style={styles.subColTime}><Text>{log.powerOff ? formatTime(log.powerOff) : '--'}</Text></View>
                        <View style={styles.subColTime}><Text>{log.powerOn ? formatTime(log.powerOn) : '--'}</Text></View>
                        <View style={styles.subColDur}><Text>{Math.round(log.powerCutDuration * 60)?.toFixed(0)}</Text></View>
                    </View>

                    {/* E/A Operates Group */}
                    <View style={[styles.colGroupEA, styles.verticalDivider]}>
                        <View style={styles.subColTime}><Text>{log.engineOn ? formatTime(log.engineOn) : '--'}</Text></View>
                        <View style={styles.subColTime}><Text>{log.engineOff ? formatTime(log.engineOff) : '--'}</Text></View>
                        <View style={styles.subColDur}><Text>{Math.round(log.engineRunDuration * 60)?.toFixed(0)}</Text></View>
                    </View>

                    {/* E/A Meter Group */}
                    <View style={[styles.colGroupEAMeter, styles.verticalDivider]}>
                        <View style={styles.subColMeter}><Text>{(log.openMeterReading).toFixed(2)}</Text></View>
                        <View style={styles.subColMeter}><Text>{(log.closeMeterReading.toFixed(2))}</Text></View>
                        <View style={styles.subColDur}><Text>{Math.round((log.closeMeterReading - log.openMeterReading)*60).toFixed(0)}</Text></View>
                    </View>

                    <View style={[styles.cell, styles.colDiesel, styles.lastCell]}>
                        <Text style={{ fontWeight: "bold" }}>{log.runningBalance?.toFixed(2)}</Text>
                    </View>
                </View>
            );
        })}

            <View style={[styles.bottomRow, { height: 25 }]}>
                <View style={[styles.totalSubCellBorder, styles.colDate]}>
                    <Text>
                        Total
                    </Text>
                </View>
                
                {/* Power Failure Sub */}
            <View style={[styles.colGroupPF, styles.verticalDivider]}>
                <View style={[styles.lastSubColTime, { backgroundColor: "#f0f0f0" }]} />
                <View style={[styles.lastSubColTime, { backgroundColor: "#f0f0f0" }]} />
                <View style={[styles.totalSubCellBorder, styles.lastSubColDur]} wrap={true}>
                    <Text>
                        {(Math.round((totalPowerCut * 60) / 5) * 5).toFixed(0)}
                    </Text>
                </View>
            </View>

            {/* E/A Operates Sub */}
            <View style={[styles.colGroupEA, styles.verticalDivider]}>
                <View style={[styles.lastSubColTime, { backgroundColor: "#f0f0f0" }]} />
                <View style={[styles.lastSubColTime, { backgroundColor: "#f0f0f0" }]} />
                <View style={[styles.totalSubCellBorder, styles.lastSubColDur]} wrap={true}>
                    <Text>
                        {(Math.round((totalEngineRun * 60) / 5) * 5).toFixed(0)}
                    </Text>
                </View>
            </View>

            {/* E/A Meter Sub */}
            <View style={[styles.colGroupEAMeter, styles.verticalDivider]}>
                <View style={[styles.lastSubColMeter, { backgroundColor: "#f0f0f0" }]} />
                <View style={[styles.lastSubColMeter, { backgroundColor: "#f0f0f0" }]} />
                <View style={[styles.totalSubCellBorder, styles.lastSubColDur]} wrap={true}>
                    <Text>
                        {(Math.round((totalEngineRun * 60) / 5) * 5).toFixed(0)}
                    </Text>
                </View>
            </View>

            <View style={[styles.colDiesel, { backgroundColor: "#f0f0f0" }]} />
            </View>
        </View>

        {/* CLOSING BALANCE ROW
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
        </View> */}

        <View style={styles.summaryContainer} wrap={false}>
            {/* TOP LEVEL HEADER */}
            <View style={styles.summaryMainHeader}>
                <Text style={[styles.summaryHeading, { marginBottom: 0 }]}>Diesel (Ltrs)</Text>
            </View>

            {/* GRID ROWS */}
            <View style={styles.summaryGrid}>
                {/* OB Column */}
                <View style={styles.summaryCol}>
                    <Text style={styles.labelCell}>OB</Text>
                    <View style={styles.valueCell}><Text>{openingBalance.toFixed(2)}</Text></View>
                </View>

                {/* Purchase Column */}
                <View style={styles.summaryCol}>
                    <Text style={styles.labelCell}>Purchase</Text>
                    <View style={styles.valueCell}><Text>{totalDieselRefilled.toFixed(2)}</Text></View>
                </View>

                {/* Total Column */}
                <View style={styles.summaryCol}>
                    <Text style={styles.labelCell}>Total</Text>
                    <View style={styles.valueCell}><Text>{totalDeisel4Month.toFixed(2)}</Text></View>
                </View>

                {/* Consumption Column */}
                <View style={styles.summaryCol}>
                    <Text style={styles.labelCell}>Consumption</Text>
                    <View style={styles.valueCell}><Text>{totalConsumption.toFixed(2)}</Text></View>
                </View>

                {/* CB Column */}
                <View style={styles.summaryCol}>
                    <Text style={styles.labelCell}>CB</Text>
                    <View style={styles.valueCell}><Text>{stockBalance.toFixed(2)}</Text></View>
                </View>

                {/* Ltr/Hr Column */}
                <View style={styles.summaryColLast}>
                    <Text style={styles.labelCell}>Consumption (Ltr/Hr)</Text>
                    <View style={styles.valueCell}><Text>{consumptionPerHour.toFixed(2)}</Text></View>
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
