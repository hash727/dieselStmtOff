import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica', fontSize: 9, lineHeight: 1.4 },
  
  // Header section
  headercontainer: { flexDirection: 'row', marginBottom: 15, alignItems: 'center', borderBottom: '2px solid #005a9c', paddingBottom: 10 },
  logo: { width: 45, height: 45 },
  headertextgroup: { marginLeft: 15, flexGrow: 1, alignItems: 'center' },
  reporttitle: { fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', color: '#005a9c' },
  subtitle: { fontSize: 7, fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', marginTop: 2 },
  subofficename: { fontSize: 9, fontWeight: 'bold', marginTop: 2 },
  officename: { fontSize: 10, marginTop: 4, color: '#333' },

  // Letter elements
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, fontSize: 9, fontWeight: 'bold' },
  addressBlock: { marginVertical: 10, lineHeight: 1.5 },
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
  sigLine: { borderTopWidth: 1, borderColor: '#ffffff', width: '100%', marginTop: 30, textAlign: 'center', fontSize: 8, fontWeight: 'bold' }
});



export const CompleteStatementPDF = ({ data = [], officename, openingbalance: passedopeningbalance, fleetCardNumber = "________________", letterMeta = {} }: any) => {
  
  // --- Data Logic (Calculated oldest to newest) ---
  const openingbalance = passedopeningbalance ?? (data.length > 0 
    ? (data[0].runningbalance - (data[0].quantity || 0) + (data[0].dieselconsumption || 0)) 
    : 0);

  const totaldieselrefilled = data.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  const totalconsumption = data.reduce((sum: number, item: any) => sum + (item.dieselconsumption || 0), 0);
  const totalenginerun = data.reduce((sum: number, item: any) => sum + (item.enginerunduration || 0), 0);
  const totalpowercut = data.reduce((sum: number, item: any) => sum + (item.powercutduration || 0), 0);

  const totaldeisel4month = openingbalance + totaldieselrefilled;
  const consumptionperhour = totalenginerun > 0 ? (totalconsumption / totalenginerun) : 0;
  const stockbalance = data.length > 0 ? data[data.length - 1].runningbalance : 0;

  // Filter out entries that represent actual active fuel purchases for Page 1 table
  const purchaseRecords = data.filter((item: any) => (item.quantity || 0) > 0);

  return (
    <Document>
      
      {/* ================= PAGE 1: COVER LETTER & PURCHASE DETAILS ================= */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headercontainer}>
          <Image src="/logo.png" style={styles.logo} />
          <View style={styles.headertextgroup}>
            <Text style={styles.reporttitle}>Bharat Sanchar Nigam Limited</Text>
            <Text style={styles.subtitle}>(A Govt. of India Enterprise)</Text>
            <Text style={styles.subofficename}>Office of the Principal General Manager Telecom, Bellary BA</Text>
            <Text style={styles.officename}>DG Statement For: {officename}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text>Lr. No. {letterMeta.lrNo || "XXX/XXX/OP/Corr on legal/2026-27/<<NO>>"}</Text>
          <Text>dated at Bellary the {letterMeta.date || "<<DATE>>"}</Text>
        </View>

        <View style={styles.addressBlock}>
          <Text style={{ fontWeight: 'bold' }}>To,</Text>
          <Text>The Incharge Officer,</Text>
          <Text>BSNL Sub-Division, Bellary Area.</Text>
        </View>

        <View style={styles.subjectBlock}>
          <Text style={{ fontWeight: 'bold', width: '45' }}>Sub: </Text>
          <Text style={{ flex: 1, fontWeight: 'bold' }}>
            Forwarding the certified diesel invoices purchased for the month of May-2026 along with consumption statements and concerned logbook extracts – Reg.
          </Text>
        </View>

        <Text style={styles.bodyText}>
          With reference to the above-cited subject, the diesel/Lubricant oil purchased for the sub-division through the fleet card allotted, for the month of May-2026 towards consumption for E/A sets under sub-division. The details of purchase are furnished below.
        </Text>

        <Text style={styles.sectionTitle}>1. Diesel purchase details (Fleet card number: {fleetCardNumber})</Text>
        
        {/* Table 1: Purchase Details */}
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

          {purchaseRecords.map((item: any, idx: number) => (
            <View key={idx} style={[styles.tableRow, styles.bBottom]}>
              <Text style={[styles.cellData, styles.colSno, styles.bRight]}>{idx + 1}</Text>
              <Text style={[styles.cellData, styles.colInv, styles.bRight]}>{item.invoicenumber || '-'}</Text>
              <Text style={[styles.cellData, styles.colDate, styles.bRight]}>{item.date || '-'}</Text>
              <Text style={[styles.cellData, styles.colAmt, styles.bRight]}>{item.amount || '-'}</Text>
              <Text style={[styles.cellData, styles.colQty, styles.bRight]}>{item.quantity || 0}</Text>
              <Text style={[styles.cellData, styles.colSap, styles.bRight]}>{item.sapdocumentno || '-'}</Text>
              <Text style={[styles.cellData, styles.colUtil, styles.bRight]}>E/A at {officename}</Text>
              <Text style={[styles.cellData, styles.colRem]}>{item.remarks || '-'}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontWeight: 'bold', marginTop: 10, fontSize: 9 }}>
          Total Amount: Rs. ___________________________ (Rupees _____________________________________________)
        </Text>
      </Page>


      {/* ================= PAGE 2: CONSUMPTION SUMMARY GENERATOR MAP ================= */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>2. Diesel consumption details</Text>

        {/* Table 2: Multi-Level Complex Header Layout */}
        <View style={styles.table}>
          
          {/* Main Top Header Line */}
          <View style={[styles.tableHeader, styles.bBottom]}>
            <View style={[styles.colP2Sno, styles.bRight, styles.flex1]}><Text style={styles.cellText}>S.No</Text></View>
            <View style={[styles.colP2Ex, styles.bRight, styles.flex1]}><Text style={styles.cellText}>Name of the Exchange</Text></View>
            <View style={[styles.colP2Ea, styles.bRight, styles.flex1]}><Text style={styles.cellText}>Engine Alternator</Text></View>
            <View style={[styles.colP2Ds, styles.bRight, styles.flex1]}><Text style={styles.cellText}>Diesel in Litres</Text></View>
            <View style={[styles.colP2Pf, styles.bRight, styles.flex1]}><Text style={styles.cellText}>Power Failure (HH:MM)</Text></View>
            <View style={[styles.colP2Er, styles.bRight, styles.flex1]}><Text style={styles.cellText}>E/A Run (HH:MM)</Text></View>
            <View style={(styles.colP2Avg, styles.bRight, styles.flex1)}><Text style={styles.cellText}>Avg. Consump (Ltr/Hr)</Text></View>
            <View style={(styles.colP2Rem, styles.flex1)}><Text style={styles.cellText}>Remarks</Text></View>
          </View>
          
          {/* Sub Header Column Line */}
          <View style={(styles.tableHeader, styles.bBottom)}>
            <View style={(styles.colP2Sno, styles.bRight)}>
                <View style={(styles.colP2Ex, styles.bRight)}>
                    {/* EA Segment Splits */}
                    <View style={(styles.colP2Ea, styles.bRight, { flexDirection: 'row' })}>
                        <View style={(styles.subCol3, styles.bRight)}>Capacity (KVA)</View>
                        <View style={(styles.subCol3, styles.bRight)}>Make </View>
                        <View style={(styles.subCol3, styles.bRight)}>DOI </View>
                    </View>
                    {/* Litre Segment Splits */}
                    <View style={(styles.colP2Ds, styles.bRight, { flexDirection: 'row' })}>
                        <View style={(styles.subCol4, styles.bRight)}>OB</View>
                        <View style={(styles.subCol4, styles.bRight)}>Purchased & Filled</View>
                        <View style={(styles.subCol4, styles.bRight)}>Total</View>
                        <View style={(styles.subCol4, styles.bRight)}>Consumption</View>
                        <View style={(styles.colP2Pf, styles.bRight)}>CB</View>
                    </View>
                </View>
            </View>
          </View>
            <View style={(styles.colP2Er, styles.bRight)}>
                <View style={(styles.colP2Avg, styles.bRight)}>
                    {/* Aggregated Calculated Row Data */}
                    <View style={(styles.tableRow, styles.bBottom)}>
                        <Text style={(styles.cellData, styles.colP2Sno, styles.bRight)}>1</Text>
                        <Text style={(styles.cellData, styles.colP2Ex, styles.bRight)}>{officename}</Text>
                        <View style={(styles.colP2Ea, styles.bRight, { flexDirection: 'row' })}>
                            <Text style={(styles.cellData, styles.subCol3, styles.bRight)}>15 KVA</Text>
                            <Text style={(styles.cellData, styles.subCol3, styles.bRight)}>Kirloskar</Text>
                            <Text style={(styles.cellData, styles.subCol3)}>-</Text>
                            <View style={(styles.colP2Ds, styles.bRight, { flexDirection: 'row' })}>
                                <Text style={(styles.cellData, styles.subCol4, styles.bRight)}>{openingbalance}</Text>
                                <Text style={(styles.cellData, styles.subCol4, styles.bRight)}>{totaldieselrefilled}</Text>
                                <Text style={(styles.cellData, styles.subCol4, styles.bRight)}>{totaldeisel4month}</Text>
                                <Text style={(styles.cellData, styles.subCol4)}>{totalconsumption}</Text>
                                <Text style={(styles.cellData, styles.colP2Pf, styles.bRight)}>{stockbalance}</Text>
                                <Text style={(styles.cellData, styles.colP2Er, styles.bRight)}>{totalpowercut.toFixed(1)}</Text>
                                <Text style={(styles.cellData, styles.colP2Avg, styles.bRight)}>{totalenginerun.toFixed(1)}</Text>
                                <Text style={(styles.cellData, styles.colP2Rem)}>{consumptionperhour.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>    
        
        {/* Footnotes & Formal Closures */}
        <Text style={{ fontWeight: 'bold' }}>Encl:1. Certified diesel invoices2. Logbook extracts of E/As operationalSignature & seal of the concerned in-chargeSignature and seal of the concerned AGM</Text>
        
        {/* ================= PAGE 3: DETAILED LEDGER (Original Snippet Code Structure) ================= */}
        3. Detailed Daily Logbook Statement Breakdown
        <Text style={(styles.cellText, { width: '15%' }, styles.bRight)}>Date</Text>
        <Text style={(styles.cellText, { width: '15%' }, styles.bRight)}>Power Cut (Hr)</Text>
        <Text style={(styles.cellText, { width: '15%' }, styles.bRight)}>Engine Run (Hr)</Text>
        <Text style={(styles.cellText, { width: '15%' }, styles.bRight)}>Refilled Qty</Text>
        <Text style={(styles.cellText, { width: '15%' }, styles.bRight)}>Consumption</Text>
        <Text style={(styles.cellText, { width: '25%' })}>Running Balance</Text>
        {data.map(
            (item: any, index: number) => (
                <View key={index} style={(styles.tableRow, styles.bBottom)}>
                    <Text style={(styles.cellData, { width: '15%' }, styles.bRight)}>{item.date || '-'}</Text>
                    <Text style={(styles.cellData, { width: '15%' }, styles.bRight)}>{item.powercutduration || 0}</Text>
                    <Text style={(styles.cellData, { width: '15%' }, styles.bRight)}>{item.enginerunduration || 0}</Text>
                    <Text style={(styles.cellData, { width: '15%' }, styles.bRight)}>{item.quantity || 0}</Text>
                    <Text style={(styles.cellData, { width: '15%' }, styles.bRight)}>{item.dieselconsumption || 0}</Text>
                    <Text style={(styles.cellData, { width: '25%' })}>{item.runningbalance || 0}</Text>
                </View>    
                )
            )
        }
    </Page>
    </Document>
  );
}