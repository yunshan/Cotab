export interface StoredTab {
  tabId: number;
  windowId: number;
  title: string;
  url: string;
  favIconUrl: string;
  domain: string;
  lastAccessedAt: number;
  activationCount: number;
  activationTimestamps: number[];
  pinned: boolean;
  audible: boolean;
}

export interface StagedRecord {
  id: string;
  title: string;
  url: string;
  favIconUrl: string;
  domain: string;
  stagedAt: number;
  sourceWindowId: number;
}

export interface HistoryRecord {
  id: string;
  title: string;
  url: string;
  favIconUrl: string;
  domain: string;
  lastVisitTime: number;
  visitCount: number;
}

export interface DashboardSettings {
  inactiveThresholdHours: number;
}

export interface DashboardState {
  tabs: StoredTab[];
  staged: StagedRecord[];
  settings: DashboardSettings;
}

export const DEFAULT_SETTINGS: DashboardSettings = {
  inactiveThresholdHours: 24
};
