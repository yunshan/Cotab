import {
  filterHistoryRecords,
  getDomain,
  getRecentActivationTimestamps,
  isSupportedPageUrl,
  recordRecentActivation,
  stageTabRecords
} from './lib/tabRules';
import { getDashboardState, saveDashboardState } from './lib/storage';
import type { DashboardMessage, DashboardMessageResponse } from './lib/messages';
import type { HistoryRecord, StoredTab } from './lib/types';

let dashboardStateWriteQueue = Promise.resolve();

chrome.runtime.onInstalled.addListener(() => {
  void refreshOpenTabs();
});

chrome.runtime.onStartup.addListener(() => {
  void refreshOpenTabs();
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  void markTabAccessed(activeInfo.tabId, true);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.title || changeInfo.url) {
    void upsertTab(tabId, tab, Date.now());
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void removeStoredTab(tabId);
});

chrome.runtime.onMessage.addListener(
  (
    message: DashboardMessage,
    _sender,
    sendResponse: (response: DashboardMessageResponse) => void
  ) => {
    handleMessage(message)
      .then((response) => sendResponse(response ?? { ok: true }))
      .catch((error: unknown) => {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      });

    return true;
  }
);

async function handleMessage(message: DashboardMessage): Promise<DashboardMessageResponse | void> {
  switch (message.type) {
    case 'stageTabs':
      await stageTabs(message.tabIds);
      return;
    case 'closeTabs':
      await closeTabs(message.tabIds);
      return;
    case 'restoreStaged':
      await restoreStaged(message.stagedId);
      return;
    case 'deleteStaged':
      await deleteStaged(message.stagedId);
      return;
    case 'deleteStagedItems':
      await deleteStagedItems(message.stagedIds);
      return;
    case 'focusTab':
      await chrome.windows.update(message.windowId, { focused: true });
      await chrome.tabs.update(message.tabId, { active: true });
      await markTabAccessed(message.tabId, true);
      return;
    case 'refreshTabs':
      await refreshOpenTabs();
      return;
    case 'searchHistory':
      return {
        ok: true,
        history: await searchHistory(message.query, message.excludeUrls)
      };
    case 'openHistoryUrl':
      await chrome.tabs.create({ url: message.url, active: true });
      return;
  }
}

async function refreshOpenTabs(): Promise<void> {
  const openTabs = await chrome.tabs.query({});

  await mutateDashboardState(async () => {
    const state = await getDashboardState();
    const existingById = new Map(state.tabs.map((tab) => [tab.tabId, tab]));
    const now = Date.now();

    const tabs = openTabs
      .map((tab) => {
        const existing = existingById.get(tab.id ?? -1);
        const activationTimestamps = getRecentActivationTimestamps(
          getStoredActivationTimestamps(existing),
          now
        );
        return toStoredTab(tab, {
          lastAccessedAt: existing?.lastAccessedAt ?? now,
          activationTimestamps
        });
      })
      .filter((tab): tab is StoredTab => Boolean(tab));

    await saveDashboardState({ ...state, tabs });
  });
}

async function markTabAccessed(tabId: number, incrementActivation: boolean): Promise<void> {
  const tab = await chrome.tabs.get(tabId);
  await upsertTab(tabId, tab, Date.now(), incrementActivation);
}

async function upsertTab(
  tabId: number,
  tab: chrome.tabs.Tab,
  lastAccessedAt: number,
  incrementActivation = false
): Promise<void> {
  await mutateDashboardState(async () => {
    const state = await getDashboardState();
    const existing = state.tabs.find((item) => item.tabId === tabId);
    const activationTimestamps = incrementActivation
      ? recordRecentActivation(getStoredActivationTimestamps(existing), lastAccessedAt)
      : getRecentActivationTimestamps(getStoredActivationTimestamps(existing), lastAccessedAt);
    const stored = toStoredTab(
      { ...tab, id: tabId },
      {
        lastAccessedAt,
        activationTimestamps
      }
    );
    if (!stored) {
      await saveDashboardState({
        ...state,
        tabs: state.tabs.filter((item) => item.tabId !== tabId)
      });
      return;
    }

    const others = state.tabs.filter((item) => item.tabId !== tabId);
    await saveDashboardState({ ...state, tabs: [...others, stored] });
  });
}

