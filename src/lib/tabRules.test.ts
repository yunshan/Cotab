import { describe, expect, it } from 'vitest';
import {
  filterInactiveTabs,
  searchStaged,
  searchTabs,
  sortActiveTabs
} from './tabRules';
import { stageTabRecords } from './tabRules';
import type { StagedRecord, StoredTab } from './types';

const NOW = Date.parse('2026-05-09T09:00:00+08:00');
const DAY = 24 * 60 * 60 * 1000;

function tab(overrides: Partial<StoredTab>): StoredTab {
  return {
    tabId: 1,
    windowId: 1,
    title: 'Example',
    url: 'https://example.com/article',
    favIconUrl: 'https://example.com/favicon.ico',
    domain: 'example.com',
    lastAccessedAt: NOW - DAY - 1,
    activationCount: 0,
    pinned: false,
    audible: false,
    ...overrides
  };
}

describe('filterInactiveTabs', () => {
  it('selects tabs older than the threshold and excludes protected tabs', () => {
    const result = filterInactiveTabs(
      [
        tab({ tabId: 1, title: 'old' }),
        tab({ tabId: 2, title: 'recent', lastAccessedAt: NOW - DAY + 1 }),
        tab({ tabId: 3, title: 'pinned', pinned: true }),
        tab({ tabId: 4, title: 'audio', audible: true }),
        tab({ tabId: 5, title: 'internal', url: 'chrome://extensions', domain: '' })
      ],
      NOW,
      24
    );

    expect(result.map((item) => item.tabId)).toEqual([1]);
  });
});

describe('sortActiveTabs', () => {
  it('orders all active tabs by activation count before recency', () => {
    const tabs = [
      tab({ tabId: 1, title: 'recent but rare', activationCount: 1, lastAccessedAt: NOW }),
      tab({ tabId: 2, title: 'frequent', activationCount: 7, lastAccessedAt: NOW - DAY }),
      tab({ tabId: 3, title: 'also frequent but newer', activationCount: 7, lastAccessedAt: NOW - 1 })
    ];

    expect(sortActiveTabs(tabs).map((item) => item.tabId)).toEqual([3, 2, 1]);
  });
});

describe('stageTabRecords', () => {
  it('stages tabs by URL and refreshes duplicate staged timestamps', () => {
    const existing: StagedRecord[] = [
      {
        id: 'old-id',
        title: 'Old title',
        url: 'https://example.com/article',
        favIconUrl: '',
        domain: 'example.com',
        stagedAt: NOW - DAY,
        sourceWindowId: 2
      }
    ];

    const result = stageTabRecords(
      existing,
      [tab({ title: 'New title', windowId: 4 })],
      NOW
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'old-id',
      title: 'New title',
      stagedAt: NOW,
      sourceWindowId: 4
    });
  });
});

describe('searchStaged', () => {
  it('filters staged records by title, URL, or domain', () => {
    const records: StagedRecord[] = [
      {
        id: '1',
        title: 'Design systems',
        url: 'https://example.com/design',
        favIconUrl: '',
        domain: 'example.com',
        stagedAt: NOW,
        sourceWindowId: 1
      },
      {
        id: '2',
        title: 'Release notes',
        url: 'https://docs.example.dev/release',
        favIconUrl: '',
        domain: 'docs.example.dev',
        stagedAt: NOW,
        sourceWindowId: 1
      }
    ];

    expect(searchStaged(records, 'design')).toEqual([records[0]]);
    expect(searchStaged(records, 'docs.example')).toEqual([records[1]]);
    expect(searchStaged(records, 'release')).toEqual([records[1]]);
  });
});

describe('searchTabs', () => {
  it('filters open tabs by title, URL, or domain', () => {
    const tabs = [
      tab({
        tabId: 1,
        title: 'Claude design notes',
        url: 'https://anthropic.com/claude',
        domain: 'anthropic.com'
      }),
      tab({
        tabId: 2,
        title: 'Release tracker',
        url: 'https://example.com/releases',
        domain: 'example.com'
      })
    ];

    expect(searchTabs(tabs, 'claude')).toEqual([tabs[0]]);
    expect(searchTabs(tabs, 'example.com')).toEqual([tabs[1]]);
    expect(searchTabs(tabs, 'missing')).toEqual([]);
  });
});
