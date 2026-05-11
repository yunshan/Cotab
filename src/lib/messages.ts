import type { HistoryRecord } from './types';

export type DashboardMessage =
  | { type: 'stageTabs'; tabIds: number[] }
  | { type: 'closeTabs'; tabIds: number[] }
  | { type: 'restoreStaged'; stagedId: string }
  | { type: 'deleteStaged'; stagedId: string }
  | { type: 'deleteStagedItems'; stagedIds: string[] }
  | { type: 'focusTab'; tabId: number; windowId: number }
  | { type: 'refreshTabs' }
  | { type: 'searchHistory'; query: string; excludeUrls: string[] }
  | { type: 'openHistoryUrl'; url: string };

export interface DashboardMessageResponse {
  ok: boolean;
  error?: string;
  history?: HistoryRecord[];
}

export function sendDashboardMessage(
  message: DashboardMessage
): Promise<DashboardMessageResponse> {
  return chrome.runtime.sendMessage(message);
}
