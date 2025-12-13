
import React from 'react';
import { MarketData, PeStatus, VixStatus, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Activity, TrendingUp } from 'lucide-react';

interface MarketHeaderProps {
  data: MarketData;
  lang: Language;
}

const MarketHeader: React.FC<MarketHeaderProps> = ({ data, lang }) => {
  const t = TRANSLATIONS[lang];

  const getPeBadgeColor = (status: PeStatus) => {
    switch (status) {
      case PeStatus.Overvalued: return 'bg-red-500';
      case PeStatus.Expensive: return 'bg-red-400';
      case PeStatus.Fair: return 'bg-yellow-400';
      default: return 'bg-green-500';
    }
  };

  const getVixBadgeColor = (status: VixStatus) => {
    switch (status) {
      case VixStatus.Greed: return 'bg-red-500'; // Low VIX = Complacency
      case VixStatus.Normal: return 'bg-blue-400';
      case VixStatus.Fear: return 'bg-green-500'; // High VIX = Opportunity
      case VixStatus.Crash: return 'bg-green-700';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/20 shadow-2xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-overlay filter blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 rounded-full mix-blend-overlay filter blur-[80px] opacity-30 translate-y-1/2 -translate-x-1/2"></div>

      <div className="p-6 md:p-8 relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-indigo-200 text-xs font-bold uppercase tracking-[0.2em] mb-2">{t.title}</h2>
          <p className="text-xs text-indigo-200/60 font-mono">
            {data.date} • {data.isSimulated ? (lang === 'en' ? 'SIMULATION' : '历史回测') : <span className="text-green-400 font-bold animate-pulse">● LIVE</span>}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 relative">
          {/* Vertical Divider */}
          <div className="absolute left-1/2 top-2 bottom-2 w-px bg-white/10 transform -translate-x-1/2"></div>

          {/* PE Section */}
          <div className="flex flex-col items-center">
            <span className="text-indigo-200 text-sm font-medium mb-2 flex items-center gap-1">
              <TrendingUp size={16} /> {t.peLabel}
            </span>
            <span className="text-6xl font-black tracking-tighter mb-2 bg-linear-to-b from-white to-white/70 bg-clip-text text-transparent filter drop-shadow-lg">{data.pe}</span>
            <span className={`${getPeBadgeColor(data.peStatus)} text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg border border-white/20`}>
              {t.statusMap[data.peStatus]}
            </span>
          </div>

          {/* VIX Section */}
          <div className="flex flex-col items-center">
            <span className="text-indigo-200 text-sm font-medium mb-2 flex items-center gap-1">
              <Activity size={16} /> {t.vixLabel}
            </span>
            <span className="text-6xl font-black tracking-tighter mb-2 bg-linear-to-b from-white to-white/70 bg-clip-text text-transparent filter drop-shadow-lg">{data.vix}</span>
            <span className={`${getVixBadgeColor(data.vixStatus)} text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg border border-white/20`}>
              {t.statusMap[data.vixStatus]}
            </span>
          </div>
        </div>

        {/* Action Plan */}
        <div className="text-center mt-8">
          <p className="text-indigo-100/60 text-xs font-bold uppercase tracking-widest mb-4">{t.planLabel}</p>
          {/* Main Action Title with Text Glow */}
          <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-linear-to-b from-white via-white to-purple-200 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] tracking-tighter">
            {data.actionTitle}
          </h1>
          <div className="inline-block mt-4 bg-white/5 backdrop-blur-md rounded-2xl px-8 py-3 border border-white/10 shadow-xl">
            <p className="text-indigo-100 font-medium text-lg">
              {data.actionSubtitle}
            </p>
          </div>
        </div>

        {/* AI Analysis */}
        {data.analysis && (
          <div className="mt-8 p-5 bg-black/30 rounded-2xl border border-white/5 text-center backdrop-blur-sm">
            <p className="text-indigo-100/80 text-sm italic font-medium leading-relaxed">
              "{data.analysis}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketHeader;
