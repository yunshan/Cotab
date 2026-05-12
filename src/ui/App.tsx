import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { sendDashboardMessage } from '../lib/messages';
import {
  searchStaged,
  searchTabs,
  sortActiveTabs
} from '../lib/tabRules';
import { subscribeToDashboardState } from '../lib/storage';
import {
  DEFAULT_SETTINGS,
  type DashboardState,
  type HistoryRecord,
  type StagedRecord,
  type StoredTab
} from '../lib/types';
import { getDefaultLanguage, type Language } from './preferences';
import { DESIGN_THEMES, getSavedDesignTheme, type DesignThemeId } from './themes';
import { truncateTitle } from './text';

type Theme = 'light' | 'dark';

const labels = {
  zh: {
    searchAria: '搜索标签页和暂存项',
    searchPlaceholder: '搜索标签页和暂存项',
    themeLabel: '主题',
    switchToDark: '切换到深色模式',
    switchToLight: '切换到浅色模式',
    switchLanguage: 'Switch to English',
    active: '活跃',
    activeCloseAll: (count: number) => `× 关闭全部 ${count} 个标签页`,
    activeDetail: '按最近 24 小时激活次数排序的打开标签页。',
    activeEmpty: '当前还没有被追踪的网页标签页。',
    activeEmptySearch: '没有匹配搜索的活跃标签页。',
    staged: '暂存',
    stagedCloseAll: (count: number) => `× 关闭全部 ${count} 个标签页`,
    stagedDetail: '临时存放，供后续处理。',
    stagedEmpty: 'Stage 后的标签页会出现在这里。',
    stagedEmptySearch: '没有匹配搜索的暂存项。',
    history: '历史',
    historyDetail: '搜索 Chrome 历史记录中未出现在活跃和暂存里的网页。',
    historyEmpty: '没有新的历史记录匹配当前搜索。',
    historyLoading: '正在搜索历史记录...',
    tabFocused: '已跳转到标签页',
    tabsStaged: (count: number) => `${count} 个标签页已暂存`,
    tabsClosed: (count: number) => `${count} 个标签页已关闭`,
    stagedRestored: '已恢复暂存标签页',
    stagedRemoved: '已移除暂存项',
    historyOpened: '已打开历史记录',
    tabsRefreshed: '标签页已刷新',
    refresh: '刷新',
    storeTip: '稍后处理',
    closeTip: '关闭标签页',
    restoreTip: '恢复标签页',
    removeTip: '移除暂存项',
    activations: '次激活',
    activationTip: '最近 24 小时Tab 激活次数',
    visits: '次访问'
  },
  en: {
    searchAria: 'Search tabs and staged items',
    searchPlaceholder: 'Search tabs and staged',
    themeLabel: 'Theme',
    switchToDark: 'Switch to dark mode',
    switchToLight: 'Switch to light mode',
    switchLanguage: '切换到中文',
    active: 'Active',
    activeCloseAll: (count: number) => `× Close all ${count} tabs`,
    activeDetail: 'Open tabs ranked by activations in the last 24 hours.',
    activeEmpty: 'No active web tabs are being tracked yet.',
    activeEmptySearch: 'No active tab matches that search.',
    staged: 'Staged',
    stagedCloseAll: (count: number) => `× Close all ${count} tabs`,
    stagedDetail: 'Temporarily stored links for later use.',
    stagedEmpty: 'Staged tabs will appear here.',
    stagedEmptySearch: 'No staged item matches that search.',
    history: 'History',
    historyDetail: 'Chrome history results not already shown in Active or Staged.',
    historyEmpty: 'No new history result matches that search.',
    historyLoading: 'Searching history...',
    tabFocused: 'Tab focused',
    tabsStaged: (count: number) => `${count} tab${count === 1 ? '' : 's'} staged`,
    tabsClosed: (count: number) => `${count} tab${count === 1 ? '' : 's'} closed`,
    stagedRestored: 'Staged tab restored',
    stagedRemoved: 'Staged item removed',
    historyOpened: 'History result opened',
    tabsRefreshed: 'Tabs refreshed',
    refresh: 'Refresh',
    storeTip: 'Store for later use',
    closeTip: 'Close tab',
    restoreTip: 'Restore tab',
    removeTip: 'Remove staged item',
    activations: 'activations',
    activationTip: 'Tab activations in the last 24 hours',
    visits: 'visits'
  }
} satisfies Record<Language, Record<string, unknown>>;

