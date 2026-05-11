import type { HistoryRecord, StagedRecord, StoredTab } from './types';

const HOUR = 60 * 60 * 1000;
const RECENT_ACTIVATION_WINDOW = 24 * HOUR;
const ACTIVATION_DEDUPE_WINDOW = 1000;

export function isSupportedPageUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

export function getDomain(url: string): string {
  if (!isSupportedPageUrl(url)) {
    return '';
  }

  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function filterInactiveTabs(
  tabs: StoredTab[],
  now: number,
  inactiveThresholdHours: number
): StoredTab[] {
  const cutoff = now - inactiveThresholdHours * HOUR;

  return tabs
    .filter((tab) => {
      return (
        isSupportedPageUrl(tab.url) &&
        !tab.pinned &&
        !tab.audible &&
        tab.lastAccessedAt <= cutoff
      );
    })
    .sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);
}

export function sortActiveTabs(tabs: StoredTab[]): StoredTab[] {
  return [...tabs].sort((a, b) => {
    return (
      b.activationCount - a.activationCount ||
      b.lastAccessedAt - a.lastAccessedAt ||
      a.title.localeCompare(b.title)
    );
  });
}

export function getRecentActivationTimestamps(timestamps: number[], now: number): number[] {
  const cutoff = now - RECENT_ACTIVATION_WINDOW;
  return timestamps.filter((timestamp) => timestamp >= cutoff && timestamp <= now);
}

export function recordRecentActivation(timestamps: number[], now: number): number[] {
  const recent = getRecentActivationTimestamps(timestamps, now);
  const latest = recent.at(-1);
  if (latest && now - latest < ACTIVATION_DEDUPE_WINDOW) {
    return recent;
  }

  return [...recent, now];
}

export function stageTabRecords(
  existing: StagedRecord[],
  tabs: StoredTab[],
  stagedAt: number
): StagedRecord[] {
  const byUrl = new Map(existing.map((record) => [record.url, record]));

  for (const tab of tabs) {
    if (!isSupportedPageUrl(tab.url)) {
      continue;
    }

    const current = byUrl.get(tab.url);
    byUrl.set(tab.url, {
      id: current?.id ?? makeStagedId(tab.url, stagedAt),
      title: tab.title || tab.url,
      url: tab.url,
      favIconUrl: tab.favIconUrl,
      domain: tab.domain || getDomain(tab.url),
      stagedAt,
      sourceWindowId: tab.windowId
    });
  }

  return Array.from(byUrl.values()).sort((a, b) => b.stagedAt - a.stagedAt);
}

export function searchStaged(records: StagedRecord[], query: string): StagedRecord[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return records;
  }

  return records.filter((record) => {
    return [record.title, record.url, record.domain]
      .join(' ')
      .toLowerCase()
      .includes(normalized);
  });
}

export function searchTabs(tabs: StoredTab[], query: string): StoredTab[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return tabs;
  }

  return tabs.filter((tab) => {
    return [tab.title, tab.url, tab.domain]
      .join(' ')
      .toLowerCase()
      .includes(normalized);
  });
}

export function filterHistoryRecords(
  records: HistoryRecord[],
  query: string,
  excludeUrls: string[]
): HistoryRecord[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  const excluded = new Set(excludeUrls.map(normalizeComparableUrl).filter(Boolean));
  const seen = new Set<string>();
  const filtered: HistoryRecord[] = [];

  for (const record of records) {
    const normalizedUrl = normalizeComparableUrl(record.url);
    if (!normalizedUrl || excluded.has(normalizedUrl) || seen.has(normalizedUrl)) {
      continue;
    }

    const matches = [record.title, record.url, record.domain]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery);

    if (matches) {
      seen.add(normalizedUrl);
      filtered.push(record);
    }
  }

  return filtered;
}

export function normalizeComparableUrl(url: string): string {
  if (!isSupportedPageUrl(url)) {
    return '';
  }

  try {
    const parsed = new URL(url);
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return '';
  }
}

function makeStagedId(url: string, stagedAt: number): string {
  let hash = 0;
  for (const char of url) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0;
  }

  return `${stagedAt}-${Math.abs(hash)}`;
}
