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
    page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica', fontSize: 9, lineHeight: 1.4 },
  
    // Header section
    headerContainer: { flexDirection: 'row', marginBottom: 15, alignItems: 'center', justifyContent: 'center', width: '100%', borderBottom: '1px solid #005a9c', paddingBottom: 5 },
    logo: { width: 45, height: 45 },
    headerTextGroup: { marginLeft: 15, flexGrow: 1, alignItems: 'center' },
    reportTitle: { fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', color: '#005a9c' },
    subTitle: { fontSize: 7, fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', marginTop: 2 },
    subOfficeName: { fontSize: 9, fontWeight: 'bold', marginTop: 2 },
    officeName: { fontSize: 10, marginTop: 4, color: '#333' },
  
    // Letter elements
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, fontSize: 9, fontWeight: 'bold' },
    addressBlock: { marginVertical: 10, lineHeight: 1.0 },
    subjectBlock: { marginVertical: 10, fontWeight: 'bold', flexDirection: 'row' },
    bodyText: { marginVertical: 10, textAlign: 'justify', textIndent: 20 },
    sectionTitle: { fontSize: 10, fontWeight: 'bold', marginVertical: 8, textTransform: 'uppercase' },
  
    // Global Table Styling
    table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#000', marginBottom: 10 },
    tableRow: { flexDirection: 'row', minHeight: 22, alignItems: 'center' },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f0f0f0', fontWeight: 'bold', minHeight: 25, alignItems: 'center' },
    tableHeaderGroup: { flexDirection: 'column', flex: 1, alignItems: 'stretch' },
    tableHeaderSubRow: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#000', flex: 1, alignItems: 'center' },
    cellText: { fontSize: 7, padding: 3, textAlign: 'center', fontWeight: 'bold' },
    cellData: { fontSize: 7, padding: 3, textAlign: 'center' },
  
    // Table Borders
    bRight: { borderRightWidth: 1, borderColor: '#000' },
    bBottom: { borderBottomWidth: 1, borderColor: '#000' },
    flex1: { flex: 1, justifyContent: 'center', height: '100%' },
    flex2: { flex: 2, justifyContent: 'center', height: '100%' },
  
    // Columns Widths Page 1
    colSno: { width: '5%' },
    colInv: { width: '15%' },
    colDate: { width: '12%' },
    colAmt: { width: '13%' },
    colQty: { width: '13%' },
    colSap: { width: '15%' },
    colUtil: { width: '15%' },
    colRem: { width: '12%' },
  
    // Columns Widths Page 2
    colP2Sno: { width: '4%' },
    colP2Ex: { width: '12%' },
    colP2Ea: { width: '21%' }, // span 3 sub columns
    colP2Ds: { width: '24%' }, // span 4 sub columns
    colP2Pf: { width: '10%' },
    colP2Er: { width: '10%' },
    colP2Avg: { width: '11%' },
    colP2Rem: { width: '8%' },
  
    subCol3: { width: '33.33%' },
    subCol4: { width: '25%' },
  
    // Footer & Signatures
    footerContainer: { marginTop: 30 },
    enclBlock: { width: '50%', float: 'left', fontSize: 8, lineHeight: 1.4 },
    sigBlockContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, paddingHorizontal: 10 },
    sigBlock: { alignItems: 'center', width: '40%' },
    sigLine: { borderTopWidth: 1, borderColor: '#ffffff', width: '100%', marginTop: 30, textAlign: 'center', fontSize: 8, fontWeight: 'bold' },

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
//   colDate: { width: "10%" },
  colGroupPF: { width: "22%" }, // Power Failure Group
  colGroupEA: { width: "22%" }, // E/A operates Group
  colGroupEAMeter: { width: "24%" }, // E/A Meter Group
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

  totalRow: {
    backgroundColor: '#f5f5f5', 
    fontWeight: 'bold',
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center'
  },

  //   Special Width for Opening/Diesel rows 
  colSpanMiddle: { width: "70%", justifyContent: 'center', paddingLeft: 10, borderRightWidth: 1 },

  // Text Styles
  headerText: { fontWeight: "bold", fontSize: 8 },
  verticalDivider: { flexDirection: "row", flex: 1, width: "100%" },

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
  },

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

  //  PAGE NUMBER TRACKER:
  pageNumberTracker: {
    position: 'absolute',
    bottom: 25,
    right: 35,
    fontSize: 7.5,
    color: '#666666',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  }

});



