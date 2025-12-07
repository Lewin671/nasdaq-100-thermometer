
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
    <div className="bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 rounded-2xl shadow-xl text-white overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="p-6 md:p-8 relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-1">{t.title}</h2>
          <p className="text-xs text-indigo-300 opacity-70">
            {data.date} • {data.isSimulated ? (lang === 'en' ? 'Historical Estimate' : '历史回测估算') : t.live}
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
            <span className="text-5xl font-bold tracking-tight mb-2">{data.pe}</span>
            <span className={`${getPeBadgeColor(data.peStatus)} text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm`}>
              {t.statusMap[data.peStatus]}
            </span>
          </div>

          {/* VIX Section */}
          <div className="flex flex-col items-center">
            <span className="text-indigo-200 text-sm font-medium mb-2 flex items-center gap-1">
              <Activity size={16} /> {t.vixLabel}
            </span>
            <span className="text-5xl font-bold tracking-tight mb-2">{data.vix}</span>
            <span className={`${getVixBadgeColor(data.vixStatus)} text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm`}>
              {t.statusMap[data.vixStatus]}
            </span>
          </div>
        </div>

        {/* Action Plan */}
        <div className="text-center mt-8">
          <p className="text-indigo-200 text-sm mb-2">{t.planLabel}</p>
          {/* Changed text rendering to solid color for better export compatibility */}
          <h1 className="text-6xl md:text-7xl font-black text-white drop-shadow-md tracking-tight">
            {data.actionTitle}
          </h1>
          <div className="inline-block mt-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
            <p className="text-indigo-100 font-medium">
              {data.actionSubtitle}
            </p>
          </div>
        </div>

        {/* AI Analysis */}
        {data.analysis && (
          <div className="mt-8 p-4 bg-black/20 rounded-lg border border-white/10 text-center">
            <p className="text-indigo-200 text-sm italic">
               "{data.analysis}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketHeader;
