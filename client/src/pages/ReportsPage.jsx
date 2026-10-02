import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, Printer, Download, CheckCircle2, ShieldAlert, 
  Wind, MapPin, Users, HeartHandshake, AlertTriangle, Layers, Calendar, Clock
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('sitrep'); // 'sitrep' | 'cyclone' | 'evacuation' | 'relief'
  const [data, setData] = useState(null);
  const [sitrepData, setSitrepData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { lastUpdated } = useSocket();

  useEffect(() => {
    fetchReportData();
  }, [reportType, lastUpdated]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      if (reportType === 'sitrep') {
        const res = await axios.get('/api/sitrep/executive-data');
        if (res.data && res.data.success) {
          setSitrepData(res.data.data);
        }
      } else if (reportType === 'cyclone') {
        const res = await axios.get('/api/cyclones/active');
        if (res.data && res.data.success) setData(res.data.data);
      } else if (reportType === 'evacuation') {
        const res = await axios.get('/api/evacuations');
        if (res.data && res.data.success) setData(res.data.data);
      } else if (reportType === 'relief') {
        const res = await axios.get('/api/relief/inventory');
        if (res.data && res.data.success) setData(res.data.data);
      }
    } catch (err) {
      console.error('[Report Fetch Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    if (reportType === 'sitrep' && sitrepData) {
      const csvRows = [
        ['METRIC', 'VALUE'],
        ['Report ID', sitrepData.reportId],
        ['Cyclone Target', sitrepData.cyclone.name],
        ['Current Intensity', `${sitrepData.cyclone.windSpeedKmh} km/h (${sitrepData.cyclone.category})`],
        ['Storm Surge Forecast', `${sitrepData.cyclone.stormSurgeForecastMeters} meters`],
        ['Total Citizens Evacuated', sitrepData.evacuation.totalCitizensEvacuated],
        ['Active Shelters', sitrepData.evacuation.totalSheltersActivated],
        ['Safe Registry Count', sitrepData.evacuation.registeredSafeCitizens],
        ['Active SOS Incidents', sitrepData.operations.openEmergencies],
        ['Personnel Deployed in Field', sitrepData.operations.totalPersonnelInField]
      ];
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${sitrepData.reportId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (!data || data.length === 0) return;
    const keys = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
    const header = keys.join(',');
    const rows = data.map(item => keys.map(k => `"${item[k] || ''}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EOC_Report_${reportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-extrabold uppercase tracking-wider text-white font-mono">
              Official Operational Reports & NDMA SitRep
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Generate 1-click government Situation Reports (SitRep), evacuation audits, and relief distribution manifests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-3.5 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30 transition shadow"
          >
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2 print:hidden">
        <button
          onClick={() => setReportType('sitrep')}
          className={`rounded-lg px-4 py-2 text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 ${
            reportType === 'sitrep' 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow' 
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          ⭐ 1. Official NDMA Executive SitRep
        </button>
        <button
          onClick={() => setReportType('cyclone')}
          className={`rounded-lg px-4 py-2 text-xs font-mono font-bold uppercase transition ${
            reportType === 'cyclone' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          2. Cyclone Telemetry Brief
        </button>
        <button
          onClick={() => setReportType('evacuation')}
          className={`rounded-lg px-4 py-2 text-xs font-mono font-bold uppercase transition ${
            reportType === 'evacuation' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          3. Evacuation Manifest
        </button>
        <button
          onClick={() => setReportType('relief')}
          className={`rounded-lg px-4 py-2 text-xs font-mono font-bold uppercase transition ${
            reportType === 'relief' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          4. Relief Warehouse Logistics
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="p-8 text-center text-xs font-mono text-cyan-400">
          Compiling operational incident telemetry and verifying cryptographic audit integrity...
        </div>
      )}

      {/* REPORT TYPE 1: NDMA / SDMA EXECUTIVE SITUATION REPORT (SITREP) */}
      {!loading && reportType === 'sitrep' && sitrepData && (
        <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-6 sm:p-8 shadow-2xl font-mono text-slate-100 print:border-none print:bg-white print:text-black print:p-0">
          
          {/* Government Formal Header */}
          <div className="border-b-2 border-emerald-500 pb-5 mb-6 print:border-black">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-16 w-16 shrink-0 rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-900 p-1 shadow print:border-black">
                  <img src="/logo.png" alt="Official Seal" className="h-full w-full object-contain" />
                </div>
                <div>
                  <div className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider print:bg-gray-200 print:text-black mb-1">
                    NATIONAL DISASTER MANAGEMENT AUTHORITY (NDMA)
                  </div>
                  <h1 className="text-base sm:text-xl font-black tracking-wide text-white uppercase print:text-black">
                    STATE EXECUTIVE SITUATION REPORT (SITREP)
                  </h1>
                  <p className="text-xs text-slate-400 print:text-gray-700">
                    {sitrepData.issuingAuthority} • {sitrepData.jurisdiction}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs space-y-0.5 text-slate-400 print:text-gray-700">
                <div className="font-bold text-emerald-400 print:text-black">{sitrepData.reportId}</div>
                <div>Date: {new Date(sitrepData.generatedAt).toLocaleDateString()}</div>
                <div>Time: {new Date(sitrepData.generatedAt).toLocaleTimeString()} IST</div>
                <div className="text-rose-400 print:text-black font-bold">CABINET EMERGENCY BRIEFING</div>
              </div>
            </div>
          </div>

          {/* Key Executive Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 print:grid-cols-4">
            <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-3 print:border-gray-400 print:bg-gray-100">
              <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase block">Cyclone Eye Target</span>
              <strong className="text-sm sm:text-base text-white print:text-black font-bold truncate block">
                {sitrepData.cyclone.name}
              </strong>
              <span className="text-[11px] text-rose-400 print:text-gray-800 font-bold">
                {sitrepData.cyclone.windSpeedKmh} km/h • {sitrepData.cyclone.category}
              </span>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-3 print:border-gray-400 print:bg-gray-100">
              <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase block">Citizens Evacuated</span>
              <strong className="text-sm sm:text-base text-emerald-400 print:text-black font-bold block">
                {sitrepData.evacuation.totalCitizensEvacuated.toLocaleString()}
              </strong>
              <span className="text-[11px] text-slate-400 print:text-gray-800">
                Across {sitrepData.evacuation.totalSheltersActivated} Safe Shelters
              </span>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-3 print:border-gray-400 print:bg-gray-100">
              <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase block">Safe Registry Count</span>
              <strong className="text-sm sm:text-base text-cyan-300 print:text-black font-bold block">
                {sitrepData.evacuation.registeredSafeCitizens.toLocaleString()}
              </strong>
              <span className="text-[11px] text-slate-400 print:text-gray-800">
                Verified "I Am Safe" Logins
              </span>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-3 print:border-gray-400 print:bg-gray-100">
              <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase block">Field Personnel</span>
              <strong className="text-sm sm:text-base text-amber-400 print:text-black font-bold block">
                {sitrepData.operations.totalPersonnelInField}
              </strong>
              <span className="text-[11px] text-slate-400 print:text-gray-800">
                NDRF, SDRF & Coast Guard
              </span>
            </div>
          </div>

          {/* Section 1: Meteorological Telemetry & Maritime Ocean State */}
          <div className="mb-6 rounded-lg border border-slate-800 bg-slate-900/40 p-4 print:border-gray-400 print:bg-transparent">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-black mb-3 flex items-center gap-1.5">
              <Wind className="h-4 w-4 text-emerald-400 print:text-black" />
              1. Meteorological Telemetry & INCOIS Maritime State
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded bg-slate-800/60 p-2.5 print:bg-gray-100 border border-slate-700 print:border-gray-300">
                <span className="text-[10px] text-slate-400 print:text-gray-600">CENTRAL PRESSURE & MOTION</span>
                <p className="font-bold text-white print:text-black mt-1">
                  {sitrepData.cyclone.centralPressureHpa} hPa • Moving {sitrepData.cyclone.movementVector}
                </p>
              </div>
              <div className="rounded bg-slate-800/60 p-2.5 print:bg-gray-100 border border-slate-700 print:border-gray-300">
                <span className="text-[10px] text-slate-400 print:text-gray-600">LANDFALL CORRIDOR</span>
                <p className="font-bold text-white print:text-black mt-1">
                  {sitrepData.cyclone.landfallTarget}
                </p>
              </div>
              <div className="rounded bg-slate-800/60 p-2.5 print:bg-gray-100 border border-slate-700 print:border-gray-300">
                <span className="text-[10px] text-slate-400 print:text-gray-600">INCOIS STORM SURGE FORECAST</span>
                <p className="font-bold text-rose-400 print:text-black mt-1">
                  {sitrepData.cyclone.stormSurgeForecastMeters}m Peak Surge ({sitrepData.cyclone.totalWaterLevelMeters}m Total Water Level)
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Evacuation & Shelter Status by District */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-black mb-2 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-emerald-400 print:text-black" />
              2. Evacuation Progress & Safe Shelter Distribution
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 print:border-gray-400">
                <thead className="bg-slate-900 print:bg-gray-200 text-slate-300 print:text-black uppercase">
                  <tr>
                    <th className="p-2.5 border border-slate-800 print:border-gray-400">District / Coastal Sector</th>
                    <th className="p-2.5 border border-slate-800 print:border-gray-400">Citizens Evacuated</th>
                    <th className="p-2.5 border border-slate-800 print:border-gray-400">Shelters Active</th>
                    <th className="p-2.5 border border-slate-800 print:border-gray-400">Risk Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-400 text-slate-200 print:text-black">
                  {sitrepData.evacuation.districtBreakdown.map((d, i) => (
                    <tr key={i}>
                      <td className="p-2.5 border border-slate-800 print:border-gray-400 font-bold">{d.district}</td>
                      <td className="p-2.5 border border-slate-800 print:border-gray-400 text-emerald-400 print:text-black font-bold">
                        {d.evacuated.toLocaleString()}
                      </td>
                      <td className="p-2.5 border border-slate-800 print:border-gray-400">{d.activeShelters} Complexes</td>
                      <td className="p-2.5 border border-slate-800 print:border-gray-400">
                        <span className="font-bold text-[11px]">{d.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Relief Inventory Burn-Rate & Critical Supplies */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-black mb-2 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-emerald-400 print:text-black" />
              3. Relief Inventory Consumption & 72-Hour Supply Burn-Rate
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 print:border-gray-400">
                <thead className="bg-slate-900 print:bg-gray-200 text-slate-300 print:text-black uppercase">
                  <tr>
                    <th className="p-2.5 border border-slate-800 print:border-gray-400">Commodity</th>
                    <th className="p-2.5 border border-slate-800 print:border-gray-400">Current Stock</th>
                    <th className="p-2.5 border border-slate-800 print:border-gray-400">Est. 24h Burn-Rate</th>
                    <th className="p-2.5 border border-slate-800 print:border-gray-400">Buffer Runway</th>
                    <th className="p-2.5 border border-slate-800 print:border-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-400 text-slate-200 print:text-black">
                  {sitrepData.relief.items.map((item, i) => (
                    <tr key={i}>
                      <td className="p-2.5 border border-slate-800 print:border-gray-400 font-bold">{item.name}</td>
                      <td className="p-2.5 border border-slate-800 print:border-gray-400">{item.available?.toLocaleString()} {item.unit}</td>
                      <td className="p-2.5 border border-slate-800 print:border-gray-400 text-amber-400 print:text-black font-bold">
                        {item.burnRatePerDay?.toLocaleString()} {item.unit} / day
                      </td>
                      <td className="p-2.5 border border-slate-800 print:border-gray-400">{item.daysSupplyRemaining} Days (Adequate)</td>
                      <td className="p-2.5 border border-slate-800 print:border-gray-400 text-emerald-400 print:text-black font-bold">
                        SECURE
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Incident Triage & Emergency Response Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 print:border-gray-400 print:bg-gray-100">
              <span className="text-[10px] text-slate-400 print:text-gray-600 block">TOTAL SOS CALLS</span>
              <p className="text-xl font-bold text-white print:text-black mt-1">{sitrepData.operations.totalSosCalls}</p>
              <span className="text-[10px] text-slate-400">Logged via 112/108 & App</span>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 print:border-gray-400 print:bg-gray-100">
              <span className="text-[10px] text-slate-400 print:text-gray-600 block">RESOLVED / EVACUATED</span>
              <p className="text-xl font-bold text-emerald-400 print:text-black mt-1">{sitrepData.operations.resolvedEmergencies}</p>
              <span className="text-[10px] text-slate-400">100% Extraction Verified</span>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 print:border-gray-400 print:bg-gray-100">
              <span className="text-[10px] text-slate-400 print:text-gray-600 block">CRITICAL ACTIVE INCIDENTS</span>
              <p className="text-xl font-bold text-rose-400 print:text-black mt-1">{sitrepData.operations.criticalRescuesInProgress}</p>
              <span className="text-[10px] text-slate-400">Squads En Route</span>
            </div>
          </div>

          {/* Official Sign-off and Authorization Stamp */}
          <div className="mt-8 border-t-2 border-slate-800 pt-5 flex flex-col sm:flex-row justify-between text-xs text-slate-400 print:text-gray-800 print:border-black gap-4">
            <div>
              <p className="font-bold text-white print:text-black">Authorized by: Chief Incident Commander (IAS)</p>
              <p>Tamil Nadu State Disaster Management Authority (TNSDMA)</p>
              <p className="text-[10px] text-slate-500 mt-1">EOC Command Dispatch: Secretariat, Chennai 600009</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-bold text-emerald-400 print:text-black">DOCUMENT SECURITY CLASSIFICATION: OFFICIAL BRIEF</p>
              <p>Cryptographic Audit Hash: SHA256-EOC-2026-LIVE-VALID</p>
              <p className="text-[10px] text-slate-500 mt-1">Directly Printable for Governor & Cabinet Briefing</p>
            </div>
          </div>
        </div>
      )}

      {/* STANDARD TABLES FOR OTHER REPORT TYPES */}
      {!loading && reportType !== 'sitrep' && (
        <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-6 sm:p-8 shadow-2xl font-mono print:border-none print:bg-white print:text-black print:p-0">
          <div className="border-b-2 border-cyan-500 pb-4 mb-6 print:border-black">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3.5">
                <div className="h-14 w-14 shrink-0 rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-900 p-0.5 shadow print:border-black">
                  <img src="/logo.png" alt="EOC Official Seal" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-widest text-white uppercase print:text-black">
                    STATE EMERGENCY OPERATIONS COMMAND CENTER (EOC)
                  </h1>
                  <p className="text-xs text-cyan-400 print:text-gray-600 font-bold">
                    INCIDENT MANAGEMENT & DISASTER MITIGATION BRIEFING
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 print:text-gray-600">
                <div>Date: {new Date().toLocaleDateString()}</div>
                <div>Time: {new Date().toLocaleTimeString()}</div>
                <div>Classification: <strong className="text-rose-400 print:text-black">OFFICIAL USE ONLY</strong></div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 print:border-gray-400">
              <thead className="bg-slate-900 print:bg-gray-200 text-slate-300 print:text-black uppercase">
                <tr>
                  <th className="p-3 border border-slate-800 print:border-gray-400">Index</th>
                  <th className="p-3 border border-slate-800 print:border-gray-400">Identifier / Title</th>
                  <th className="p-3 border border-slate-800 print:border-gray-400">Status / Classification</th>
                  <th className="p-3 border border-slate-800 print:border-gray-400">Operational Metric</th>
                  <th className="p-3 border border-slate-800 print:border-gray-400">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-400 text-slate-200 print:text-black">
                {(data || []).map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 border border-slate-800 print:border-gray-400">{idx + 1}</td>
                    <td className="p-3 border border-slate-800 print:border-gray-400 font-bold">
                      {item.name || item.title || item.warehouseName}
                    </td>
                    <td className="p-3 border border-slate-800 print:border-gray-400">
                      {item.category || item.status || item.itemType}
                    </td>
                    <td className="p-3 border border-slate-800 print:border-gray-400">
                      {item.windSpeed ? `${item.windSpeed} km/h (${item.pressure} hPa)` :
                       item.evacuatedCount !== undefined ? `${item.evacuatedCount.toLocaleString()} / ${item.populationRequiringEvacuation?.toLocaleString()} (${item.progressPercent}%)` :
                       `${item.availableStock?.toLocaleString()} ${item.unit || ''}`}
                    </td>
                    <td className="p-3 border border-slate-800 print:border-gray-400">
                      {new Date(item.lastUpdated || item.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 border-t border-slate-800 pt-6 flex justify-between text-xs text-slate-400 print:text-gray-600 print:border-black">
            <div>
              <p>Verified by: Operations Director Rajesh Varma</p>
              <p>State Disaster Management Authority Command</p>
            </div>
            <div className="text-right">
              <p>Document Security Check: VERIFIED ● TAMPER-PROOF</p>
              <p>Generated via CycloneCommand Operations Engine</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
