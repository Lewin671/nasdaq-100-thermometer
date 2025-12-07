
import { MatrixCell, PeStatus, VixStatus } from './types';

// PE Thresholds
export const PE_THRESHOLDS = {
  OVERVALUED: 35,
  EXPENSIVE: 30,
  FAIR: 25,
};

// VIX Thresholds
export const VIX_THRESHOLDS = {
  CRASH: 28,
  FEAR: 20,
  NORMAL: 15,
};

export const TRANSLATIONS = {
  en: {
    title: 'Nasdaq 100 Thermometer',
    peLabel: 'PE (TTM)',
    vixLabel: 'VIX (Sentiment)',
    planLabel: "Today's Plan",
    simulated: 'Simulated',
    live: 'Live Data',
    export: 'Export',
    sources: 'Sources',
    disclaimer: 'Personal dashboard. Not financial advice. Data accuracy not guaranteed.',
    demo: 'DEMO MODE: DATA IS SIMULATED',
    matrixTitle: 'Decision Matrix',
    matrixHeaders: [
      { label: 'PE \\ VIX', sub: '(Val \\ Sent)', color: 'bg-gray-100 text-gray-600' },
      { label: 'Greed', sub: '< 15', color: 'bg-red-500 text-white' },
      { label: 'Normal', sub: '15-20', color: 'bg-yellow-400 text-white' },
      { label: 'Fear', sub: '20-28', color: 'bg-green-500 text-white' },
      { label: 'Crash', sub: '> 28', color: 'bg-green-800 text-white' },
    ],
    matrixRows: [
      { title: 'Overvalued', val: '> 35', status: PeStatus.Overvalued, color: 'bg-red-900 text-white' },
      { title: 'Expensive', val: '30-35', status: PeStatus.Expensive, color: 'bg-red-500 text-white' },
      { title: 'Fair', val: '25-30', status: PeStatus.Fair, color: 'bg-yellow-400 text-white' },
      { title: 'Undervalued', val: '< 25', status: PeStatus.Undervalued, color: 'bg-green-600 text-white' },
    ],
    statusMap: {
      [PeStatus.Overvalued]: 'Overvalued',
      [PeStatus.Expensive]: 'Expensive',
      [PeStatus.Fair]: 'Fair',
      [PeStatus.Undervalued]: 'Undervalued',
      [VixStatus.Greed]: 'Greed',
      [VixStatus.Normal]: 'Normal',
      [VixStatus.Fear]: 'Fear',
      [VixStatus.Crash]: 'Crash',
    }
  },
  zh: {
    title: '纳指100 市场温度',
    peLabel: 'PE (TTM 估值)',
    vixLabel: 'VIX (情绪)',
    planLabel: '今日计划',
    simulated: '模拟数据',
    live: '实时数据',
    export: '导出图片',
    sources: '数据来源',
    disclaimer: '个人复盘记录 · 不作投资建议',
    demo: '演示模式：数据为模拟生成',
    matrixTitle: '决策矩阵',
    matrixHeaders: [
      { label: 'PE \\ VIX', sub: '(纵 \\ 横)', color: 'bg-gray-100 text-gray-600' },
      { label: '贪婪', sub: '< 15', color: 'bg-red-500 text-white' },
      { label: '正常', sub: '15-20', color: 'bg-yellow-400 text-white' },
      { label: '恐慌', sub: '20-28', color: 'bg-green-500 text-white' },
      { label: '崩盘', sub: '> 28', color: 'bg-green-800 text-white' },
    ],
    matrixRows: [
      { title: '高估', val: '> 35', status: PeStatus.Overvalued, color: 'bg-red-900 text-white' },
      { title: '偏贵', val: '30-35', status: PeStatus.Expensive, color: 'bg-red-500 text-white' },
      { title: '合理', val: '25-30', status: PeStatus.Fair, color: 'bg-yellow-400 text-white' },
      { title: '低估', val: '< 25', status: PeStatus.Undervalued, color: 'bg-green-600 text-white' },
    ],
    statusMap: {
      [PeStatus.Overvalued]: '高估',
      [PeStatus.Expensive]: '偏贵',
      [PeStatus.Fair]: '合理',
      [PeStatus.Undervalued]: '低估',
      [VixStatus.Greed]: '贪婪',
      [VixStatus.Normal]: '正常',
      [VixStatus.Fear]: '恐慌',
      [VixStatus.Crash]: '崩盘',
    }
  }
};