async function removeStoredTab(tabId: number): Promise<void> {
  await mutateDashboardState(async () => {
    const state = await getDashboardState();
    await saveDashboardState({
      ...state,
      tabs: state.tabs.filter((tab) => tab.tabId !== tabId)
    });
  });
}

async function stageTabs(tabIds: number[]): Promise<void> {
  const tabsToStage = await mutateDashboardState(async () => {
    const state = await getDashboardState();
    const matchingTabs = state.tabs.filter((tab) => tabIds.includes(tab.tabId));
    const staged = stageTabRecords(state.staged, matchingTabs, Date.now());

    await saveDashboardState({
      ...state,
      tabs: state.tabs.filter((tab) => !tabIds.includes(tab.tabId)),
      staged
    });

    return matchingTabs;
  });

  await chrome.tabs.remove(tabsToStage.map((tab) => tab.tabId));
}

async function closeTabs(tabIds: number[]): Promise<void> {
  await mutateDashboardState(async () => {
    const state = await getDashboardState();
    await saveDashboardState({
      ...state,
      tabs: state.tabs.filter((tab) => !tabIds.includes(tab.tabId))
    });
  });

  await chrome.tabs.remove(tabIds);
}

async function restoreStaged(stagedId: string): Promise<void> {
  const record = await mutateDashboardState(async () => {
    const state = await getDashboardState();
    const stagedRecord = state.staged.find((item) => item.id === stagedId);
    if (!stagedRecord) {
      throw new Error('Staged record not found');
    }

    await saveDashboardState({
      ...state,
      staged: state.staged.filter((item) => item.id !== stagedId)
    });

    return stagedRecord;
  });

  if (!record) {
    throw new Error('Staged record not found');
  }

  await chrome.tabs.create({ url: record.url, active: true });
}

async function deleteStaged(stagedId: string): Promise<void> {
  await deleteStagedItems([stagedId]);
}

async function deleteStagedItems(stagedIds: string[]): Promise<void> {
  await mutateDashboardState(async () => {
    const state = await getDashboardState();
    await saveDashboardState({
      ...state,
      staged: state.staged.filter((item) => !stagedIds.includes(item.id))
    });
  });
}

async function searchHistory(query: string, excludeUrls: string[]): Promise<HistoryRecord[]> {
  const normalized = query.trim();
  if (!normalized || !chrome.history?.search) {
    return [];
  }

  const items = await chrome.history.search({
    text: normalized,
    maxResults: 50,
    startTime: 0
  });

  return filterHistoryRecords(items.map(toHistoryRecord), normalized, excludeUrls);
}

function toHistoryRecord(item: chrome.history.HistoryItem): HistoryRecord {
  const url = item.url ?? '';

  return {
    id: item.id,
    title: item.title || url,
    url,
    favIconUrl: '',
    domain: getDomain(url),
    lastVisitTime: item.lastVisitTime ?? 0,
    visitCount: item.visitCount ?? 0
  };
}

function toStoredTab(
  tab: chrome.tabs.Tab,
  activity: { lastAccessedAt: number; activationTimestamps: number[] }
): StoredTab | null {
  if (!tab.id || !tab.windowId || !tab.url || !isSupportedPageUrl(tab.url)) {
    return null;
  }

  return {
    tabId: tab.id,
    windowId: tab.windowId,
    title: tab.title || tab.url,
    url: tab.url,
    favIconUrl: tab.favIconUrl ?? '',
    domain: getDomain(tab.url),
    lastAccessedAt: activity.lastAccessedAt,
    activationCount: activity.activationTimestamps.length,
    activationTimestamps: activity.activationTimestamps,
    pinned: Boolean(tab.pinned),
    audible: Boolean(tab.audible)
  };
}

function getStoredActivationTimestamps(tab: StoredTab | undefined): number[] {
  return Array.isArray(tab?.activationTimestamps) ? tab.activationTimestamps : [];
}

function mutateDashboardState<T>(mutation: () => Promise<T>): Promise<T> {
  const result = dashboardStateWriteQueue.then(mutation, mutation);
  dashboardStateWriteQueue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}
