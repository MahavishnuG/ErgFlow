import jsPDF from 'jspdf';
import { DaySummary, UserSettings, StreakInfo } from '../types';

export const generateWeeklyHealthPdf = (
  weeklyData: DaySummary[],
  settings: UserSettings,
  streakInfo: StreakInfo
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Header background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Accent stripe
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 42, pageWidth, 2.5, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('ErgoFlow Workday Health & Sedentary Report', margin, 18);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // slate-300
  const dateRangeStr = weeklyData.length > 0 
    ? `${weeklyData[0].date} to ${weeklyData[weeklyData.length - 1].date}`
    : new Date().toLocaleDateString();
  doc.text(`Employee / User: ${settings.userName || 'Workday Hero'}  |  Schedule: ${settings.officeHours.startHour}:00 - ${settings.officeHours.endHour}:00  |  Period: ${dateRangeStr}`, margin, 27);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, 34);

  // Key KPI Cards Section
  let currentY = 54;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Weekly Executive Summary', margin, currentY);

  currentY += 6;

  // Calculate totals
  const totalWater = weeklyData.reduce((acc, d) => acc + d.waterMl, 0);
  const totalStandBreaks = weeklyData.reduce((acc, d) => acc + d.standBreaks, 0);
  const totalStandMins = weeklyData.reduce((acc, d) => acc + d.standMinutes, 0);
  const totalScreenRests = weeklyData.reduce((acc, d) => acc + d.screenRests, 0);
  const totalSedentaryMins = weeklyData.reduce((acc, d) => acc + d.sedentaryMinutes, 0);
  const avgHealthScore = weeklyData.length > 0
    ? Math.round(weeklyData.reduce((acc, d) => acc + d.healthScore, 0) / weeklyData.length)
    : 85;

  const cardWidth = (contentWidth - 9) / 4;
  const cardHeight = 26;

  const cards = [
    { title: 'Health Score', value: `${avgHealthScore}/100`, sub: 'Optimal Range', bg: [240, 253, 250], border: [20, 184, 166] },
    { title: 'Total Hydration', value: `${(totalWater / 1000).toFixed(1)} L`, sub: `${Math.round(totalWater / 250)} glasses`, bg: [239, 246, 255], border: [59, 130, 246] },
    { title: 'Stand & Walks', value: `${totalStandBreaks} breaks`, sub: `${totalStandMins} active mins`, bg: [240, 253, 244], border: [34, 197, 94] },
    { title: 'Sedentary Time', value: `${(totalSedentaryMins / 60).toFixed(1)} hrs`, sub: `Streak: ${streakInfo.currentStreak} Days`, bg: [254, 242, 242], border: [239, 68, 68] },
  ];

  cards.forEach((card, idx) => {
    const cardX = margin + idx * (cardWidth + 3);
    doc.setFillColor(card.bg[0], card.bg[1], card.bg[2]);
    doc.setDrawColor(card.border[0], card.border[1], card.border[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(card.title, cardX + 3, currentY + 7);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(card.value, cardX + 3, currentY + 15);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(card.sub, cardX + 3, currentY + 22);
  });

  currentY += cardHeight + 12;

  // Daily Activity Breakdown Table
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Daily Breakdown (Office Hours 9:00 - 18:00)', margin, currentY);

  currentY += 6;

  // Table header
  const cols = [
    { title: 'Date', width: 28 },
    { title: 'Water Intake', width: 28 },
    { title: 'Stand Breaks', width: 30 },
    { title: 'Active Walk', width: 26 },
    { title: 'Screen Rests', width: 26 },
    { title: 'Sedentary (h)', width: 24 },
    { title: 'Status', width: 22 },
  ];

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  let colX = margin + 2;
  cols.forEach((col) => {
    doc.text(col.title, colX, currentY + 5.5);
    colX += col.width;
  });

  currentY += 8;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  weeklyData.forEach((row, i) => {
    const isEven = i % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, contentWidth, 7.5, 'F');
    }

    doc.setTextColor(30, 41, 59);
    let rowX = margin + 2;

    // Date
    const dayName = new Date(row.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    doc.text(dayName, rowX, currentY + 5);
    rowX += cols[0].width;

    // Water
    doc.text(`${row.waterMl} ml (${Math.round(row.waterMl / 250)}g)`, rowX, currentY + 5);
    rowX += cols[1].width;

    // Stand breaks
    doc.text(`${row.standBreaks} breaks`, rowX, currentY + 5);
    rowX += cols[2].width;

    // Active walk
    doc.text(`${row.standMinutes} mins`, rowX, currentY + 5);
    rowX += cols[3].width;

    // Screen rests
    doc.text(`${row.screenRests} times`, rowX, currentY + 5);
    rowX += cols[4].width;

    // Sedentary hours
    doc.text(`${(row.sedentaryMinutes / 60).toFixed(1)} hrs`, rowX, currentY + 5);
    rowX += cols[5].width;

    // Status
    if (row.goalMet) {
      doc.setTextColor(16, 185, 129);
      doc.text('✓ Goals Met', rowX, currentY + 5);
    } else {
      doc.setTextColor(245, 158, 11);
      doc.text('⚠ Partial', rowX, currentY + 5);
    }

    currentY += 7.5;
  });

  currentY += 10;

  // Ergonomic Assessment & Health Insights
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Occupational Health & Ergonomics Analysis', margin, currentY);

  currentY += 6;

  const insights = [
    {
      title: 'Sedentary Interruption Impact',
      text: `You broke your seated posture ${totalStandBreaks} times this week, preventing blood pooling in lower extremities, stabilizing postprandial glucose levels, and alleviating lumbar spine compression.`,
    },
    {
      title: 'Hydration & Cognitive Endurance',
      text: `Consuming ${(totalWater / 1000).toFixed(1)} Liters of water during work hours prevented midday cognitive sluggishness and sustained optimal cerebral perfusion.`,
    },
    {
      title: 'Visual Ergonomics (20-20-20 Rule)',
      text: `By pausing for ${totalScreenRests} micro-eye rests every 20 minutes, your ciliary muscles relaxed, counteracting Computer Vision Syndrome (CVS) and dry eye discomfort.`,
    },
  ];

  insights.forEach((item) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`• ${item.title}`, margin + 3, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const splitText = doc.splitTextToSize(item.text, contentWidth - 8);
    doc.text(splitText, margin + 4, currentY + 10.5);

    currentY += 19;
  });

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, 280, pageWidth - margin, 280);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('ErgoFlow • Automated Sedentary Prevention & Health Activity Tracker • Office Hours 9-6 Sync', margin, 285);
  doc.text(`Page 1 of 1`, pageWidth - margin - 15, 285);

  // Save the PDF
  const filename = `ergoflow-weekly-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