// The Decision Matrix Configuration
export const DECISION_MATRIX: MatrixCell[] = [
  // Row 1: Overvalued PE (>35)
  { peStatus: PeStatus.Overvalued, vixStatus: VixStatus.Greed, action: '0%', actionZh: '0份', description: 'Flat', descriptionZh: '躺平', color: 'bg-red-100', textColor: 'text-red-900' },
  { peStatus: PeStatus.Overvalued, vixStatus: VixStatus.Normal, action: '0%', actionZh: '0份', description: 'Wait', descriptionZh: '观望', color: 'bg-red-50', textColor: 'text-red-800' },
  { peStatus: PeStatus.Overvalued, vixStatus: VixStatus.Fear, action: '5%', actionZh: '0.5份', description: 'Nibble', descriptionZh: '少量', color: 'bg-orange-50', textColor: 'text-orange-800' },
  { peStatus: PeStatus.Overvalued, vixStatus: VixStatus.Crash, action: '10%', actionZh: '1份', description: 'Chance', descriptionZh: '机会', color: 'bg-green-50', textColor: 'text-green-800' },

  // Row 2: Expensive PE (30-35)
  { peStatus: PeStatus.Expensive, vixStatus: VixStatus.Greed, action: '0%', actionZh: '0份', description: 'Sell', descriptionZh: '卖出', color: 'bg-red-200', textColor: 'text-red-900' },
  { peStatus: PeStatus.Expensive, vixStatus: VixStatus.Normal, action: '10%', actionZh: '1份', description: 'DCA', descriptionZh: '定投', color: 'bg-yellow-50', textColor: 'text-yellow-800' },
  { peStatus: PeStatus.Expensive, vixStatus: VixStatus.Fear, action: '20%', actionZh: '2份', description: 'Add', descriptionZh: '加倍', color: 'bg-green-50', textColor: 'text-green-800' },
  { peStatus: PeStatus.Expensive, vixStatus: VixStatus.Crash, action: '30%', actionZh: '3份', description: 'Buy', descriptionZh: '大买', color: 'bg-green-100', textColor: 'text-green-900' },

  // Row 3: Fair PE (25-30)
  { peStatus: PeStatus.Fair, vixStatus: VixStatus.Greed, action: '10%', actionZh: '1份', description: 'Hold', descriptionZh: '持有', color: 'bg-yellow-100', textColor: 'text-yellow-900' },
  { peStatus: PeStatus.Fair, vixStatus: VixStatus.Normal, action: '20%', actionZh: '2份', description: 'DCA', descriptionZh: '定投', color: 'bg-green-50', textColor: 'text-green-800' },
  { peStatus: PeStatus.Fair, vixStatus: VixStatus.Fear, action: '30%', actionZh: '3份', description: 'Add', descriptionZh: '加仓', color: 'bg-green-100', textColor: 'text-green-900' },
  { peStatus: PeStatus.Fair, vixStatus: VixStatus.Crash, action: '50%', actionZh: '5份', description: 'Greed', descriptionZh: '贪婪', color: 'bg-green-200', textColor: 'text-green-900' },

  // Row 4: Undervalued PE (<25)
  { peStatus: PeStatus.Undervalued, vixStatus: VixStatus.Greed, action: '30%', actionZh: '3份', description: 'Accum', descriptionZh: '吸筹', color: 'bg-green-100', textColor: 'text-green-900' },
  { peStatus: PeStatus.Undervalued, vixStatus: VixStatus.Normal, action: '50%', actionZh: '5份', description: 'Heavy', descriptionZh: '重仓', color: 'bg-green-200', textColor: 'text-green-900' },
  { peStatus: PeStatus.Undervalued, vixStatus: VixStatus.Fear, action: '80%', actionZh: '8份', description: 'Bottom', descriptionZh: '抄底', color: 'bg-green-300', textColor: 'text-green-900' },
  { peStatus: PeStatus.Undervalued, vixStatus: VixStatus.Crash, action: '100%', actionZh: '12份', description: 'All In', descriptionZh: '全押', color: 'bg-green-400', textColor: 'text-green-950' },
];