
import React, { useState, useEffect, useRef } from 'react';
import MarketHeader from './components/MarketHeader';
import DecisionMatrix from './components/DecisionMatrix';
import { MarketData, Language } from './types';
import { fetchMarketData } from './services/marketService';
import { TRANSLATIONS } from './constants';
import { Download, RefreshCw, Calendar, ExternalLink, Loader2, Globe } from 'lucide-react';

// Declaration for html2canvas as it is loaded via CDN
declare global {
  interface Window {
    html2canvas: any;
  }
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>('zh'); // Default to Chinese
  const captureRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];

  // Load data when date or language changes
  useEffect(() => {
    loadData(selectedDate, lang);
  }, [selectedDate, lang]);

  const loadData = async (date: string, language: Language) => {
    setLoading(true);
    try {
      const data = await fetchMarketData(date, language);
      setMarketData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'zh' : 'en';
    setLang(newLang);
    // Data reload is handled by useEffect
  };

  const handleExport = async () => {
    if (captureRef.current && window.html2canvas) {
      try {
        const canvas = await window.html2canvas(captureRef.current, {
          scale: 2, // High resolution
          useCORS: true,
          backgroundColor: '#f3f4f6'
        });
        
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `nasdaq-plan-${selectedDate}.png`;
        link.click();
      } catch (err) {
        console.error("Export failed", err);
        alert("Could not export image. Please try again.");
      }
    } else {
      alert("Export library not loaded.");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center gap-6">
      
      {/* Top Controls */}
      <div className="w-full max-w-md flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
           <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <input 
               type="date" 
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
               className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
             />
           </div>
        </div>
        
        <div className="flex gap-2">
           <button 
             onClick={toggleLanguage}
             className="flex items-center gap-1 px-3 py-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-sm font-medium"
             title="Switch Language"
           >
             <Globe size={16} />
             {lang === 'en' ? 'CN' : 'EN'}
           </button>

           <button 
             onClick={() => loadData(selectedDate, lang)}
             className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
             title="Refresh Data"
             disabled={loading}
           >
             <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
           </button>
           
           <button 
             onClick={handleExport}
             className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
             disabled={loading}
           >
             <Download size={16} />
             {t.export}
           </button>
        </div>
      </div>

      {/* Main Content Area to Capture */}
      <div ref={captureRef} className="w-full max-w-md flex flex-col gap-6 bg-[#f3f4f6] p-1">
        
        {loading ? (
           <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-200">
             <Loader2 className="animate-spin text-purple-600 mb-2" size={32} />
             <p className="text-gray-500 text-sm">{lang === 'en' ? 'Fetching TTM market data...' : '正在获取 TTM 市场数据...'}</p>
           </div>
        ) : !marketData ? (
          <div className="text-center p-8 bg-white rounded-2xl">
             <p className="text-gray-500">Failed to load data.</p>
          </div>
        ) : (
          <>
            <MarketHeader data={marketData} lang={lang} />
            
            <DecisionMatrix currentData={marketData} lang={lang} />

            {/* Source & Disclaimer Footer */}
            <div className="flex flex-col gap-2 mt-2">
              {marketData.sources && marketData.sources.length > 0 && (
                 <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                   <p className="text-xs font-semibold text-gray-500 mb-2">{t.sources}:</p>
                   <div className="flex flex-col gap-1">
                     {marketData.sources.slice(0, 3).map((source, idx) => (
                       <a 
                         key={idx} 
                         href={source.uri} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline truncate"
                       >
                         <ExternalLink size={10} />
                         {source.title}
                       </a>
                     ))}
                   </div>
                 </div>
              )}

              <div className="text-center text-gray-400 text-[10px] leading-tight px-4">
                {marketData.isSimulated && <p className="text-red-400 font-bold mb-1">{t.demo}</p>}
                <p>{t.disclaimer}</p>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
