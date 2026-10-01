import React, { useState } from 'react';
import { Play, RotateCcw, AlertTriangle, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { useTheme } from '../context/ThemeContext';

const SimulationBar = () => {
  const { scenarios, triggerScenario, isSimulating, lastScenarioResult } = useSimulation();
  const { isLight } = useTheme();
  const [selectedId, setSelectedId] = useState(1);

  const handleRun = async () => {
    await triggerScenario(selectedId);
  };

  return (
    <div
      className="mb-6 rounded-xl border p-4 shadow-xl transition-colors duration-200"
      style={{
        backgroundColor: isLight ? '#FFFFFF' : '#131D31',
        borderColor: isLight ? '#FCD34D' : 'rgba(245, 158, 11, 0.3)',
        boxShadow: isLight
          ? '0 4px 14px -2px rgba(245, 158, 11, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.05)'
          : '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Indicator & Title */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
            style={{
              backgroundColor: isLight ? '#FEF3C7' : 'rgba(245, 158, 11, 0.2)',
              borderColor: isLight ? '#F59E0B' : 'rgba(245, 158, 11, 0.4)',
              color: isLight ? '#B45309' : '#FCD34D'
            }}
          >
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4
                className="text-sm font-extrabold uppercase tracking-wider font-mono"
                style={{ color: isLight ? '#92400E' : '#FCD34D' }}
              >
                Operations Simulation Engine
              </h4>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold border"
                style={{
                  backgroundColor: isLight ? '#FEF3C7' : 'rgba(245, 158, 11, 0.2)',
                  color: isLight ? '#92400E' : '#FCD34D',
                  borderColor: isLight ? '#F59E0B' : 'rgba(245, 158, 11, 0.4)'
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                DEMO MODE ● ON
              </span>
            </div>
            <p
              className="text-xs mt-0.5"
              style={{ color: isLight ? '#475569' : '#94A3B8' }}
            >
              Trigger multi-module disaster scenarios to demonstrate real-time telemetry, risk escalation, and triage.
            </p>
          </div>
        </div>

        {/* Right Scenarios & Run CTA */}
        <div className="flex flex-wrap items-center gap-2">
          {scenarios.map((sc) => {
            const isSelected = selectedId === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedId(sc.id)}
                className="rounded-lg border px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm"
                style={
                  isSelected
                    ? {
                        backgroundColor: isLight ? '#FEF3C7' : 'rgba(245, 158, 11, 0.3)',
                        borderColor: isLight ? '#D97706' : '#F59E0B',
                        color: isLight ? '#78350F' : '#FDE68A',
                        boxShadow: isLight
                          ? '0 2px 6px rgba(217, 119, 6, 0.25), 0 0 0 1px #D97706'
                          : '0 2px 8px rgba(245, 158, 11, 0.35), 0 0 0 1px rgba(245, 158, 11, 0.5)'
                      }
                    : {
                        backgroundColor: isLight ? '#F1F5F9' : 'rgba(30, 41, 59, 0.8)',
                        borderColor: isLight ? '#CBD5E1' : '#334155',
                        color: isLight ? '#334155' : '#94A3B8'
                      }
                }
              >
                {sc.id}. {sc.title}
              </button>
            );
          })}

          <button
            onClick={handleRun}
            disabled={isSimulating}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500 bg-amber-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md shadow-amber-900/30 transition-all hover:bg-amber-400 active:scale-95 disabled:opacity-50"
          >
            <Play className={`h-3.5 w-3.5 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Simulating...' : 'Execute Scenario'}
          </button>
        </div>
      </div>

      {lastScenarioResult && (
        <div
          className="mt-3 flex items-center justify-between rounded-lg border px-3.5 py-2 text-xs transition-colors"
          style={{
            backgroundColor: isLight ? '#ECFDF5' : 'rgba(6, 78, 59, 0.25)',
            borderColor: isLight ? '#A7F3D0' : 'rgba(16, 185, 129, 0.4)',
            color: isLight ? '#065F46' : '#6EE7B7'
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Executed:</strong> {lastScenarioResult.scenario} — Live state updated & real-time Socket.IO alerts emitted across dashboard.
            </span>
          </div>
          <span
            className="text-[10px] font-mono font-bold"
            style={{ color: isLight ? '#047857' : '#34D399' }}
          >
            LIVE SYNCED
          </span>
        </div>
      )}
    </div>
  );
};

export default SimulationBar;
