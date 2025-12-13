import { GoogleGenAI } from "@google/genai";
import { MarketData, PeStatus, VixStatus, Language } from '../types';
import { PE_THRESHOLDS, VIX_THRESHOLDS, DECISION_MATRIX } from '../constants';

// --- Constants ---
// QQQM TTM EPS (calculated from price/PE on Yahoo Finance)
// Price: ~257.53, PE: 35.27 => EPS ≈ 7.30
const FALLBACK_QQQM_EPS = 7.30; // Conservative estimate for QQQM EPS to calculate PE if API fails

// --- Helper Functions ---

const getPeStatus = (pe: number): PeStatus => {
  if (pe > PE_THRESHOLDS.OVERVALUED) return PeStatus.Overvalued;
  if (pe > PE_THRESHOLDS.EXPENSIVE) return PeStatus.Expensive;
  if (pe > PE_THRESHOLDS.FAIR) return PeStatus.Fair;
  return PeStatus.Undervalued;
};

const getVixStatus = (vix: number): VixStatus => {
  if (vix > VIX_THRESHOLDS.CRASH) return VixStatus.Crash;
  if (vix > VIX_THRESHOLDS.FEAR) return VixStatus.Fear;
  if (vix > VIX_THRESHOLDS.NORMAL) return VixStatus.Normal;
  return VixStatus.Greed;
};

const getActionPlan = (peStatus: PeStatus, vixStatus: VixStatus, lang: Language) => {
  const cell = DECISION_MATRIX.find(c => c.peStatus === peStatus && c.vixStatus === vixStatus);
  
  // Default values
  let actionTitle = lang === 'en' ? "WAIT" : "观望";
  let actionSubtitle = lang === 'en' ? "Uncertain market conditions" : "市场走势不明朗";

  // Specific logic mapping
  if (cell) {
    if (peStatus === PeStatus.Overvalued || (peStatus === PeStatus.Expensive && vixStatus === VixStatus.Greed)) {
        actionTitle = lang === 'en' ? "WATCH" : "观望";
        actionSubtitle = lang === 'en' ? "High valuation, preserve capital" : "高估值 + 正常，等待更好机会";
    } else if (peStatus === PeStatus.Undervalued && vixStatus === VixStatus.Crash) {
        actionTitle = lang === 'en' ? "MAX BUY" : "全仓机会";
        actionSubtitle = lang === 'en' ? "Rare opportunity, act decidedly" : "千载难逢，果断出击";
    } else if (cell.action === '0%' || cell.action === '5%') {
        actionTitle = lang === 'en' ? "OBSERVE" : "观察";
        actionSubtitle = lang === 'en' ? "Market is hot, wait for dip" : "市场火热，等待回调";
    } else if (parseInt(cell.action) >= 50) {
        actionTitle = lang === 'en' ? "AGGRESSIVE" : "积极买入";
        actionSubtitle = lang === 'en' ? "Strong value proposition" : "性价比极高";
    } else {
        actionTitle = lang === 'en' ? "DCA" : "定投";
        actionSubtitle = lang === 'en' ? "Regular investment recommended" : "建议按计划分批买入";
    }
  }
  return { actionTitle, actionSubtitle };
};

// --- API Data Fetching ---

