
export type Language = 'en' | 'zh';

export enum PeStatus {
  Overvalued = 'Overvalued',
  Expensive = 'Expensive',
  Fair = 'Fair',
  Undervalued = 'Undervalued',
}

export enum VixStatus {
  Greed = 'Greed',
  Normal = 'Normal',
  Fear = 'Fear',
  Crash = 'Crash',
}

export interface Source {
  title: string;
  uri: string;
}

export interface MarketData {
  date: string;
  pe: number;
  vix: number;
  peStatus: PeStatus;
  vixStatus: VixStatus;
  actionTitle: string;
  actionSubtitle: string;
  analysis?: string;
  sources?: Source[];
  isSimulated?: boolean;
}

export interface MatrixCell {
  peStatus: PeStatus;
  vixStatus: VixStatus;
  action: string;
  actionZh: string;
  description: string;
  descriptionZh: string;
  color: string; // Tailwind class for bg
  textColor: string;
}