export const NewStatementPDF = ({ 
    data, 
    officeName, 
    exchangeList,
    openingBalance: passedOpeningBalance,
    fleetCardNumber = "________________", 
    letterMeta = {},
    engineMake,
    engineCapacity,
    engineInstalDate,
    monthReport,
}: any) => {
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

  // Filter out entries that represent actual active fuel purchases for Page 1 table
//   const purchaseRecords = data.filter((item: any) => (item.quantity || 0) > 0);

  


  const purchaseRecords = (data || []).filter((item: any) => (item.quantity || 0) > 0);
  // const calculatedTotalAmount = purchaseRecords.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  // 1. Flatten all purchase logs dynamically exclusively from your active checked exchange list
  const activeInvoices = (exchangeList || [])
    .flatMap((office: any) => office.purchases || [])
    .filter((p: any) => (p.quantity || 0) > 0);

  // 2. Compute the exact aggregate total cost across the entire selected sub-division configuration
  const calculatedTotalAmount = activeInvoices.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);


  return (
    <Document>

      {/* ================= PAGE 1: COVER LETTER & PURCHASE DETAILS ================= */}
        <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header Branding Container */}
        {/* ================= HEADER SECTION BRANDING (PERFECTLY CENTERED GROUP) ================= */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',  // Centers the entire combined group on the page
          alignItems: 'center',      // Aligns logo and text block vertically along the center line
          width: '100%',
          marginBottom: 15
        }}>
          {/* Logo stays on the left side of the grouped unit */}
          <Image src="/logo.png" style={[styles.logo, { width: 45, height: 45 }]} />
          
          {/* Text block stays on the right side of the logo, but aligns its inner items down its center */}
          <View style={{ 
            alignItems: 'center',    // Centers each text line relative to each other
            marginLeft: 15 
          }}>
            <Text style={[styles.reportTitle, { fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', color: '#005a9c', textAlign: 'center' }]}>
              Bharat Sanchar Nigam Limited
            </Text>
            <Text style={{ fontSize: 6, fontWeight: 'bold', textAlign: 'center', marginTop: 1 }}>
              (A Govt. of India Enterprise)
            </Text>
            <Text style={{ fontSize: 9, fontWeight: 'bold', textAlign: 'center', marginTop: 2 }}>
              O/o SDOP, Bellary BA, Bellary
            </Text>
          </View>
        </View>


        {/* Official Letter Meta / Tracking References */}
        <view style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor:'#000000',  width: '100%'}}>
        <View style={[styles.metaRow, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text>Lr. No. {letterMeta?.lrNo || "XXX/XXX/OP/Corr on legal/2026-27/<<NO>>"}</Text>
            
            <Text>dated at Bellary </Text>
            <Text>the {letterMeta?.date || "<<DATE>>"}</Text>
            
        </View>
        </view>

        {/* Target Delivery Recipient Address Block */}
        <View style={styles.addressBlock}>
            <Text style={{ fontWeight: 'bold' }}>To,</Text>
            <Text style={{ marginLeft: 20}}>The SDE (OP),</Text>
            <Text style={{ marginLeft: 20}}>o/o GMTD,</Text>
            <Text style={{ marginLeft: 20}}>BSNL, Bellary.</Text>
        </View>

        {/* Official Reference Subject Line */}
        <View style={styles.subjectBlock}>
            <Text style={{ fontWeight: 'bold', width: 45 }}>Sub: </Text>
            <Text style={{ flex: 1, fontWeight: 'bold' }}>
            {`Forwarding the certified diesel invoices purchased for the month of ${monthReport || '_____-20__'} along with consumption statements and concerned logbook extracts – Reg.`}
            </Text>
        </View>

        {/* Executive Context Body Statement Text */}
        <Text style={styles.bodyText}>
            With reference to the above-cited subject, the diesel/Lubricant oil purchased for the sub-division through the fleet card allotted, for the month of {monthReport || '_____-20__'} towards consumption for E/A sets under sub-division. The details of purchase are furnished below.
        </Text>

        {/* Table Core Structural Identification */}
        <Text style={styles.sectionTitle}>1. Diesel purchase details (Fleet card number: {fleetCardNumber})</Text>
        
        {/* Table 1: Purchase Details Grid Layout */}
        <View style={styles.table}>
            <View style={styles.tableHeader}>
            <Text style={[styles.cellText, styles.colSno, styles.bRight]}>S.No</Text>
            <Text style={[styles.cellText, styles.colInv, styles.bRight]}>Invoice/Receipt Number</Text>
            <Text style={[styles.cellText, styles.colDate, styles.bRight]}>Invoice Date</Text>
            <Text style={[styles.cellText, styles.colAmt, styles.bRight]}>Invoice Amt (Rs.)</Text>
            <Text style={[styles.cellText, styles.colQty, styles.bRight]}>Purchased Qty (Ltrs)</Text>
            <Text style={[styles.cellText, styles.colSap, styles.bRight]}>SAP Doc Number</Text>
            <Text style={[styles.cellText, styles.colUtil, styles.bRight]}>Utilised for</Text>
            <Text style={[styles.cellText, styles.colRem]}>Remarks</Text>
            </View>

            {/* Map iteration compiling purchase logs dynamically
            {((data || []).filter((item: any) => (item.quantity || 0) > 0)).map((item: any, idx: number) => (
            <View key={item.id || idx} style={[styles.row, styles.bBottom]}>
                <Text style={[styles.cellData, styles.colSno, styles.bRight]}>{idx + 1}</Text>
                <Text style={[styles.cellData, styles.colInv, styles.bRight]}>{item.invoiceNumber || item.invoicenumber || '-'}</Text>
                <Text style={[styles.cellData, styles.colDate, styles.bRight]}>{item.purchaseDate || item.date || '-'}</Text>
                <Text style={[styles.cellData, styles.colAmt, styles.bRight]}>
                {typeof item.amount === 'number' ? item.amount.toFixed(2) : (item.amount || '-')}
                </Text>
                <Text style={[styles.cellData, styles.colQty, styles.bRight]}>
                {typeof item.quantity === 'number' ? item.quantity.toFixed(1) : (item.quantity || 0)}
                </Text>
                <Text style={[styles.cellData, styles.colSap, styles.bRight]}>{item.sapDocumentNo || item.sapdocumentno || '-'}</Text>
                <Text style={[styles.cellData, styles.colUtil, styles.bRight]}>E/A at {officeName}</Text>
                <Text style={[styles.cellData, styles.colRem]}>{item.remarks || '-'}</Text>
            </View>
            ))} */}

            {/* Filter purchase logs dynamically across all checked exchanges */}
          {/* Filter purchase logs dynamically */}
          {(() => {
            // 1. Gather all purchases exclusively from the checked exchanges chosen via the user's multiselect dropdown
            const activeInvoices = (exchangeList || [])
              .flatMap((office: any) => office.purchases || [])
              .filter((p: any) => (p.quantity || 0) > 0);

              
            // Calculate Subdivision Subtotals for the bottom row
            const totalSubdivisionQty = activeInvoices.reduce((sum: number, p: any) => sum + Number(p.quantity || 0), 0);
            const totalSubdivisionAmt = activeInvoices.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

            // FALLBACK STATE: If no purchases exist
            if (activeInvoices.length === 0) {
              return (
                <View style={[styles.row, styles.bBottom]}>
                  <Text style={[styles.cellData, styles.colSno, styles.bRight]}>1</Text>
                  <Text style={[styles.cellData, styles.colInv, styles.bRight]}>Nil</Text>
                  <Text style={[styles.cellData, styles.colDate, styles.bRight]}>Nil</Text>
                  <Text style={[styles.cellData, styles.colAmt, styles.bRight]}>Nil</Text>
                  <Text style={[styles.cellData, styles.colQty, styles.bRight]}>Nil</Text>
                  <Text style={[styles.cellData, styles.colSap, styles.bRight]}>Nil</Text>
                  <Text style={[styles.cellData, styles.colUtil, styles.bRight]}>Nil</Text>
                  <Text style={[styles.cellData, styles.colRem]}>Not Purchased</Text>
                </View>
              );
            }

            return (
              <>
                {activeInvoices.map((item: any, idx: number) => {
                  // Dynamically locate the office name associated with this invoice
                  const matchedOffice = (exchangeList || []).find((ex: any) => ex.id === item.officeId);
                  const officeLabel = matchedOffice?.officeName || officeName || "Exchange";

                  return (
                    <View key={item.id || idx} style={[styles.row, styles.bBottom]}>
                      <Text style={[styles.cellData, styles.colSno, styles.bRight]}>{idx + 1}</Text>
                      <Text style={[styles.cellData, styles.colInv, styles.bRight, { fontFamily: 'Courier', fontSize: 6.5 }]}>{item.invoiceNumber || '-'}</Text>
                      <Text style={[styles.cellData, styles.colDate, styles.bRight]}>{item.purchaseDate || '-'}</Text>
                      <Text style={[styles.cellData, styles.colAmt, styles.bRight]}>
                        {typeof item.amount === 'number' ? item.amount.toFixed(2) : '-'}
                      </Text>
                      <Text style={[styles.cellData, styles.colQty, styles.bRight]}>
                        {typeof item.quantity === 'number' ? item.quantity.toFixed(1) : '0.0'}
                      </Text>
                      <Text style={[styles.cellData, styles.colSap, styles.bRight]}>{item.sapDocumentNo || '-'}</Text>
                      <Text style={[styles.cellData, styles.colUtil, styles.bRight]}>E/A at {officeLabel}</Text>
                      <Text style={[styles.cellData, styles.colRem]}>{item.remarks || 'Recorded'}</Text>
                    </View>
                  );
                })}

                {/* Final Total Summary Row */}
                <View style={[styles.row, styles.totalRow]}>
                  <Text style={[styles.cellData, styles.colSno, styles.bRight]}></Text>
                  <Text style={[styles.cellData, styles.colInv, styles.bRight, { fontWeight: 'bold' }]}>TOTAL SUMMARY</Text>
                  <Text style={[styles.cellData, styles.colDate, styles.bRight]}></Text>
                  <Text style={[styles.cellData, styles.colAmt, styles.bRight, { fontWeight: 'bold' }]}>{totalSubdivisionAmt.toFixed(2)}</Text>
                  <Text style={[styles.cellData, styles.colQty, styles.bRight, { fontWeight: 'bold' }]}>{totalSubdivisionQty.toFixed(1)}</Text>
                  <Text style={[styles.cellData, styles.colSap, styles.bRight]}></Text>
                  <Text style={[styles.cellData, styles.colUtil, styles.bRight]}></Text>
                  <Text style={[styles.cellData, styles.colRem]}></Text>
                </View>
              </>
            );
          })()} 

        </View>

        {/* Totals Summary Line Footer */}
        <Text style={{ fontWeight: 'bold', marginTop: 15, fontSize: 9, color: '#1a1a1a' }}>
          {calculatedTotalAmount === 0 
            ? "Total Amount: Rs. Nil (Rupees Nil)"
            : `Total Amount: Rs. ${calculatedTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/- (Rupees ${convertNumberToWords(calculatedTotalAmount)})`
          }
        </Text>

        <Text 
          style={styles.pageNumberTracker} 
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} 
          fixed 
        />
       </Page>


      {/* ================= PAGE 2: CONSUMPTION SUMMARY GENERATOR MAP ================= */}
        <Page size="A4" style={styles.page} orientation="landscape">
        <Text style={styles.sectionTitle}>2. Diesel consumption details</Text>

        {/* Table 2: Multi-Level Complex Header Layout */}
        <View style={styles.table}>
            
            {/* Main Top Header Line */}
            <View style={[styles.row, styles.topRow, styles.bBottom, { flexDirection: 'row', backgroundColor: '#f0f0f0' }]}>
                <View style={[styles.colP2Sno, styles.bRight, { justifyContent: 'center' }]}><Text style={styles.cellText}>S.No</Text></View>
                <View style={[styles.colP2Ex, styles.bRight, { justifyContent: 'center' }]}><Text style={styles.cellText}>Name of the Exchange</Text></View>
                <View style={[styles.colP2Ea, styles.bRight, { justifyContent: 'center' }]}><Text style={styles.cellText}>Engine Alternator</Text></View>
                <View style={[styles.colP2Ds, styles.bRight, { justifyContent: 'center' }]}><Text style={styles.cellText}>Diesel in Litres</Text></View>
                {/* FIXED: Shifted CB here to match the structural column sequence of row 2 */}
                {/* <View style={[styles.colP2Pf, styles.bRight, { justifyContent: 'center' }]}><Text style={styles.cellText}>CB</Text></View> */}
                <View style={[styles.colP2Pf, styles.bRight, { justifyContent: 'center' }]}><Text style={styles.cellText}>Power Failure (HH:MM)</Text></View>
                <View style={[styles.colP2Er, styles.bRight, { justifyContent: 'center' }]}><Text style={styles.cellText}>E/A Run (HH:MM)</Text></View>
                <View style={[styles.colP2Avg, styles.bRight, { justifyContent: 'center' }]}><Text style={styles.cellText}>Avg. Consump (Ltr/Hr)</Text></View>
                <View style={[styles.colP2Rem, { justifyContent: 'center' }]}><Text style={styles.cellText}>Remarks</Text></View>
            </View>

            {/* Sub Header Column Line */}
            <View style={[styles.row, styles.bBottom, { flexDirection: 'row', backgroundColor: '#f0f0f0' }]}>
                <View style={[styles.colP2Sno, styles.bRight]} />
                <View style={[styles.colP2Ex, styles.bRight]} />

                {/* EA Segment Splits */}
                <View style={[styles.colP2Ea, styles.bRight, { flexDirection: 'row' }]}>
                    <View style={[styles.subCol3, styles.bRight]}><Text style={styles.cellText}>Capacity (KVA)</Text></View>
                    <View style={[styles.subCol3, styles.bRight]}><Text style={styles.cellText}>Make</Text></View>
                    <View style={styles.subCol3}><Text style={styles.cellText}>DOI</Text></View>
                </View>

                {/* Litre Segment Splits */}
                <View style={[styles.colP2Ds, styles.bRight, { flexDirection: 'row' }]}>
                    <View style={[styles.subCol4, styles.bRight]}><Text style={styles.cellText}>OB</Text></View>
                    <View style={[styles.subCol4, styles.bRight]}><Text style={styles.cellText}>Purchased</Text></View>
                    <View style={[styles.subCol4, styles.bRight]}><Text style={styles.cellText}>Total</Text></View>
                    <View style={[styles.subCol4, styles.bRight]}><Text style={styles.cellText}>Consumption</Text></View>
                    <View style={styles.subCol4}><Text style={styles.cellText}>CB</Text></View>
                </View>

                {/* Empty placeholders perfectly matching the main column widths above */}
                {/* <View style={[styles.colP2Pf, styles.bRight]} /> */}
                <View style={[styles.colP2Pf, styles.bRight]} />
                <View style={[styles.colP2Er, styles.bRight]} />
                <View style={[styles.colP2Avg, styles.bRight]} />
                <View style={[styles.colP2Rem]} />
            </View>


            {/* Aggregated Calculated Row Data */}
            {/* <View style={[styles.row, styles.bBottom]}>
                <Text style={[styles.cellData, styles.colP2Sno, styles.bRight]}>1</Text>
                <Text style={[styles.cellData, styles.colP2Ex, styles.bRight]}>{officeName}</Text>
            
                <View style={[styles.colP2Ea, styles.bRight, { flexDirection: 'row' }]}>
                    <Text style={[styles.cellData, styles.subCol3, styles.bRight]}>{engineCapacity}</Text>
                    <Text style={[styles.cellData, styles.subCol3, styles.bRight]}>{engineMake}</Text>
                    <Text style={[styles.cellData, styles.subCol3]}>{engineInstalDate || '-'}</Text>
                </View>

                <View style={[styles.colP2Ds, styles.bRight, { flexDirection: 'row' }]}>
                    <Text style={[styles.cellData, styles.subCol4, styles.bRight]}>{(openingBalance || 0).toFixed(2)}</Text>
                    <Text style={[styles.cellData, styles.subCol4, styles.bRight]}>{(totalDieselRefilled || 0).toFixed(2)}</Text>
                    <Text style={[styles.cellData, styles.subCol4, styles.bRight]}>{(totalDeisel4Month || 0).toFixed(2)}</Text>
                    <Text style={[styles.cellData, styles.subCol4]}>{(totalConsumption || 0).toFixed(2)}</Text>
                </View>

                <Text style={[styles.cellData, styles.colP2Pf, styles.bRight]}>{stockBalance || 0}</Text>
                <Text style={[styles.cellData, styles.colP2Er, styles.bRight]}>{formatTime((totalPowerCut || 0).toFixed(1))}</Text>
                <Text style={[styles.cellData, styles.colP2Avg, styles.bRight]}>{formatTime(( totalEngineRun || 0).toFixed(1))}</Text>
                <Text style={[styles.cellData, styles.colP2Rem]}>{(consumptionPerHour || 0).toFixed(2)}</Text>
            </View>
        </View>     */}

        {/* DYNAMIC LOOP: Generates a table row for every office exchange record passed */}
        {(exchangeList || []).map((office: any, idx: number) => {
                // Derive variables safely or fall back to 0 to prevent rendering crashes
                const ob = Number(office.openingBalance || 0);
                const refilled = Number(office.totalDieselRefilled || 0);
                const total = ob + refilled;
                const cons = Number(office.totalConsumption || 0);
                const cb = Number(office.stockBalance || 0);
                const pf = Number(office.totalPowerCut || 0);
                const er = Number(office.totalEngineRun || 0);
                const avgCons = er > 0 ? cons / er : 0;

                return (
                <View key={office.id || idx} style={[styles.row, styles.bBottom]}>
                    <Text style={[styles.cellData, styles.colP2Sno, styles.bRight]}>{idx + 1}</Text>
                    <Text style={[styles.cellData, styles.colP2Ex, styles.bRight, { textAlign: 'left', paddingLeft: 4 }]}>
                        {office.officeName || "Unknown Office"}
                    </Text>
                
                    <View style={[styles.colP2Ea, styles.bRight, { flexDirection: 'row', height: '100%' }]}>
                        <Text style={[styles.cellData, styles.subCol3, styles.bRight]}>{office.engineCapacity || '-'}</Text>
                        <Text style={[styles.cellData, styles.subCol3, styles.bRight]}>{office.engineMake || '-'}</Text>
                        <Text style={[styles.cellData, styles.subCol3]}>{office.engineInstalDate || '-'}</Text>
                    </View>

                    <View style={[styles.colP2Ds, styles.bRight, { flexDirection: 'row', height: '100%' }]}>
                        <Text style={[styles.cellData, styles.subCol4, styles.bRight]}>{ob.toFixed(2)}</Text>
                        <Text style={[styles.cellData, styles.subCol4, styles.bRight]}>{refilled.toFixed(2)}</Text>
                        <Text style={[styles.cellData, styles.subCol4, styles.bRight]}>{total.toFixed(2)}</Text>
                        <Text style={[styles.cellData, styles.subCol4, styles.bRight]}>{cons.toFixed(2)}</Text>
                        <Text style={[styles.cellData, styles.subCol4]}>{cb.toFixed(2)}</Text>
                    </View>

                    {/* <Text style={[styles.cellData, styles.colP2Pf, styles.bRight]}>{cb.toFixed(2)}</Text> */}
                    {/* FIXED: Passing raw numbers into formatTime directly before formatting strings */}
                    <Text style={[styles.cellData, styles.colP2Pf, styles.bRight]}>{formatTime(pf)}</Text>
                    <Text style={[styles.cellData, styles.colP2Er, styles.bRight]}>{formatTime(er)}</Text>
                    <Text style={[styles.cellData, styles.colP2Avg, styles.bRight]}>{avgCons.toFixed(2)}</Text>
                    <Text style={[styles.cellData, styles.colP2Rem]}></Text>
                </View>
                );
            })}
        </View>  
        
        {/* Footnotes & Formal Closures */}
        <View style={styles.footerContainer}>
            <View style={styles.enclBlock}>
            <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>Encl:</Text>
            <Text>1. Certified diesel invoices</Text>
            <Text>2. Logbook extracts of E/As operational</Text>
            </View>
            <View style={styles.sigBlockContainer}>
            <View style={styles.sigBlock}>
                <View style={styles.sigLine} />
                <Text>Signature & seal of the concerned AGM </Text>
            </View>
            <View style={styles.sigBlock}>
                <View style={styles.sigLine} />
                <Text>Signature and seal of the concerned in-charge</Text>
            </View>
            </View>
        </View>

        <Text 
          style={styles.pageNumberTracker} 
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} 
          fixed 
        />
        
        </Page>

       {/* ================= PAGE 3+: STATUTORY VERIFICATION CERTIFICATES (STARTS ON NEW PAGE) ================= */}
        {(exchangeList || []).map((office: any, idx: number) => {
          const ob = Number(office.openingBalance || 0);
          const refilled = Number(office.totalDieselRefilled || office.purchased || 0);
          
          const totalBillAmount = Number(office.totalPurchaseAmount || office.amount || 0);
          const billingLiters = refilled;
          const activeFleetCard =  fleetCardNumber || "____________________________________";

          return (
            <Page 
              key={office.id || idx} 
              size="A4" 
              style={styles.page} 
              orientation="portrait"
            >
              {/* Header Branding Container */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                marginBottom: 20
              }}>
                <Image src="/logo.png" style={{ width: 35, height: 35 }} />
                <View style={{ alignItems: 'center', marginLeft: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: '#005a9c', textAlign: 'center' }}>
                    Bharat Sanchar Nigam Limited
                  </Text>
                  <Text style={{ fontSize: 5.5, fontWeight: 'bold', textAlign: 'center' }}>
                    (A Govt. of India Enterprise)
                  </Text>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', textAlign: 'center', marginTop: 1 }}>
                    O/o SDOP, Bellary BA, Bellary
                  </Text>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { marginBottom: 15, textAlign: 'center' }]}>
                STATUTORY VERIFICATION CERTIFICATE
              </Text>

              <View 
                style={{ 
                  padding: 20, 
                  borderStyle: 'solid', 
                  borderWidth: 1, 
                  borderColor: '#000000',
                  backgroundColor: '#ffffff',
                  flexGrow: 1
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 12, color: '#005a9c' }}>
                  Exchange Node #{idx + 1}: {office.officeName || "Unknown Exchange"}
                </Text>

                {/* FIXED: Removed 'spaceY' and applied explicit explicit individual margins to children */}
                <View style={{ marginBottom: 20, fontSize: 9.5 }}>
                  <Text style={{ marginBottom: 4 }}>1. Diesel purchased from Authorized dealer</Text>
                  <Text style={{ marginBottom: 4 }}>2. Quality is good and quantity is correct</Text>
                  <Text style={{ marginBottom: 4 }}>3. This is a non-stackable item</Text>
                  <Text style={{ marginBottom: 4 }}>
                    4. Diesel utilized for <Text style={{ fontWeight: 'bold', textDecoration: 'underline' }}> {office.officeName || "_________________"} </Text> exchange
                  </Text>
                  <Text style={{ marginBottom: 4 }}>
                    5. Diesel purchased from fleet card <Text style={{ fontWeight: 'bold', fontFamily: 'Courier' }}> {activeFleetCard} </Text>
                  </Text>
                  <Text style={{ marginBottom: 4 }}>
                    6. Bill amount is Rs. <Text style={{ fontWeight: 'bold' }}>{totalBillAmount > 0 ? totalBillAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "__________________________"}</Text> for <Text style={{ fontWeight: 'bold' }}>{billingLiters > 0 ? billingLiters.toFixed(1) : "_____________________"}</Text> Litres.
                  </Text>
                </View>

                {/* Executive Processing / Financial Authorization Seals */}
                <View style={{ marginTop: 25, marginBottom: 35, fontSize: 10, lineHeight: 1.8 }}>
                  <Text style={{ fontWeight: 'bold' }}>
                    Passed and paid for Rs. <Text style={{ textDecoration: 'underline' }}>{totalBillAmount > 0 ? `${totalBillAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-` : "___________________________________"}</Text>
                  </Text>
                  <Text style={{ fontWeight: 'bold', marginTop: 5 }}>
                    Rupees <Text style={{ fontStyle: 'italic', textDecoration: 'underline' }}>{totalBillAmount > 0 ? convertNumberToWords(totalBillAmount) : "________________________________________________________________________"}</Text>
                  </Text>
                </View>

                {/* Pushes signatures cleanly down to the absolute bottom of the box container */}
                <View style={{ flexGrow: 1 }} />

                {/* Official Double Sign-Off Validation Block Grid */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  marginTop: 40,
                  paddingHorizontal: 5
                }}>
                  <View style={{ width: '45%', alignItems: 'center' }}>
                    <View style={{ borderTopWidth: 1, borderColor: '#000000', width: '100%', marginBottom: 4 }} />
                    <Text style={{ fontSize: 8, textAlign: 'center', fontWeight: 'bold' }}>
                      Signature and seal of the concerned AGM
                    </Text>
                  </View>
                  
                  <View style={{ width: '45%', alignItems: 'center' }}>
                    <View style={{ borderTopWidth: 1, borderColor: '#000000', width: '100%', marginBottom: 4 }} />
                    <Text style={{ fontSize: 8, textAlign: 'center', fontWeight: 'bold' }}>
                      Signature & seal of the concerned in-charge
                    </Text>
                  </View>
                </View>
              </View>

              {/* Global Pagination Tracker Module Sync */}
              <Text 
                style={styles.pageNumberTracker} 
                render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} 
                fixed 
              />
            </Page>
          );
        })}



    </Document>
  );
};

const formatTime = (hours: number | null | undefined): string => {
                if (hours === null || hours === undefined || isNaN(hours)) return "00:00";
                
                const absoluteHours = Math.abs(hours);
                const hh = Math.floor(absoluteHours);
                const mm = Math.round((absoluteHours - hh) * 60);
                
                // Format both hours and minutes with leading zeros
                const formattedHours = hh.toString().padStart(2, '0');
                const formattedMinutes = mm.toString().padStart(2, '0');
                
                return `${formattedHours}:${formattedMinutes}`;
};

const convertNumberToWords = (num: number): string => {
    if (num === 0) return "Zero";
    
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
    const numToWords = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + numToWords(n % 100) : '');
      if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + numToWords(n % 1000) : '');
      if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + numToWords(n % 100000) : '');
      return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + numToWords(n % 10000000) : '');
    };
  
    const mainPart = Math.floor(num);
    const paisaPart = Math.round((num - mainPart) * 100);
  
    let words = numToWords(mainPart) + " Rupees";
    if (paisaPart > 0) {
      words += " and " + numToWords(paisaPart) + " Paisa";
    }
    return words + " Only";
  };