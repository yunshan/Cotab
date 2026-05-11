export type DashboardMessage =
  | { type: 'stageTabs'; tabIds: number[] }
  | { type: 'closeTabs'; tabIds: number[] }
  | { type: 'restoreStaged'; stagedId: string }
  | { type: 'deleteStaged'; stagedId: string }
  | { type: 'deleteStagedItems'; stagedIds: string[] }
  | { type: 'focusTab'; tabId: number; windowId: number }
  | { type: 'refreshTabs' };

export interface DashboardMessageResponse {
  ok: boolean;
  error?: string;
}

export function sendDashboardMessage(
  message: DashboardMessage
): Promise<DashboardMessageResponse> {
  return chrome.runtime.sendMessage(message);
}