const quotes = [
  {
    zh: '日日行，不怕千万里；常常做，不怕千万事。',
    en: 'A little progress each day adds up to something substantial.'
  },
  {
    zh: '知不足而奋进，望远山而前行。',
    en: 'See the distance, then take the next useful step.'
  },
  {
    zh: '种一棵树最好的时间是十年前，其次是现在。',
    en: 'The next best time to begin is now.'
  },
  {
    zh: '不驰于空想，不骛于虚声。',
    en: 'Stay close to the work, and let the work become clear.'
  },
  {
    zh: '路虽远，行则将至；事虽难，做则必成。',
    en: 'What is difficult becomes reachable when it is done steadily.'
  },
  {
    zh: '知行合一。',
    en: 'Wang Yangming: Knowledge and action become true together.'
  },
  {
    zh: '破山中贼易，破心中贼难。',
    en: 'Wang Yangming: The harder battle is the one inside the mind.'
  },
  {
    zh: '吾心自有光明月。',
    en: 'Wang Yangming: There is already clear light within the heart.'
  },
  {
    zh: '圣人之道，吾性自足。',
    en: 'Wang Yangming: What matters most is not far away from the self.'
  },
  {
    zh: '吾生也有涯，而知也无涯。',
    en: 'Zhuangzi: Life is finite; learning is not.'
  },
  {
    zh: '大知闲闲，小知间间。',
    en: 'Zhuangzi: Greater understanding is spacious; lesser understanding is cramped.'
  },
  {
    zh: '相濡以沫，不如相忘于江湖。',
    en: 'Zhuangzi: Sometimes freedom is kinder than clinging.'
  },
  {
    zh: '至人无己，神人无功，圣人无名。',
    en: 'Zhuangzi: The highest work does not need display.'
  },
  {
    zh: '知彼知己，百战不殆。',
    en: 'Sunzi: Know the field and know yourself.'
  },
  {
    zh: '胜兵先胜而后求战。',
    en: 'Sunzi: Good preparation wins before the contest begins.'
  },
  {
    zh: '兵贵胜，不贵久。',
    en: 'Sunzi: Value decisive progress over prolonged motion.'
  },
  {
    zh: '故善战者，致人而不致于人。',
    en: 'Sunzi: Shape the situation instead of being shaped by it.'
  },
  {
    zh: '千里之行，始于足下。',
    en: 'Laozi: A long road begins underfoot.'
  },
  {
    zh: '知人者智，自知者明。',
    en: 'Laozi: To know others is intelligence; to know yourself is clarity.'
  },
  {
    zh: '合抱之木，生于毫末。',
    en: 'Laozi: Great things begin in small forms.'
  },
  {
    zh: '学而不思则罔，思而不学则殆。',
    en: 'Confucius: Learning and reflection need each other.'
  },
  {
    zh: '君子求诸己，小人求诸人。',
    en: 'Confucius: Begin with what you can govern in yourself.'
  },
  {
    zh: '欲速则不达。',
    en: 'Confucius: Rushing can slow the real work.'
  },
  {
    zh: '天行健，君子以自强不息。',
    en: 'I Ching: Keep renewing your strength.'
  },
  {
    zh: '地势坤，君子以厚德载物。',
    en: 'I Ching: Build the capacity to carry what matters.'
  },
  {
    zh: '穷则变，变则通，通则久。',
    en: 'I Ching: When blocked, change; when changed, flow.'
  },
  {
    zh: '不积跬步，无以至千里。',
    en: 'Xunzi: No thousand-mile arrival without small steps.'
  },
  {
    zh: '锲而不舍，金石可镂。',
    en: 'Xunzi: Persistent work cuts through hard things.'
  },
  {
    zh: '富贵不能淫，贫贱不能移，威武不能屈。',
    en: 'Mencius: Stand steady through comfort, hardship, and pressure.'
  },
  {
    zh: '生于忧患，死于安乐。',
    en: 'Mencius: Difficulty can sharpen life; ease can dull it.'
  },
  {
    zh: '博学之，审问之，慎思之，明辨之，笃行之。',
    en: 'Doctrine of the Mean: Learn widely, question carefully, think deeply, act firmly.'
  },
  {
    zh: '纸上得来终觉浅，绝知此事要躬行。',
    en: 'Lu You: What is real must be tested in action.'
  },
  {
    zh: '会当凌绝顶，一览众山小。',
    en: 'Du Fu: Climb high enough and the landscape changes.'
  },
  {
    zh: '长风破浪会有时，直挂云帆济沧海。',
    en: 'Li Bai: There will be a time to ride the wind.'
  },
  {
    zh: '苔花如米小，也学牡丹开。',
    en: 'Yuan Mei: Even the smallest flower can open fully.'
  },
  {
    zh: 'The obstacle is the way.',
    en: 'Marcus Aurelius: Work with the obstacle in front of you.'
  },
  {
    zh: 'Waste no more time arguing what a good person should be.',
    en: 'Marcus Aurelius: Be one.'
  },
  {
    zh: 'We suffer more often in imagination than in reality.',
    en: 'Seneca: Return from imagined trouble to the present task.'
  },
  {
    zh: 'No person is free who is not master of themselves.',
    en: 'Epictetus: Freedom begins with self-command.'
  },
  {
    zh: 'Well begun is half done.',
    en: 'Aristotle: A clean beginning carries force.'
  },
  {
    zh: 'Excellence is a habit of repeated action.',
    en: 'Aristotle: What you practice becomes what you are.'
  },
  {
    zh: 'Fortune favors the prepared mind.',
    en: 'Pasteur: Chance helps the mind that is ready.'
  },
  {
    zh: 'I have not failed. I have found what does not work.',
    en: 'Edison: Each attempt can narrow the path.'
  },
  {
    zh: 'Stay hungry, stay foolish.',
    en: 'Keep enough hunger to keep learning.'
  },
  {
    zh: 'Simplicity is the ultimate sophistication.',
    en: 'Leonardo da Vinci: Make the useful thing clear.'
  },
  {
    zh: 'Do what you can, with what you have, where you are.',
    en: 'Start from the ground you already stand on.'
  },
  {
    zh: 'It always seems impossible until it is done.',
    en: 'Mandela: Completion changes the meaning of difficulty.'
  },
  {
    zh: 'The secret of getting ahead is getting started.',
    en: 'Mark Twain: Begin, then keep arranging the next step.'
  }
];