// Helper to fetch via multiple proxies with retry logic
const fetchJsonWithRetry = async (url: string) => {
    // List of proxies to try
    const proxyGenerators = [
        (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`, 
        (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
        (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
        (u: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    ];

    // Append timestamp to prevent caching
    const urlWithCacheBuster = url + (url.includes('?') ? '&' : '?') + `_t=${Date.now()}`;

    // Helper to fetch using a single generator
    const fetchFromProxy = async (generator: (u: string) => string) => {
        try {
             // 5 second timeout for each proxy
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 5000);

            const proxyUrl = generator(urlWithCacheBuster);
            const response = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(id);
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            const text = await response.text();
            
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                 throw new Error('Invalid JSON');
            }

            // Handle AllOrigins "get" wrapper which puts actual content in `contents`
            if (data.contents && typeof data.contents === 'string') {
                try {
                    return JSON.parse(data.contents);
                } catch (e) {
                    return data.contents;
                }
            }
            
            // Basic error check for Yahoo style errors
            if (data.status?.error || data.chart?.error || data.quoteResponse?.error) {
                throw new Error('Yahoo API Error');
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    };

    // Use Promise.any to get the first successful response
    try {
        const result = await Promise.any(proxyGenerators.map(g => fetchFromProxy(g)));
        return result;
    } catch (aggregateError) {
        // console.error("All proxies failed", aggregateError);
        return null;
    }
};

// Interface for our normalized internal data structure
interface MarketMetrics {
  pe: number;
  vix: number;
}

// --- Source 1: Yahoo Finance V7 Quote API (Lighter) ---
const fetchYahooV7Data = async (): Promise<MarketMetrics | null> => {
    const url = 'https://query2.finance.yahoo.com/v7/finance/quote?symbols=QQQM,%5EVIX';
    try {
        const data = await fetchJsonWithRetry(url);
        const results = data?.quoteResponse?.result;
        
        if (!results || !Array.isArray(results)) return null;

        const qqqm = results.find((r: any) => r.symbol === 'QQQM');
        const vix = results.find((r: any) => r.symbol === '^VIX');

        if (!qqqm || !vix) return null;

        const vixVal = vix.regularMarketPrice || vix.regularMarketPreviousClose;
        let peVal = qqqm.trailingPE || qqqm.forwardPE;
        
        // If PE is missing but Price is there, calculate it
        if (!peVal && qqqm.regularMarketPrice) {
             peVal = qqqm.regularMarketPrice / FALLBACK_QQQM_EPS;
        }

        if (peVal && vixVal) {
             return { pe: parseFloat(peVal.toFixed(2)), vix: parseFloat(vixVal.toFixed(2)) };
        }
        return null;
    } catch (e) {
        return null;
    }
};

// --- Source 2: Yahoo Finance V10 Summary API (Detailed) ---
const fetchYahooV10Data = async (): Promise<MarketMetrics | null> => {
    try {
        const qqqmUrl = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary/QQQM?modules=summaryDetail,defaultKeyStatistics,price,financialData';
        const vixUrl = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary/%5EVIX?modules=price';

        const [qqqmJson, vixJson] = await Promise.all([
            fetchJsonWithRetry(qqqmUrl),
            fetchJsonWithRetry(vixUrl)
        ]);

        // Parse VIX
        const vixResult = vixJson?.quoteSummary?.result?.[0]?.price;
        const vixVal = vixResult?.regularMarketPrice?.raw;

        // Parse QQQM
        const qqqmResult = qqqmJson?.quoteSummary?.result?.[0];
        if (!qqqmResult || !vixVal) return null;

        let peVal = qqqmResult.summaryDetail?.trailingPE?.raw;
        
        // Calculation Fallback: Price / EPS
        if (!peVal) {
            const price = qqqmResult.price?.regularMarketPrice?.raw || qqqmResult.financialData?.currentPrice?.raw;
            const eps = qqqmResult.defaultKeyStatistics?.trailingEps?.raw;
            if (price) {
                peVal = price / (eps || FALLBACK_QQQM_EPS);
            }
        }

        if (peVal && vixVal) {
            return { pe: parseFloat(peVal.toFixed(2)), vix: parseFloat(vixVal.toFixed(2)) };
        }
        return null;
    } catch (e) {
        return null;
    }
};

// --- Source 3: Yahoo Finance V8 Chart API (Highly Robust for Price) ---
// This is the "Nuclear Option" if quotes fail. We get price from chart metadata and assume a PE.
const fetchYahooChartData = async (): Promise<MarketMetrics | null> => {
    try {
        // Fetch 1 day chart with 1 day interval just to get the meta data
        const qqqmUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/QQQM?interval=1d&range=1d';
        const vixUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=1d';

        const [qqqmJson, vixJson] = await Promise.all([
            fetchJsonWithRetry(qqqmUrl),
            fetchJsonWithRetry(vixUrl)
        ]);

        const qqqmMeta = qqqmJson?.chart?.result?.[0]?.meta;
        const vixMeta = vixJson?.chart?.result?.[0]?.meta;

        if (!qqqmMeta || !vixMeta) return null;

        const qqqmPrice = qqqmMeta.regularMarketPrice || qqqmMeta.chartPreviousClose;
        const vixPrice = vixMeta.regularMarketPrice || vixMeta.chartPreviousClose;

        if (qqqmPrice && vixPrice) {
            // We have price, but no PE. Calculate it.
            const peVal = qqqmPrice / FALLBACK_QQQM_EPS;
            return { pe: parseFloat(peVal.toFixed(2)), vix: parseFloat(vixPrice.toFixed(2)) };
        }
        return null;

    } catch (e) {
        return null;
    }
}

const fetchCurrentMarketData = async (): Promise<{ pe: number; vix: number; } | null> => {
    // Strategy: Try V7 -> V10 -> V8 Chart
    
    // Attempt 1: V7
    const v7Data = await fetchYahooV7Data();
    if (v7Data && v7Data.pe > 0 && v7Data.vix > 0) return v7Data;

    // Attempt 2: V10
    const v10Data = await fetchYahooV10Data();
    if (v10Data && v10Data.pe > 0 && v10Data.vix > 0) return v10Data;

    // Attempt 3: Chart API (Most reliable for just price)
    const chartData = await fetchYahooChartData();
    if (chartData && chartData.pe > 0 && chartData.vix > 0) return chartData;

    return null;
};

// --- Historical Data ---

const fetchHistoricalMarketData = async (dateStr: string): Promise<{ pe: number; vix: number } | null> => {
  try {
    const date = new Date(dateStr);
    const startTimestamp = Math.floor(date.getTime() / 1000);
    // Add 24h + buffer to ensure we cover the day in different timezones
    const endTimestamp = startTimestamp + 86400 + 3600; 

    const qqqmUrl = `https://query1.finance.yahoo.com/v8/finance/chart/QQQM?period1=${startTimestamp}&period2=${endTimestamp}&interval=1d`;
    const vixUrl = `https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?period1=${startTimestamp}&period2=${endTimestamp}&interval=1d`;

    const [qqqmJson, vixJson] = await Promise.all([
      fetchJsonWithRetry(qqqmUrl),
      fetchJsonWithRetry(vixUrl)
    ]);

    // Check if we have quotes in the response
    const qqqmQuotes = qqqmJson?.chart?.result?.[0]?.indicators?.quote?.[0];
    const vixQuotes = vixJson?.chart?.result?.[0]?.indicators?.quote?.[0];

    // Get the first valid close price
    const qqqmClose = qqqmQuotes?.close?.find((c: any) => c !== null);
    const vixClose = vixQuotes?.close?.find((c: any) => c !== null);

    if (!qqqmClose || !vixClose) return null;

    const historicalPe = qqqmClose / FALLBACK_QQQM_EPS;

    return {
      pe: parseFloat(historicalPe.toFixed(2)),
      vix: parseFloat(vixClose.toFixed(2))
    };

  } catch (error) {
    console.error("Failed to fetch historical market data:", error);
    return null;
  }
};

// --- AI Analysis Generation (Text Only) ---
export const fetchMarketAnalysis = async (pe: number, vix: number, lang: Language): Promise<string> => {
    if (!process.env.API_KEY) {
        return lang === 'en' ? "Analysis unavailable (No API Key)" : "无法获取分析 (缺少API Key)";
    }

    const langPrompt = lang === 'zh' ? 'Chinese' : 'English';
    const prompt = `
      Context: Nasdaq 100 TTM PE is ${pe}, VIX is ${vix}.
      Task: Write a very concise 2-sentence market commentary in ${langPrompt}.
      1st sentence: Interpret valuations and sentiment.
      2nd sentence: Provide a direct strategic tip (Buy/Hold/Sell/Wait).
    `;
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const resp = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return resp.text?.trim() || (lang === 'en' ? "Market data updated." : "市场数据已更新");
    } catch (e) {
        console.error("AI Analysis failed", e);
        return lang === 'en' ? "Analysis temporarily unavailable." : "暂时无法获取分析。";
    }
};


