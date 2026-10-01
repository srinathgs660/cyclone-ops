const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const ROOT_DIR = path.resolve(__dirname, '../..');
const OUTPUT_PATH = path.join(ROOT_DIR, 'Cyclone_Disaster_Management_System_Complete_Documentation.pdf');

class MasterDocumentBuilder {
  constructor(outputPath) {
    this.outputPath = outputPath;
    this.doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true,
      autoFirstPage: true
    });
    this.writeStream = fs.createWriteStream(outputPath);
    this.doc.pipe(this.writeStream);

    this.contentWidth = this.doc.page.width - 100;
    this.bottomThreshold = this.doc.page.height - 55;
  }

  // Pure Professional Grayscale Palette
  cBlack = '#111827';
  cDarkGray = '#374151';
  cMutedGray = '#4B5563';
  cLightGray = '#F9FAFB';
  cBorder = '#D1D5DB';
  cDivider = '#9CA3AF';
  cHeaderBg = '#F3F4F6';

  ensureSpace(neededHeight) {
    if (this.doc.y + neededHeight > this.bottomThreshold) {
      this.doc.addPage();
    }
  }

  coverPage() {
    const doc = this.doc;
    const width = doc.page.width;
    const height = doc.page.height;

    doc.rect(40, 40, width - 80, height - 80).lineWidth(1.5).stroke(this.cBlack);
    doc.rect(43, 43, width - 86, height - 86).lineWidth(0.5).stroke(this.cDivider);

    doc.fillColor(this.cDarkGray)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('NATIONAL DISASTER MANAGEMENT & EMERGENCY OPERATIONS CENTER (EOC)', 60, 65, { align: 'center', width: width - 120 });
    
    doc.fillColor(this.cMutedGray)
      .fontSize(8)
      .font('Helvetica')
      .text('DIRECTORATE OF CYCLONE WARNING, HAZARD MITIGATION & RELIEF LOGISTICS', 60, 78, { align: 'center', width: width - 120 });

    doc.moveTo(60, 95).lineTo(width - 60, 95).lineWidth(1).stroke(this.cBlack);

    doc.fillColor(this.cBlack)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('CYCLONE DISASTER MANAGEMENT SYSTEM', 60, 135, { align: 'center', width: width - 120 });

    doc.fillColor(this.cDarkGray)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('COMPLETE SOURCE CODE REFERENCE & TECHNICAL SPECIFICATION MANUAL', 60, 168, { align: 'center', width: width - 120 });

    doc.fillColor(this.cMutedGray)
      .fontSize(9)
      .font('Helvetica')
      .text('Exhaustive File-by-File, Model-by-Model, Service-by-Service & Page-by-Page Technical Reference for all 78 Source Files with Real Code Snippets, OpenStreetMap GIS Engine, Real-Time Satellite Telemetry & RBAC Security', 75, 195, { align: 'center', width: width - 150, lineGap: 3 });

    doc.moveTo(140, 245).lineTo(width - 140, 245).lineWidth(0.5).stroke(this.cDivider);

    // Executive Scope Box
    doc.rect(60, 265, width - 120, 275).fillAndStroke(this.cLightGray, this.cBorder);

    doc.fillColor(this.cBlack)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('MASTER TECHNICAL SPECIFICATION & COMPREHENSIVE DOCUMENTATION SCOPE', 75, 280);

    const summaryPoints = [
      '1. Complete Source Code Analysis: Detailed functional and architectural walkthrough of every single file in the backend (server.js, 14 models, 9 services, 14 routes, middlewares, configs) and frontend (main.jsx, App.jsx, 4 contexts, layouts, map engine, 5 components, all 15 pages).',
      '2. Zero-Cost GIS Mapping Engine: In-depth explanation of OpenStreetMap raster streaming, CSS dark filter shaders, GeoJSON coordinate projections, animated SVG vector DivIcons, concentric wind radii (34kt, 50kt, 64kt), 72h forecast trajectory cones, and viewport flight transitions.',
      '3. Real-Time Telemetry & Satellite Ingestion: Architectural analysis of NASA EONET and UN-OCHA GDACS multi-satellite ingestion pipelines, automated 15-minute polling, barometric normalization, and Socket.IO duplex event channels.',
      '4. Strict Role-Based Access Control (RBAC): Exhaustive operational permission matrices for Admin (EOC Commander), Operations Officer, NDRF Responders, Logistics Coordinators, Community Volunteers, and Public Citizens.',
      '5. Mathematical Formulations: Algorithmic derivations for multi-criteria coastal risk scoring, roadway evacuation clearance times, and priority-based shelter resource deficit optimization.',
      '6. Full Code Snippets: Real implementation code directly extracted and explained for every single module in the application.'
    ];

    let sy = 302;
    summaryPoints.forEach(pt => {
      doc.fillColor(this.cDarkGray)
        .fontSize(8)
        .font('Helvetica')
        .text(pt, 75, sy, { width: width - 150, lineGap: 2.2 });
      sy += 36;
    });

    const metaY = height - 195;
    doc.moveTo(60, metaY).lineTo(width - 60, metaY).lineWidth(0.8).stroke(this.cBlack);

    const metaItems = [
      ['Document Title:', 'Cyclone Disaster Management System Master Reference', 'System Version:', '5.0.0 (Comprehensive Source Master)'],
      ['Document Classification:', 'Official Technical Architecture & Code Specification', 'Architecture:', 'MERN Stack + Socket.IO + Leaflet GIS'],
      ['Database Engine:', 'MongoDB 6.0+ (14 Collections, 2dsphere Indexes)', 'Runtime Platform:', 'Node.js LTS (v18 / v20)'],
      ['Frontend Framework:', 'React 18.2 SPA via Vite 5 + Tailwind CSS', 'Coverage:', '100% of All Project Source Code Files (78 Files)'],
      ['Publication Date:', 'September 2026', 'Security Tier:', 'RBAC Operational Multi-Agency Standard']
    ];

    let rowY = metaY + 12;
    metaItems.forEach(r => {
      doc.fillColor(this.cBlack).fontSize(7.5).font('Helvetica-Bold').text(r[0], 65, rowY);
      doc.fillColor(this.cDarkGray).fontSize(7.5).font('Helvetica').text(r[1], 195, rowY);
      doc.fillColor(this.cBlack).fontSize(7.5).font('Helvetica-Bold').text(r[2], 340, rowY);
      doc.fillColor(this.cDarkGray).fontSize(7.5).font('Helvetica').text(r[3], 430, rowY);
      rowY += 14;
    });

    doc.addPage();
  }

  tableOfContents() {
    this.chapterHeading('TABLE OF CONTENTS', 'Master System Architecture & Chapter Directory');

    const toc = [
      { id: '1.0', title: 'Executive Overview & Full-Stack System Architecture', desc: 'Disaster mandate, multi-tier MERN topology, asynchronous event loops, and data communication lifecycles.' },
      { id: '2.0', title: 'User Roles, Operational Responsibilities & RBAC Access Matrix', desc: 'Comprehensive comparison of Admin, Officer, Responder, Coordinator, Volunteer, and Citizen capabilities.' },
      { id: '3.0', title: 'GIS Mapping Subsystem: How Maps Work, Leaflet & Satellite Feeds', desc: 'Exhaustive deep-dive on OpenStreetMap raster streaming, CSS dark shaders, coordinate projections, custom SVG DivIcons, wind radii, trajectory forecast cones, and satellite API ingestion.' },
      { id: '4.0', title: 'Complete Backend Source Code Reference (Server)', desc: 'Exhaustive analysis of server.js, configs, middlewares, all 14 database models, all 9 business services, all 14 route controllers, and database seed scripts.' },
      { id: '5.0', title: 'Complete Frontend Source Code Reference (Client)', desc: 'Exhaustive analysis of main.jsx, App.jsx, index.css, all 4 global contexts, master layout, map components, UI elements, and all 15 user interface pages.' },
      { id: '6.0', title: 'Real-Time Telemetry, WebSocket Protocols & Satellite Ingestion', desc: 'Socket.IO duplex event channels, background sync cron, NASA EONET and UN-OCHA GDACS APIs, and scenario simulation engines.' },
      { id: '7.0', title: 'Mathematical Disaster Formulations & Algorithmic Engines', desc: 'In-depth mathematical formulations for multi-criteria risk scoring, evacuation clearance times, and priority-based relief optimization.' },
      { id: '8.0', title: 'Step-by-Step End-to-End Operational Workflows', desc: 'Chronological operational scenarios: storm detection -> risk modeling -> evacuation -> civilian SOS -> NDRF rescue -> relief supply chain -> recovery.' },
      { id: '9.0', title: 'Installation, Configuration, Database Seeding & Troubleshooting', desc: 'Prerequisites, environment variable specifications, database seeding execution, scrolling architecture fixes, and production build verification.' }
    ];

    toc.forEach(item => {
      this.ensureSpace(38);
      const y = this.doc.y;
      
      this.doc.rect(50, y, 28, 18).fillAndStroke(this.cHeaderBg, this.cBorder);
      this.doc.fillColor(this.cBlack).fontSize(8.5).font('Helvetica-Bold').text(item.id, 52, y + 4, { width: 24, align: 'center' });

      this.doc.fillColor(this.cBlack).fontSize(9.5).font('Helvetica-Bold').text(item.title, 88, y);
      this.doc.fillColor(this.cMutedGray).fontSize(8).font('Helvetica').text(item.desc, 88, y + 13, { width: this.contentWidth - 40 });

      this.doc.y = y + 36;
    });

    this.doc.addPage();
  }

  chapterHeading(title, subtitle) {
    this.ensureSpace(60);
    const doc = this.doc;
    const y = doc.y;

    doc.rect(50, y, 4, 30).fill(this.cBlack);
    doc.fillColor(this.cBlack).fontSize(13.5).font('Helvetica-Bold').text(title, 62, y + 2);
    if (subtitle) {
      doc.fillColor(this.cMutedGray).fontSize(8.5).font('Helvetica').text(subtitle, 62, y + 18);
    }
    doc.y = y + 36;
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).lineWidth(0.8).stroke(this.cBlack);
    doc.moveDown(0.6);
  }

  sectionHeading(title) {
    this.ensureSpace(40);
    const doc = this.doc;
    doc.fillColor(this.cBlack).fontSize(10.5).font('Helvetica-Bold').text(title);
    doc.moveDown(0.3);
  }

  subHeading(title) {
    this.ensureSpace(30);
    const doc = this.doc;
    doc.fillColor(this.cDarkGray).fontSize(9.5).font('Helvetica-Bold').text(title);
    doc.moveDown(0.25);
  }

  fileBlockHeader(filePath, fileType, roleSummary) {
    this.ensureSpace(48);
    const doc = this.doc;
    const y = doc.y;

    doc.rect(50, y, this.contentWidth, 22).fillAndStroke(this.cHeaderBg, this.cBorder);
    doc.fillColor(this.cBlack).fontSize(8.5).font('Courier-Bold').text(filePath, 58, y + 5);
    doc.fillColor(this.cMutedGray).fontSize(7.5).font('Helvetica-Bold').text(fileType.toUpperCase(), this.contentWidth - 80, y + 6, { align: 'right' });

    doc.y = y + 26;
    doc.fillColor(this.cDarkGray).fontSize(8).font('Helvetica-Oblique').text(`Role & Purpose: ${roleSummary}`, 50, doc.y, { width: this.contentWidth });
    doc.moveDown(0.4);
  }

  paragraph(text, options = {}) {
    const doc = this.doc;
    doc.fillColor(options.color || this.cDarkGray)
      .fontSize(options.size || 8.5)
      .font(options.font || 'Helvetica')
      .text(text, {
        width: this.contentWidth,
        lineGap: options.lineGap !== undefined ? options.lineGap : 2,
        align: options.align || 'left'
      });
    doc.moveDown(options.moveDown !== undefined ? options.moveDown : 0.45);
  }

  bullet(title, text) {
    const doc = this.doc;
    this.ensureSpace(24);
    const y = doc.y;
    doc.fillColor(this.cBlack).fontSize(9).text('•', 55, y);
    doc.fillColor(this.cBlack).fontSize(8.5).font('Helvetica-Bold').text(title + ': ', 66, y, { continued: true });
    doc.fillColor(this.cDarkGray).font('Helvetica').text(text, { width: this.contentWidth - 20, lineGap: 1.5 });
    doc.moveDown(0.35);
  }

  codeBox(codeSnippet, label = '') {
    const doc = this.doc;
    const lines = codeSnippet.split('\n');
    const height = Math.max(26, lines.length * 9.2 + 10);
    this.ensureSpace(height + (label ? 18 : 8));

    if (label) {
      doc.fillColor(this.cBlack).fontSize(7.5).font('Helvetica-Bold').text(label, 50, doc.y);
      doc.moveDown(0.2);
    }
    
    const y = doc.y;
    doc.rect(50, y, this.contentWidth, height).fillAndStroke(this.cLightGray, this.cBorder);

    doc.fillColor(this.cBlack).fontSize(6.8).font('Courier').text(codeSnippet, 58, y + 6, {
      width: this.contentWidth - 16,
      lineGap: 1.2
    });

    doc.y = y + height + 6;
  }

  renderTable(headers, rows, colWidths) {
    const doc = this.doc;
    const startX = 50;
    const totalW = colWidths.reduce((a, b) => a + b, 0);

    const drawHeader = () => {
      this.ensureSpace(22);
      const hy = doc.y;
      doc.rect(startX, hy, totalW, 18).fillAndStroke(this.cHeaderBg, this.cBorder);
      let hx = startX;
      headers.forEach((h, idx) => {
        doc.fillColor(this.cBlack).fontSize(8).font('Helvetica-Bold').text(h, hx + 4, hy + 4, {
          width: colWidths[idx] - 8
        });
        hx += colWidths[idx];
      });
      doc.y = hy + 18;
    };

    drawHeader();

    rows.forEach((row, rIdx) => {
      let maxHeight = 16;
      row.forEach((cell, cIdx) => {
        const textH = doc.heightOfString(cell, { width: colWidths[cIdx] - 8, fontSize: 7.5 });
        if (textH + 6 > maxHeight) maxHeight = textH + 6;
      });

      if (doc.y + maxHeight > this.bottomThreshold) {
        doc.addPage();
        drawHeader();
      }

      const y = doc.y;
      const rowBg = rIdx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
      doc.rect(startX, y, totalW, maxHeight).fillAndStroke(rowBg, this.cBorder);

      let cellX = startX;
      row.forEach((cell, cIdx) => {
        doc.fillColor(this.cDarkGray).fontSize(7.5).font('Helvetica').text(cell, cellX + 4, y + 4, {
          width: colWidths[cIdx] - 8,
          lineGap: 1.2
        });
        cellX += colWidths[cIdx];
      });

      doc.y = y + maxHeight;
    });

    doc.moveDown(0.5);
  }

  addHeadersAndFooters() {
    const totalPages = this.doc.bufferedPageRange().count;
    for (let i = 1; i < totalPages; i++) {
      this.doc.switchToPage(i);
      const width = this.doc.page.width;
      const height = this.doc.page.height;

      // Temporarily set margins to zero so header and footer in margins never trigger an automatic page break
      this.doc.page.margins.top = 0;
      this.doc.page.margins.bottom = 0;

      // Top Running Header
      this.doc.moveTo(50, 35).lineTo(width - 50, 35).lineWidth(0.5).stroke(this.cBorder);
      this.doc.fillColor(this.cMutedGray).fontSize(7.5).font('Helvetica')
        .text('CYCLONE DISASTER MANAGEMENT SYSTEM • COMPLETE SOURCE SPECIFICATION', 50, 22, { lineBreak: false });
      this.doc.fillColor(this.cMutedGray).fontSize(7.5).font('Helvetica')
        .text('OFFICIAL OPERATIONAL STANDARD', width - 230, 22, { width: 180, align: 'right', lineBreak: false });

      // Bottom Running Footer
      this.doc.moveTo(50, height - 35).lineTo(width - 50, height - 35).lineWidth(0.5).stroke(this.cBorder);
      this.doc.fillColor(this.cMutedGray).fontSize(7.5).font('Helvetica')
        .text('EOC Disaster Response Command Center Platform (Full-Stack MERN Architecture)', 50, height - 26, { lineBreak: false });
      this.doc.fillColor(this.cBlack).fontSize(7.5).font('Helvetica-Bold')
        .text(`Page ${i + 1} of ${totalPages}`, width - 150, height - 26, { width: 100, align: 'right', lineBreak: false });
    }
  }

  save() {
    this.addHeadersAndFooters();
    this.doc.end();
    return new Promise((resolve, reject) => {
      this.writeStream.on('finish', resolve);
      this.writeStream.on('error', reject);
    });
  }
}

// Utility to read file excerpt safely
function getFileSnippet(relPath, maxLines = 30) {
  const full = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(full)) return '// File not found';
  const lines = fs.readFileSync(full, 'utf8').split('\n').slice(0, maxLines);
  return lines.join('\n');
}

// Document Detailed File Section
function documentFile(builder, filePath, fileType, role, explanation, codeSnippet) {
  builder.fileBlockHeader(filePath, fileType, role);
  builder.paragraph(explanation);
  if (codeSnippet) {
    builder.codeBox(codeSnippet, `Source Listing: ${filePath}`);
  }
}
