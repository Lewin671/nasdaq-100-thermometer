
import React, { useState, useEffect, useRef } from 'react';
import MarketHeader from './components/MarketHeader';
import DecisionMatrix from './components/DecisionMatrix';
import { MarketData, Language } from './types';
import { fetchMarketData, fetchMarketAnalysis } from './services/marketService';
import { TRANSLATIONS } from './constants';
import { Download, RefreshCw, Calendar, ExternalLink, Loader2, Globe } from 'lucide-react';

// Declaration for html-to-image as it is loaded via CDN
declare global {
  interface Window {
    htmlToImage: {
      toPng: (node: HTMLElement, options?: any) => Promise<string>;
    };
  }
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [lang, setLang] = useState<Language>('zh'); // Default to Chinese
  const captureRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];

  // Load data when date or language changes
  useEffect(() => {
    loadData(selectedDate, lang);
  }, [selectedDate, lang]);

  const loadData = async (date: string, language: Language) => {
    setLoading(true);
    setAnalyzing(false);
    try {
      // 1. Fetch numbers first (Fast)
      const data = await fetchMarketData(date, language);
      setMarketData({ ...data, analysis: language === 'en' ? "Analyzing market conditions..." : "正在分析市场数据..." });
      setLoading(false);

      // 2. Fetch AI analysis (Slow)
      setAnalyzing(true);
      const analysisText = await fetchMarketAnalysis(data.pe, data.vix, language);
      setMarketData(prev => prev ? { ...prev, analysis: analysisText } : null);
    } catch (e) {
      console.error(e);
      setLoading(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'zh' : 'en';
    setLang(newLang);
    // Data reload is handled by useEffect
  };

  const handleExport = async () => {
    if (captureRef.current && window.htmlToImage) {
      try {
        const dataUrl = await window.htmlToImage.toPng(captureRef.current, {
          backgroundColor: '#0f172a',
          pixelRatio: 2 // High resolution
        });

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `nasdaq-plan-${selectedDate}.png`;
        link.click();
      } catch (err: any) {
        console.error("Export failed", err);
        alert(`Could not export image. Error: ${err?.message || "Unknown error"}`);
      }
    } else {
      alert("Export library not loaded.");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center gap-6 bg-transparent text-slate-100">

      {/* Top Controls */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 glass-panel p-3 rounded-2xl z-20">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 hover:bg-white/10 transition-all [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-3 py-2 text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-sm font-medium"
            title="Switch Language"
          >
            <Globe size={16} />
            {lang === 'en' ? 'CN' : 'EN'}
          </button>

          <button
            onClick={() => loadData(selectedDate, lang)}
            className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-xl transition-all"
            title="Refresh Data"
            disabled={loading}
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-950 text-sm font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-lg shadow-purple-900/20"
            disabled={loading}
          >
            <Download size={16} />
            {t.export}
          </button>
        </div>
      </div>

      {/* Main Content Area to Capture */}
      <div ref={captureRef} className="w-full max-w-5xl bg-transparent p-1 sm:p-6 rounded-3xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 glass-card rounded-3xl col-span-full">
              <Loader2 className="animate-spin text-purple-400 mb-2" size={32} />
              <p className="text-slate-400 text-sm animate-pulse">{lang === 'en' ? 'Scanning market signals...' : '正在扫描市场信号...'}</p>
            </div>
          ) : !marketData ? (
            <div className="text-center p-8 bg-white rounded-2xl">
              <p className="text-slate-500">Failed to load data.</p>
            </div>
          ) : (
            <>
              {/* Left Column: Dashboard Status */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <MarketHeader data={marketData} lang={lang} />

                {/* Move Sources & Disclaimer into the flow naturally or keep at bottom */}
                <div className="hidden lg:flex flex-col gap-3 opacity-60">
                  {/* Desktop visible footer in left col for balance */}
                  {marketData.sources && marketData.sources.length > 0 && (
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-xs">
                      <p className="font-semibold text-slate-400 mb-2">{t.sources}</p>
                      <div className="flex flex-wrap gap-2">
                        {marketData.sources.slice(0, 3).map((source, idx) => (
                          <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                            {source.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-slate-500 px-2 lg:text-left text-center">
                    {marketData.isSimulated && <p className="text-red-400 font-bold mb-1">{t.demo}</p>}
                    <p>{t.disclaimer}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Matrix Map */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <DecisionMatrix currentData={marketData} lang={lang} />

                {/* Mobile only footer */}
                <div className="lg:hidden flex flex-col gap-3 mt-4">
                  {/* Sources Duplicate for Mobile */}
                  {marketData.sources && marketData.sources.length > 0 && (
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-xs">
                      <p className="font-semibold text-slate-400 mb-1">{t.sources}</p>
                      {marketData.sources.slice(0, 3).map((source, idx) => (
                        <div key={idx} className="truncate text-blue-400">{source.title}</div>
                      ))}
                    </div>
                  )}
                  <div className="text-center text-slate-500 text-[10px] opacity-60">
                    {marketData.isSimulated && <p className="text-red-400 font-bold mb-1">{t.demo}</p>}
                    <p>{t.disclaimer}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
