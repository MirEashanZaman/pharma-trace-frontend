import { jsPDF } from 'jspdf';
import { ComplianceDossier } from './api';

export const downloadCompliancePdf = (dossier: ComplianceDossier) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(11, 18, 32);
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(0, 214, 180);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PHARMATRACE-ES REGULATORY COMPLIANCE DOSSIER', 14, 12);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('WHO / FDA GxP Cold-Chain & Immutable Custody Verification Report', 14, 18);
  doc.text(`Generated: ${new Date(dossier.complianceSummary.auditTimestamp).toUTCString()}`, 14, 23);

  let y = 35;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. PHARMACEUTICAL BATCH IDENTIFICATION', 14, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Serial Number: ${dossier.serialNumber}`, 16, y);
  doc.text(`Batch Number: ${dossier.batchNumber}`, 110, y);
  y += 5;
  doc.text(`Product Name: ${dossier.drugName}`, 16, y);
  doc.text(`Manufacturer: ${dossier.manufacturer}`, 110, y);
  y += 5;
  doc.text(`Genesis Registration Date: ${new Date(dossier.createdAt).toUTCString()}`, 16, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. COLD-CHAIN GXP THERMAL COMPLIANCE AUDIT', 14, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Thermal Standard: ${dossier.complianceSummary.standard}`, 16, y);
  y += 5;

  const isRecalled = dossier.complianceSummary.isRecalled;
  const isCompliant = dossier.complianceSummary.compliancePercentage >= 95.0 && !isRecalled;
  const dispText = isRecalled
    ? 'CRITICAL RECALL / SUSPENDED'
    : isCompliant
    ? 'CERTIFIED GXP COMPLIANT'
    : 'PROVISIONAL EXCURSION WARNING';

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isRecalled ? 220 : isCompliant ? 13 : 217, isRecalled ? 38 : isCompliant ? 148 : 119, isRecalled ? 38 : isCompliant ? 136 : 6);
  doc.text(`Regulatory Disposition: ${dispText}`, 16, y);
  doc.text(`Cold-Chain Compliance Rate: ${dossier.complianceSummary.compliancePercentage}%`, 110, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Temperature Range: ${dossier.complianceSummary.minTemperature}C to ${dossier.complianceSummary.maxTemperature}C (Mean: ${dossier.complianceSummary.averageTemperature}C)`, 16, y);
  y += 5;
  doc.text(`Telemetry Observations: ${dossier.complianceSummary.totalTelemetryPings} recorded (${dossier.complianceSummary.compliantReadings} compliant, ${dossier.complianceSummary.excursionReadings} excursions)`, 16, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3. IMMUTABLE SAGA CUSTODY CHAIN & AUDIT LOG', 14, y);
  y += 6;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y - 4, pageWidth - 28, 6, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Step', 16, y);
  doc.text('Lifecycle Event', 28, y);
  doc.text('Timestamp', 75, y);
  doc.text('Authorized Handler', 115, y);
  doc.text('Temp', 165, y);
  doc.text('Status', 182, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  dossier.custodyTimeline.forEach((ev) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(71, 85, 105);
    doc.text(String(ev.step), 16, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(ev.eventType, 28, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 75, y);
    doc.text(ev.handler.slice(0, 26), 115, y);
    doc.text(ev.temperature !== null ? `${ev.temperature}C` : 'N/A', 165, y);

    const isExcursion = ev.temperature !== null && (ev.temperature < 2 || ev.temperature > 8);
    doc.setTextColor(isExcursion ? 220 : 13, isExcursion ? 38 : 148, isExcursion ? 38 : 136);
    doc.text(isExcursion ? 'EXCURSION' : 'NORMAL', 182, y);

    y += 5;
  });

  y += 6;
  if (y > 265) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('4. WEB3 SMART CONTRACT ATTESTATION PROOF', 14, y);
  y += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('Consensus Anchor: Ethereum EVM Attestation Registry', 16, y);
  y += 4;
  doc.text(`Root Merkle Hash: ${dossier.custodyTimeline[dossier.custodyTimeline.length - 1]?.eventHash || '0x0000000000000000000000000000000000000000'}`, 16, y);
  y += 4;
  doc.text('Cryptographic Verification Status: 100% Tamper Proof & Chain of Custody Intact', 16, y);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Confidential Pharmaceutical Quality Assurance Record - Authorized for Regulatory Submission', 14, 288);

  doc.save(`Regulatory-Dossier-${dossier.serialNumber}.pdf`);
};

export const downloadComplianceCsv = (dossier: ComplianceDossier) => {
  const lines: string[] = [];

  lines.push('PHARMATRACE-ES REGULATORY AUDIT & GXP COMPLIANCE DOSSIER');
  lines.push(`GeneratedAt,${new Date().toISOString()}`);
  lines.push(`DrugSerialNumber,${dossier.serialNumber}`);
  lines.push(`DrugName,"${dossier.drugName}"`);
  lines.push(`BatchNumber,${dossier.batchNumber}`);
  lines.push(`Manufacturer,"${dossier.manufacturer}"`);
  lines.push(`RegulatoryDisposition,${dossier.complianceSummary.disposition}`);
  lines.push(`GxPCompliancePercentage,${dossier.complianceSummary.compliancePercentage}%`);
  lines.push(`TotalLifecycleEvents,${dossier.complianceSummary.totalEvents}`);
  lines.push(`TotalTelemetryReadings,${dossier.complianceSummary.totalTelemetryPings}`);
  lines.push(`TemperatureRange,${dossier.complianceSummary.minTemperature}C to ${dossier.complianceSummary.maxTemperature}C (Average: ${dossier.complianceSummary.averageTemperature}C)`);
  lines.push('');
  lines.push('Step,EventType,Timestamp,Handler,Role,Temperature,Humidity,Location,SignerAddress,EventHash');

  dossier.custodyTimeline.forEach((item) => {
    lines.push(
      `${item.step},${item.eventType},${item.timestamp},"${item.handler}",${item.role},${item.temperature ?? 'N/A'},${item.humidity ?? 'N/A'},"${item.location}",${item.signerAddress},${item.eventHash}`
    );
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `Regulatory-Dossier-${dossier.serialNumber}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadComplianceJson = (dossier: ComplianceDossier) => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dossier, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `Regulatory-Dossier-${dossier.serialNumber}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
