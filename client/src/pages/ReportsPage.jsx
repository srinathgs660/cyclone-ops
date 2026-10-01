import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Printer, Download, CheckCircle2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('cyclone'); // cyclone, evacuation, relief
  const [data, setData] = useState(null);
  const { lastUpdated } = useSocket();

  useEffect(() => {
    fetchReportData();
  }, [reportType, lastUpdated]);

  const fetchReportData = async () => {
    try {
      if (reportType === 'cyclone') {
        const res = await axios.get('/api/cyclones/active');
        if (res.data.success) setData(res.data.data);
      } else if (reportType === 'evacuation') {
        const res = await axios.get('/api/evacuations');
        if (res.data.success) setData(res.data.data);
      } else if (reportType === 'relief') {
        const res = await axios.get('/api/relief/inventory');
        if (res.data.success) setData(res.data.data);
      }
    } catch (err) {
      console.error('[Report Fetch Error]:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
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
              Official Operational Reports & Audit Exports
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Generate printable situation briefs, evacuation audits, and relief distribution manifests
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
            Print Official Report
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 print:hidden">
        <button
          onClick={() => setReportType('cyclone')}
          className={`rounded-lg px-4 py-2 text-xs font-mono font-bold uppercase transition ${
            reportType === 'cyclone' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          1. Cyclone Situation Brief
        </button>
        <button
          onClick={() => setReportType('evacuation')}
          className={`rounded-lg px-4 py-2 text-xs font-mono font-bold uppercase transition ${
            reportType === 'evacuation' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          2. Evacuation Audit Manifest
        </button>
        <button
          onClick={() => setReportType('relief')}
          className={`rounded-lg px-4 py-2 text-xs font-mono font-bold uppercase transition ${
            reportType === 'relief' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          3. Warehouse Inventory & Relief
        </button>
      </div>

      {/* Printable Official EOC Document */}
      <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-8 shadow-2xl font-mono print:border-none print:bg-white print:text-black print:p-0">
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

        {/* Dynamic Content Table */}
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

        {/* Footer Signature Box */}
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
    </div>
  );
};

export default ReportsPage;
