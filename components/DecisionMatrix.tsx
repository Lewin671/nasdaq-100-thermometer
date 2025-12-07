
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
    <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800">{t.matrixTitle}</h3>
      </div>
      
      <div className="grid grid-cols-5 text-center text-sm">
        {/* Header Row */}
        {headers.map((h, i) => (
          <div key={i} className={`${h.color} p-2 flex flex-col justify-center items-center h-16 font-bold`}>
            <span>{h.label}</span>
            <span className="text-xs opacity-90">{h.sub}</span>
          </div>
        ))}

        {/* Matrix Rows */}
        {rowLabels.map((row, rIdx) => (
          <React.Fragment key={rIdx}>
            {/* Row Label */}
            <div className={`${row.color} p-2 flex flex-col justify-center items-center h-20 font-bold`}>
              <span>{row.title}</span>
              <span className="text-xs opacity-80">{row.val}</span>
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
                    border border-gray-50 transition-all duration-300
                    ${cell.color} ${cell.textColor}
                    ${isActive ? 'ring-4 ring-purple-600 ring-inset z-10 scale-105 shadow-lg' : 'opacity-90'}
                  `}
                >
                  <span className="text-lg font-bold">{lang === 'zh' ? cell.actionZh : cell.action}</span>
                  <span className="text-xs font-medium">{lang === 'zh' ? cell.descriptionZh : cell.description}</span>
                  {isActive && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-purple-600 rounded-full animate-ping" />
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
