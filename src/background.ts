import { getDomain, isSupportedPageUrl, stageTabRecords } from './lib/tabRules';
import { getDashboardState, saveDashboardState } from './lib/storage';
import type { DashboardMessage, DashboardMessageResponse } from './lib/messages';
import type { StoredTab } from './lib/types';

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
      .then(() => sendResponse({ ok: true }))
      .catch((error: unknown) => {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      });

    return true;
  }
);

async function handleMessage(message: DashboardMessage): Promise<void> {
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
  }
}

async function refreshOpenTabs(): Promise<void> {
  const state = await getDashboardState();
  const existingById = new Map(state.tabs.map((tab) => [tab.tabId, tab]));
  const openTabs = await chrome.tabs.query({});
  const now = Date.now();

  const tabs = openTabs
    .map((tab) => {
      const existing = existingById.get(tab.id ?? -1);
      return toStoredTab(tab, {
        lastAccessedAt: existing?.lastAccessedAt ?? now,
        activationCount: existing?.activationCount ?? 0
      });
    })
    .filter((tab): tab is StoredTab => Boolean(tab));

  await saveDashboardState({ ...state, tabs });
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
  const state = await getDashboardState();
  const existing = state.tabs.find((item) => item.tabId === tabId);
  const stored = toStoredTab(
    { ...tab, id: tabId },
    {
      lastAccessedAt,
      activationCount: (existing?.activationCount ?? 0) + (incrementActivation ? 1 : 0)
    }
  );
  if (!stored) {
    await removeStoredTab(tabId);
    return;
  }

  const others = state.tabs.filter((item) => item.tabId !== tabId);
  await saveDashboardState({ ...state, tabs: [...others, stored] });
}

async function removeStoredTab(tabId: number): Promise<void> {
  const state = await getDashboardState();
  await saveDashboardState({
    ...state,
    tabs: state.tabs.filter((tab) => tab.tabId !== tabId)
  });
}

async function stageTabs(tabIds: number[]): Promise<void> {
  const state = await getDashboardState();
  const tabsToStage = state.tabs.filter((tab) => tabIds.includes(tab.tabId));
  const staged = stageTabRecords(state.staged, tabsToStage, Date.now());

  await saveDashboardState({
    ...state,
    tabs: state.tabs.filter((tab) => !tabIds.includes(tab.tabId)),
    staged
  });

  await chrome.tabs.remove(tabsToStage.map((tab) => tab.tabId));
}

async function closeTabs(tabIds: number[]): Promise<void> {
  const state = await getDashboardState();
  await saveDashboardState({
    ...state,
    tabs: state.tabs.filter((tab) => !tabIds.includes(tab.tabId))
  });

  await chrome.tabs.remove(tabIds);
}

async function restoreStaged(stagedId: string): Promise<void> {
  const state = await getDashboardState();
  const record = state.staged.find((item) => item.id === stagedId);
  if (!record) {
    throw new Error('Staged record not found');
  }

  await chrome.tabs.create({ url: record.url, active: true });
  await saveDashboardState({
    ...state,
    staged: state.staged.filter((item) => item.id !== stagedId)
  });
}

async function deleteStaged(stagedId: string): Promise<void> {
  await deleteStagedItems([stagedId]);
}

async function deleteStagedItems(stagedIds: string[]): Promise<void> {
  const state = await getDashboardState();
  await saveDashboardState({
    ...state,
    staged: state.staged.filter((item) => !stagedIds.includes(item.id))
  });
}

function toStoredTab(
  tab: chrome.tabs.Tab,
  activity: { lastAccessedAt: number; activationCount: number }
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
    activationCount: activity.activationCount,
    pinned: Boolean(tab.pinned),
    audible: Boolean(tab.audible)
  };
}
