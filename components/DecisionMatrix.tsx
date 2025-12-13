
import React from 'react';
import { DECISION_MATRIX, TRANSLATIONS } from '../constants';
import { MarketData, PeStatus, VixStatus, Language } from '../types';

interface DecisionMatrixProps {
  currentData: MarketData;
  lang: Language;
}

const DecisionMatrix: React.FC<DecisionMatrixProps> = ({ currentData, lang }) => {
  const t = TRANSLATIONS[lang];

  // Use headers from constants based on language
  const headers = t.matrixHeaders;
  const rowLabels = t.matrixRows;

  // Helper to get cell data for a specific row (PE) and col (VIX)
  const getCellData = (pStatus: PeStatus, vIdx: number) => {
    let vStatus = VixStatus.Greed;
    if (vIdx === 1) vStatus = VixStatus.Normal;
    if (vIdx === 2) vStatus = VixStatus.Fear;
    if (vIdx === 3) vStatus = VixStatus.Crash;

    return DECISION_MATRIX.find(c => c.peStatus === pStatus && c.vixStatus === vStatus);
  };

  return (
    <div className="w-full glass-panel rounded-3xl overflow-hidden">
      <div className="p-5 border-b border-white/10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          {t.matrixTitle}
        </h3>
      </div>

      <div className="grid grid-cols-5 text-center text-sm">
        {/* Header Row */}
        {headers.map((h, i) => {
          // Extract color intent from the string (e.g. 'bg-red-500')
          const colorClass = h.color.includes('red') ? 'text-red-400' :
            h.color.includes('yellow') ? 'text-yellow-400' :
              h.color.includes('green') ? 'text-green-400' :
                'text-slate-400';
          return (
            <div key={i} className={`p-2 flex flex-col justify-center items-center h-16 font-bold ${colorClass} bg-white/5 border-b border-r border-white/5 last:border-r-0`}>
              <span>{h.label}</span>
              <span className="text-[10px] opacity-70">{h.sub}</span>
            </div>
          );
        })}

        {/* Matrix Rows */}
        {rowLabels.map((row, rIdx) => (
          <React.Fragment key={rIdx}>
            {/* Row Label */}
            <div className={`p-2 flex flex-col justify-center items-center h-20 font-bold border-b border-r border-white/5 bg-white/5 ${row.color.includes('red') ? 'text-red-400' :
                row.color.includes('yellow') ? 'text-yellow-400' :
                  'text-green-400'
              }`}>
              <span>{row.title}</span>
              <span className="text-[10px] opacity-70">{row.val}</span>
            </div>

            {/* Cells */}
            {[0, 1, 2, 3].map((cIdx) => {
              const cell = getCellData(row.status, cIdx);
              if (!cell) return <div key={cIdx}></div>;

              const isActive = currentData.peStatus === row.status && currentData.vixStatus === cell.vixStatus;

              return (
                <div
                  key={cIdx}
                  className={`
                    relative flex flex-col justify-center items-center h-20 
                    border transition-all duration-300 backdrop-blur-md
                    ${isActive ? 'border-purple-400 bg-purple-500/20 z-10 scale-105 shadow-[0_0_30px_rgba(168,85,247,0.3)] rounded-xl' : 'border-white/5 opacity-60 hover:opacity-100 js-hover-cell'}
                    ${/* We override the default colors to be glass-friendly if needed, or keep them but add opacity */ ''}
                  `}
                  style={{
                    backgroundColor: isActive ? undefined : (cell.color.includes('red') ? 'rgba(239,68,68,0.1)' :
                      cell.color.includes('green') ? 'rgba(34,197,94,0.1)' :
                        cell.color.includes('blue') ? 'rgba(59,130,246,0.1)' :
                          cell.color.includes('yellow') ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.05)')
                  }}
                >
                  <span className={`text-sm font-black tracking-tight ${isActive ? 'text-white' : 'text-slate-300'}`}>{lang === 'zh' ? cell.actionZh : cell.action}</span>
                  <span className={`text-[10px] font-medium leading-none mt-1 ${isActive ? 'text-purple-200' : 'text-slate-400'}`}>{lang === 'zh' ? cell.descriptionZh : cell.description}</span>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_10px_#a855f7] animate-pulse" />
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default DecisionMatrix;