// --- Main Fetch Function ---

export const fetchMarketData = async (dateStr: string, lang: Language): Promise<MarketData> => {
  const selectedDate = new Date(dateStr);
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();
  const isFuture = selectedDate > today;

  if (isFuture) {
      throw new Error("Cannot fetch data for future dates");
  }

  let apiData;
  let isEstimated = false;

  try {
    if (isToday) {
        apiData = await fetchCurrentMarketData();
    } else {
        apiData = await fetchHistoricalMarketData(dateStr);
        isEstimated = true; 
    }
  } catch (e) {
    console.error("Fetch error caught:", e);
  }

  // 如果 API 完全失败，抛出错误
  if (!apiData) {
      throw new Error("Failed to fetch market data from all sources");
  }

  const { pe, vix } = apiData;
  const peStatus = getPeStatus(pe);
  const vixStatus = getVixStatus(vix);
  const { actionTitle, actionSubtitle } = getActionPlan(peStatus, vixStatus, lang);

  // Note: Analysis is now fetched separately to speed up initial load
  
  return {
    date: dateStr,
    pe,
    vix,
    peStatus,
    vixStatus,
    actionTitle,
    actionSubtitle,
    // analysis will be filled later or left empty
    sources: [
        { title: 'Yahoo Finance (QQQM Quote)', uri: 'https://finance.yahoo.com/quote/QQQM' },
        { title: 'Yahoo Finance (VIX)', uri: 'https://finance.yahoo.com/quote/%5EVIX' }
    ],
    isSimulated: isEstimated && !isToday // Only show simulated tag if it's historical or explicit fallback
  };
};
