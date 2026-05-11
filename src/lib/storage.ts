import { DEFAULT_SETTINGS, type DashboardState, type StagedRecord, type StoredTab } from './types';

const STORAGE_KEY = 'tabFocusDashboard';

type StoredShape = Partial<DashboardState>;
type LegacyArchiveRecord = Omit<StagedRecord, 'stagedAt'> &
  Partial<Pick<StagedRecord, 'stagedAt'>> & {
    archivedAt?: number;
  };
type LegacyStoredShape = StoredShape & {
  archive?: LegacyArchiveRecord[];
};

export async function getDashboardState(): Promise<DashboardState> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const stored = (result[STORAGE_KEY] ?? {}) as LegacyStoredShape;

  return {
    tabs: (stored.tabs ?? []).map((tab) => ({
      ...tab,
      activationCount: tab.activationCount ?? 0
    })),
    staged: normalizeStagedRecords(stored.staged, stored.archive),
    settings: {
      ...DEFAULT_SETTINGS,
      ...(stored.settings ?? {})
    }
  };
}

export async function saveDashboardState(state: DashboardState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
}

export async function updateTabs(tabs: StoredTab[]): Promise<void> {
  const state = await getDashboardState();
  await saveDashboardState({ ...state, tabs });
}

export async function updateStaged(staged: StagedRecord[]): Promise<void> {
  const state = await getDashboardState();
  await saveDashboardState({ ...state, staged });
}

export async function subscribeToDashboardState(
  callback: (state: DashboardState) => void
): Promise<() => void> {
  callback(await getDashboardState());

  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string
  ) => {
    if (areaName !== 'local' || !changes[STORAGE_KEY]) {
      return;
    }

    const next = changes[STORAGE_KEY].newValue as StoredShape;
    callback({
      tabs: next.tabs ?? [],
      staged: normalizeStagedRecords(next.staged, (next as LegacyStoredShape).archive),
      settings: {
        ...DEFAULT_SETTINGS,
        ...(next.settings ?? {})
      }
    });
  };

  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}

function normalizeStagedRecords(
  staged?: StagedRecord[],
  legacyArchive?: LegacyArchiveRecord[]
): StagedRecord[] {
  if (staged) {
    return staged;
  }

  return (legacyArchive ?? []).map((record) => ({
    ...record,
    stagedAt: record.stagedAt ?? record.archivedAt ?? Date.now()
  }));
}