const emptyState: DashboardState = {
  tabs: [],
  staged: [],
  settings: DEFAULT_SETTINGS
};

export function App() {
  const [state, setState] = useState<DashboardState>(emptyState);
  const [query, setQuery] = useState('');
  const [historyResults, setHistoryResults] = useState<HistoryRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    return globalThis.localStorage?.getItem('cotab-theme') === 'dark' ? 'dark' : 'light';
  });
  const [designTheme, setDesignTheme] = useState<DesignThemeId>(() =>
    getSavedDesignTheme(globalThis.localStorage)
  );
  const [language, setLanguage] = useState<Language>(() =>
    getDefaultLanguage(globalThis.localStorage, globalThis.navigator?.languages, globalThis.navigator?.language)
  );
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const themePickerRef = useRef<HTMLDivElement>(null);
  const text = labels[language];
  const selectedDesignTheme = DESIGN_THEMES.find((item) => item.id === designTheme) ?? DESIGN_THEMES[0];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    globalThis.localStorage?.setItem('cotab-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.designTheme = designTheme;
    globalThis.localStorage?.setItem('cotab-design-theme', designTheme);
  }, [designTheme]);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  }, [language]);

  useEffect(() => {
    if (!isThemeMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!themePickerRef.current?.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsThemeMenuOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isThemeMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    subscribeToDashboardState(setState).then((cleanup) => {
      unsubscribe = cleanup;
    });

    void runMessage({ type: 'refreshTabs' }, setIsBusy, setStatus, text.tabsRefreshed as string);

    return () => unsubscribe?.();
  }, [text.tabsRefreshed]);

  const activeTabsRaw = useMemo(
    () => sortActiveTabs(state.tabs),
    [state.tabs]
  );
  const activeTabs = useMemo(
    () => searchTabs(activeTabsRaw, query),
    [activeTabsRaw, query]
  );
  const stagedResults = useMemo(
    () => searchStaged(state.staged, query),
    [query, state.staged]
  );
  const excludedHistoryUrls = useMemo(
    () => [...activeTabsRaw.map((tab) => tab.url), ...state.staged.map((record) => record.url)],
    [activeTabsRaw, state.staged]
  );

  useEffect(() => {
    const normalized = query.trim();
    if (!normalized) {
      setHistoryResults([]);
      setIsHistoryLoading(false);
      return;
    }

    let isCancelled = false;
    setIsHistoryLoading(true);

    const timeoutId = window.setTimeout(() => {
      sendDashboardMessage({
        type: 'searchHistory',
        query: normalized,
        excludeUrls: excludedHistoryUrls
      })
        .then((response) => {
          if (!isCancelled) {
            setHistoryResults(response.ok ? response.history ?? [] : []);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setHistoryResults([]);
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setIsHistoryLoading(false);
          }
        });
    }, 160);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [excludedHistoryUrls, query]);

  async function stageTabs(tabIds: number[]) {
    if (!tabIds.length) {
      return;
    }

    await runMessage(
      { type: 'stageTabs', tabIds },
      setIsBusy,
      setStatus,
      (text.tabsStaged as (count: number) => string)(tabIds.length)
    );
  }

  async function closeTabs(tabIds: number[]) {
    if (!tabIds.length) {
      return;
    }

    await runMessage(
      { type: 'closeTabs', tabIds },
      setIsBusy,
      setStatus,
      (text.tabsClosed as (count: number) => string)(tabIds.length)
    );
  }

  async function deleteStagedItems(stagedIds: string[]) {
    if (!stagedIds.length) {
      return;
    }

    await runMessage(
      { type: 'deleteStagedItems', stagedIds },
      setIsBusy,
      setStatus,
      text.stagedRemoved as string
    );
  }

  return (
    <main className="page-shell">
      <nav className="app-nav" aria-label="Cotab controls">
        <div className="brand-lockup">
          <img className="brand-mark" src="/icons/icon48.png" alt="" />
          <span>Cotab</span>
        </div>
        <div className="nav-actions">
          <div className="theme-picker" ref={themePickerRef}>
            <button
              type="button"
              className="theme-picker-trigger"
              aria-haspopup="listbox"
              aria-expanded={isThemeMenuOpen}
              aria-label={text.themeLabel as string}
              onClick={() => setIsThemeMenuOpen((value) => !value)}
            >
              <span className="theme-picker-icon" aria-hidden="true">
                <PaletteIcon />
              </span>
              <span className="theme-picker-display">
                {selectedDesignTheme.name}
                <ChevronDownIcon />
              </span>
            </button>
            {isThemeMenuOpen ? (
              <div className="theme-menu" role="listbox" aria-label={text.themeLabel as string}>
                {DESIGN_THEMES.map((item) => (
                  <button
                    type="button"
                    className="theme-menu-item"
                    aria-selected={item.id === designTheme}
                    key={item.id}
                    role="option"
                    onClick={() => {
                      setDesignTheme(item.id);
                      setIsThemeMenuOpen(false);
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <label className="inline-search" aria-label={text.searchAria as string}>
            <SearchIcon />
            <input
              ref={searchInputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={text.searchPlaceholder as string}
            />
            {query ? (
              <button type="button" className="search-clear inline-clear" onClick={() => setQuery('')}>
                Clear
              </button>
            ) : null}
            <kbd>/</kbd>
          </label>
          <button
            className="icon-button language-toggle"
            onClick={() => {
              const nextLanguage = language === 'zh' ? 'en' : 'zh';
              globalThis.localStorage?.setItem('cotab-language', nextLanguage);
              globalThis.localStorage?.setItem('cotab-language-manual', 'true');
              setLanguage(nextLanguage);
            }}
            aria-label={text.switchLanguage as string}
            title={text.switchLanguage as string}
          >
            {language === 'zh' ? '中' : 'EN'}
          </button>
          <button
            className="icon-button theme-toggle"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-pressed={theme === 'dark'}
            aria-label={(theme === 'light' ? text.switchToDark : text.switchToLight) as string}
            title={(theme === 'light' ? text.switchToDark : text.switchToLight) as string}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </nav>

      <header className="topbar">
        <div>
          <div className="quote-block">
            <p className="quote-zh">{language === 'zh' ? quote.zh : quote.en}</p>
            <p className="quote-en">{language === 'zh' ? quote.en : quote.zh}</p>
          </div>
        </div>
      </header>

      <div className="workspace-grid">
        <section className="section active-section">
          <SectionHeader
            title={text.active as string}
            count={activeTabsRaw.length}
            detail={text.activeDetail as string}
            action={
              <button
                className="close-all-button"
                disabled={isBusy || activeTabs.length === 0}
                onClick={() => closeTabs(activeTabs.map((tab) => tab.tabId))}
              >
                {(text.activeCloseAll as (count: number) => string)(activeTabs.length)}
              </button>
            }
          />
          <TabList
            emptyText={(query ? text.activeEmptySearch : text.activeEmpty) as string}
            tabs={activeTabs}
            labels={{
              activations: text.activations as string,
              activationTip: text.activationTip as string,
              storeTip: text.storeTip as string,
              closeTip: text.closeTip as string
            }}
            onTitleClick={(tab) =>
              runMessage(
                { type: 'focusTab', tabId: tab.tabId, windowId: tab.windowId },
                setIsBusy,
                setStatus,
                text.tabFocused as string
              )
            }
            onStage={(tab) => stageTabs([tab.tabId])}
            onClose={(tab) => closeTabs([tab.tabId])}
          />
        </section>

        <section className="section staged-section">
          <SectionHeader
            title={text.staged as string}
            count={state.staged.length}
            detail={text.stagedDetail as string}
            action={
              <button
                className="close-all-button"
                disabled={isBusy || stagedResults.length === 0}
                onClick={() => deleteStagedItems(stagedResults.map((record) => record.id))}
              >
                {(text.stagedCloseAll as (count: number) => string)(stagedResults.length)}
              </button>
            }
          />
          <StagedList
            emptyText={(query ? text.stagedEmptySearch : text.stagedEmpty) as string}
            records={stagedResults}
            labels={{
              restoreTip: text.restoreTip as string,
              removeTip: text.removeTip as string
            }}
            onRestore={(record) =>
              runMessage(
                { type: 'restoreStaged', stagedId: record.id },
                setIsBusy,
                setStatus,
                text.stagedRestored as string
              )
            }
            onDelete={(record) =>
              runMessage(
                { type: 'deleteStaged', stagedId: record.id },
                setIsBusy,
                setStatus,
                text.stagedRemoved as string
              )
            }
          />

          {query.trim() ? (
            <HistoryList
              title={text.history as string}
              detail={text.historyDetail as string}
              count={historyResults.length}
              emptyText={
                (isHistoryLoading ? text.historyLoading : text.historyEmpty) as string
              }
              records={isHistoryLoading ? [] : historyResults}
              labels={{
                visits: text.visits as string
              }}
              onOpen={(record) =>
                runMessage(
                  { type: 'openHistoryUrl', url: record.url },
                  setIsBusy,
                  setStatus,
                  text.historyOpened as string
                )
              }
            />
          ) : null}
        </section>
      </div>

      <footer className="site-footer">
        <a href="https://github.com/yunshan/Cotab.git" target="_blank" rel="noreferrer">
          Cotab
        </a>
        <span>by yunshan</span>
      </footer>
    </main>
  );
}

function PaletteIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M10 3.2a6.8 6.8 0 0 0-2.1 13.3c.7.2 1.2-.4 1.2-1v-.7c0-.7.6-1.3 1.3-1.3h1.2a5.2 5.2 0 0 0 5.2-5.2c0-2.8-3-5.1-6.8-5.1Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M6.8 8h.1M8.8 5.9h.1M11.5 5.8h.1M13.7 7.8h.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="m5.8 7.6 4.2 4.2 4.2-4.2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M8.8 3.5a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6Zm0 1.5a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm4.1 7 3.5 3.5-1.1 1.1-3.5-3.5 1.1-1.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M15.6 12.5A6.2 6.2 0 0 1 7.5 4.4 6.5 6.5 0 1 0 15.6 12.5Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M10 6.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6ZM10 2.2v1.6M10 16.2v1.6M3.8 10H2.2M17.8 10h-1.6M5.6 5.6 4.5 4.5M15.5 15.5l-1.1-1.1M14.4 5.6l1.1-1.1M4.5 15.5l1.1-1.1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function SectionHeader({
  title,
  count,
  detail,
  action
}: {
  title: string;
  count?: number;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        <h2>
          {title}
          {typeof count === 'number' ? <span className="section-count">{count}</span> : null}
        </h2>
        <p>{detail}</p>
      </div>
      {action}
    </div>
  );
}

function TabList({
  tabs,
  emptyText,
  labels,
  onTitleClick,
  onStage,
  onClose
}: {
  tabs: StoredTab[];
  emptyText: string;
  labels: {
    activations: string;
    activationTip: string;
    storeTip: string;
    closeTip: string;
  };
  onTitleClick: (tab: StoredTab) => void;
  onStage: (tab: StoredTab) => void;
  onClose: (tab: StoredTab) => void;
}) {
  if (!tabs.length) {
    return <p className="empty-state">{emptyText}</p>;
  }

  return (
    <div className="tab-list">
      {tabs.map((tab) => (
        <div className="tab-row" key={tab.tabId}>
          <Favicon src={tab.favIconUrl} url={tab.url} domain={tab.domain} />
          <div className="row-copy">
            <button className="title-link" onClick={() => onTitleClick(tab)}>
              {truncateTitle(tab.title)}
            </button>
            <span>
              {tab.domain} ·{' '}
              <span className="activation-count" title={labels.activationTip}>
                {tab.activationCount} {labels.activations}
              </span>
            </span>
          </div>
          <span className="time-label">{formatRelativeTime(tab.lastAccessedAt)}</span>
          <div className="row-actions">
            <button
              className="icon-action"
              aria-label={labels.storeTip}
              data-tip={labels.storeTip}
              onClick={() => onStage(tab)}
            >
              <StageIcon />
            </button>
            <button
              className="icon-action danger"
              aria-label={labels.closeTip}
              data-tip={labels.closeTip}
              onClick={() => onClose(tab)}
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StagedList({
  records,
  emptyText,
  labels,
  onRestore,
  onDelete
}: {
  records: StagedRecord[];
  emptyText: string;
  labels: {
    restoreTip: string;
    removeTip: string;
  };
  onRestore: (record: StagedRecord) => void;
  onDelete: (record: StagedRecord) => void;
}) {
  if (!records.length) {
    return <p className="empty-state">{emptyText}</p>;
  }

  return (
    <div className="tab-list">
      {records.map((record) => (
        <div className="tab-row staged-row" key={record.id}>
          <Favicon src={record.favIconUrl} url={record.url} domain={record.domain} />
          <div className="row-copy">
            <button className="title-link" onClick={() => onRestore(record)}>
              {truncateTitle(record.title)}
            </button>
            <span>{record.domain}</span>
          </div>
          <span className="time-label">{formatRelativeTime(record.stagedAt)}</span>
          <div className="row-actions">
            <button
              className="icon-action"
              aria-label={labels.restoreTip}
              data-tip={labels.restoreTip}
              onClick={() => onRestore(record)}
            >
              <RestoreIcon />
            </button>
            <button
              className="icon-action danger"
              aria-label={labels.removeTip}
              data-tip={labels.removeTip}
              onClick={() => onDelete(record)}
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryList({
  title,
  detail,
  count,
  records,
  emptyText,
  labels,
  onOpen
}: {
  title: string;
  detail: string;
  count: number;
  records: HistoryRecord[];
  emptyText: string;
  labels: {
    visits: string;
  };
  onOpen: (record: HistoryRecord) => void;
}) {
  return (
    <div className="history-block">
      <SectionHeader title={title} count={count} detail={detail} />
      {records.length ? (
        <div className="tab-list">
          {records.map((record) => (
            <div className="tab-row history-row" key={record.id}>
              <Favicon src={record.favIconUrl} url={record.url} domain={record.domain} />
              <div className="row-copy">
                <button className="title-link" onClick={() => onOpen(record)}>
                  {truncateTitle(record.title)}
                </button>
                <span>
                  {record.domain} · {record.visitCount} {labels.visits}
                </span>
              </div>
              <span className="time-label">{formatRelativeTime(record.lastVisitTime)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">{emptyText}</p>
      )}
    </div>
  );
}

function StageIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M4.5 5.5h11v9h-11v-9Zm2-2h7l2 2h-11l2-2Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path d="M10 8v4M8 10h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m6 6 8 8M14 6l-8 8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M7.2 6.2H4.8v-2.4M5.1 6.1a6 6 0 1 1-1 4.9"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function Favicon({ src, url, domain }: { src: string; url: string; domain: string }) {
  const candidates = useMemo(() => {
    return uniqueValues([getOriginFaviconUrl(url), src, getChromeFaviconUrl(url)].filter(Boolean));
  }, [src, url]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const faviconSrc = candidates[candidateIndex] ?? '';

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidates]);

  return faviconSrc ? (
    <img
      className="favicon"
      src={faviconSrc}
      alt=""
      onError={() => setCandidateIndex((index) => index + 1)}
    />
  ) : (
    <span className="favicon fallback">{domain.slice(0, 1).toUpperCase()}</span>
  );
}

function getOriginFaviconUrl(url: string): string {
  if (!url.startsWith('http')) {
    return '';
  }

  try {
    return `${new URL(url).origin}/favicon.ico`;
  } catch {
    return '';
  }
}

function getChromeFaviconUrl(url: string): string {
  if (!globalThis.chrome?.runtime?.getURL || !url.startsWith('http')) {
    return '';
  }

  return chrome.runtime.getURL(`/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`);
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values));
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.max(1, Math.round(diff / 60000));

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 48) {
    return `${hours}h ago`;
  }

  return `${Math.round(hours / 24)}d ago`;
}

async function runMessage(
  message: Parameters<typeof sendDashboardMessage>[0],
  setBusy: (value: boolean) => void,
  setStatus: (value: string) => void,
  successStatus: string
) {
  setBusy(true);
  try {
    const response = await sendDashboardMessage(message);
    if (!response?.ok) {
      throw new Error(response?.error ?? 'Command failed');
    }
    setStatus(successStatus);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'Command failed');
  } finally {
    setBusy(false);
  }
}
