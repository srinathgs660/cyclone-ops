import React from 'react';
import { AlertOctagon, X, Volume2, VolumeX } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../context/LanguageContext';

const AlertBanner = () => {
  const { liveAlerts, dismissAlert } = useSocket();
  const { isSpeaking, speakEmergencyWarning, stopVoiceBroadcast, currentLanguageMeta } = useLanguage();

  if (!liveAlerts || liveAlerts.length === 0) return null;

  const topAlert = liveAlerts[0];

  return (
    <div className="relative mb-4 overflow-hidden rounded-xl border border-rose-500/50 bg-gradient-to-r from-rose-950/80 via-rose-900/60 to-rose-950/80 p-3.5 shadow-xl shadow-rose-950/40 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/30 text-rose-300 border border-rose-500/50">
            <AlertOctagon className="h-5 w-5 animate-bounce text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950 font-mono">
                {topAlert.severity || 'CRITICAL'} ALERT
              </span>
              <span className="text-xs text-rose-300/80 font-mono">Broadcasted Just Now</span>
            </div>
            <p className="mt-0.5 text-sm font-semibold text-rose-100">{topAlert.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              isSpeaking
                ? stopVoiceBroadcast()
                : speakEmergencyWarning({ withSiren: true })
            }
            className="flex items-center gap-1.5 rounded-lg border border-rose-400/50 bg-rose-600 px-3 py-1.5 text-xs font-bold font-mono text-white shadow hover:bg-rose-500 transition"
            style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
            title={`Play Audio Voice Siren in ${currentLanguageMeta.name}`}
          >
            {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            <span>{isSpeaking ? 'Stop Audio' : `🔊 Voice Siren (${currentLanguageMeta.nativeName})`}</span>
          </button>
          <button
            onClick={() => dismissAlert(topAlert.id)}
            className="rounded-lg p-1.5 text-rose-300 transition-colors hover:bg-rose-500/20 hover:text-white"
            title="Acknowledge Alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;
