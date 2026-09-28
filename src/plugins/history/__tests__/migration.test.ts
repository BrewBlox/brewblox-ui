import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  APPLY_CMD,
  DISCARD_CMD,
  MIGRATE_CMD,
  MIGRATION_POLL_ACTIVE_MS,
  MIGRATION_POLL_IDLE_MS,
  migrationGraphHint,
  migrationSummary,
  queryWindowStart,
} from '../migration';
import type { MigrationSummary } from '../migration';
import { useHistoryStore } from '../store';
import { historyApi } from '../store/api';
import { MigrationStatus } from '../types';

// 2026-09-28T12:00:00Z
const NOW = 1790596800 * 1000;
// The update, a day earlier
const LEGACY_END = NOW / 1000 - 24 * 3600;

const status = (patch: Partial<MigrationStatus> = {}): MigrationStatus => ({
  phase: 'walk',
  running: true,
  cancelled: false,
  dense_days: 30,
  earliest: LEGACY_END - 5 * 365 * 24 * 3600,
  sparse_interval: 60,
  legacy_end: LEGACY_END,
  chunks_total: 43800,
  chunks_done: 10950,
  last_error: null,
  started: LEGACY_END + 60,
  finished: null,
  lost_chunks: [],
  missing_series: [],
  ...patch,
});

const texts = (summary: MigrationSummary): string[] =>
  summary.lines.filter((line) => !line.command).map((line) => line.text);

const commands = (summary: MigrationSummary): string[] =>
  summary.lines.filter((line) => line.command).map((line) => line.text);

describe('migrationSummary', () => {
  it('shows nothing without a migration, or when it is done', () => {
    expect(migrationSummary(null)).toBeNull();
    expect(migrationSummary(undefined)).toBeNull();
    expect(
      migrationSummary(status({ phase: 'done', running: false })),
    ).toBeNull();
  });

  it('describes the seed', () => {
    const summary = migrationSummary(
      status({ phase: 'seed', chunks_done: null }),
    )!;
    expect(summary.label).toBe('Migrating history');
    expect(summary.color).toBe('');
    expect(texts(summary)[0]).toContain('last 30 days of raw history');
    expect(texts(summary)[0]).toContain(
      'averages all history from before the update',
    );
    expect(commands(summary)).toEqual([]);
    expect(summary.moving).toBe(true);
  });

  it('shows the progress of the walk', () => {
    const summary = migrationSummary(status())!;
    expect(summary.label).toBe('Migrating history 25%');
    expect(texts(summary)[0]).toContain('10950 of 43800 periods done');
    expect(summary.moving).toBe(true);
  });

  it('rounds the progress down', () => {
    expect(migrationSummary(status({ chunks_done: 43799 }))!.label).toBe(
      'Migrating history 99%',
    );
  });

  it('counts before it shows progress', () => {
    const summary = migrationSummary(status({ chunks_done: null }))!;
    expect(summary.label).toBe('Migrating history');
    expect(texts(summary)[0]).toContain('counting the periods already done');
  });

  it('does not divide by an empty total', () => {
    const summary = migrationSummary(
      status({ chunks_done: 0, chunks_total: 0 }),
    )!;
    expect(summary.label).toBe('Migrating history');
    expect(texts(summary)[0]).toContain('counting the periods already done');
  });

  it('mentions an error it tries again after', () => {
    const summary = migrationSummary(status({ last_error: 'Timeout()' }))!;
    expect(summary.color).toBe('');
    expect(texts(summary).at(-1)).toBe(
      'It tries again after an error: Timeout()',
    );
    expect(commands(summary)).toEqual([]);
  });

  it('tells how to resume a stopped migration', () => {
    const summary = migrationSummary(
      status({ running: false, cancelled: true }),
    )!;
    expect(summary.label).toBe('History migration paused');
    expect(summary.color).toBe('warning');
    expect(commands(summary)).toEqual([MIGRATE_CMD]);
    expect(summary.moving).toBe(false);
  });

  it('tells how to start again after an error that stopped it', () => {
    const summary = migrationSummary(
      status({
        running: false,
        last_error:
          'The legacy database has samples after the last one the migration found: ' +
          'discard it to start again',
      }),
    )!;
    expect(summary.label).toBe('History migration stopped');
    expect(summary.color).toBe('negative');
    expect(texts(summary)[0]).toContain('samples after the last one');
    expect(commands(summary)).toEqual([DISCARD_CMD, MIGRATE_CMD]);
    expect(summary.moving).toBe(false);
  });

  it('tells how to resume after a change of the averaging interval', () => {
    const summary = migrationSummary(
      status({
        running: false,
        last_error:
          'The migration started with sparse_interval 60s, now it is 120s',
      }),
    )!;
    expect(summary.label).toBe('History migration stopped');
    expect(summary.lines.map((line) => !!line.command)).toEqual([
      false,
      false,
      true,
      false,
      true,
      true,
    ]);
    expect(texts(summary)[1]).toContain(
      'set victoria.sparse_interval in brewblox.yml back to 60s',
    );
    expect(texts(summary)[2]).toContain('discard it and start again');
    expect(commands(summary)).toEqual([APPLY_CMD, DISCARD_CMD, MIGRATE_CMD]);
  });

  it('shows a migration the service is resuming', () => {
    const summary = migrationSummary(status({ running: false }))!;
    expect(summary.label).toBe('Migrating history');
    expect(texts(summary)[0]).toContain('resuming');
    expect(summary.moving).toBe(true);
  });
});

describe('queryWindowStart', () => {
  const HOUR = 3600 * 1000;

  it('follows the history service for each combination', () => {
    const iso = (ms: number): string => new Date(ms).toISOString();
    expect(queryWindowStart({}, NOW)).toBe(NOW - 24 * HOUR);
    expect(queryWindowStart({ duration: '1h' }, NOW)).toBe(NOW - HOUR);
    expect(queryWindowStart({ start: iso(NOW - 2 * HOUR) }, NOW)).toBe(
      NOW - 2 * HOUR,
    );
    expect(
      queryWindowStart(
        { start: iso(NOW - 2 * HOUR), end: iso(NOW - HOUR) },
        NOW,
      ),
    ).toBe(NOW - 2 * HOUR);
    expect(
      queryWindowStart({ duration: '1h', end: iso(NOW - HOUR) }, NOW),
    ).toBe(NOW - 2 * HOUR);
    expect(queryWindowStart({ end: iso(NOW - HOUR) }, NOW)).toBe(
      NOW - 25 * HOUR,
    );
  });
});

describe('migrationGraphHint', () => {
  it('explains an empty graph of a period before the update', () => {
    expect(migrationGraphHint(status(), { duration: '3d' }, NOW)).toContain(
      'still being migrated',
    );
    expect(
      migrationGraphHint(
        status({ running: false, cancelled: true }),
        { duration: '3d' },
        NOW,
      ),
    ).toBe('History from before the update is not migrated yet.');
  });

  it('says nothing about a window after the update', () => {
    expect(migrationGraphHint(status(), { duration: '1h' }, NOW)).toBeNull();
  });

  it('says nothing without a migration, or after it', () => {
    expect(migrationGraphHint(null, { duration: '3d' }, NOW)).toBeNull();
    expect(
      migrationGraphHint(
        status({ phase: 'done', running: false }),
        { duration: '3d' },
        NOW,
      ),
    ).toBeNull();
  });
});

describe('historyStore.fetchMigration', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('fetches often while a migration is not done', async () => {
    const fetch = vi
      .spyOn(historyApi, 'fetchMigrationStatus')
      .mockResolvedValue(status());
    const store = useHistoryStore();

    await store.fetchMigration();
    expect(store.migration).toEqual(status());
    expect(fetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(MIGRATION_POLL_ACTIVE_MS);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('fetches seldom without a migration, or after it', async () => {
    const fetch = vi
      .spyOn(historyApi, 'fetchMigrationStatus')
      .mockResolvedValueOnce(null)
      .mockResolvedValue(status({ phase: 'done', running: false }));
    const store = useHistoryStore();

    await store.fetchMigration();
    expect(store.migration).toBeNull();
    await vi.advanceTimersByTimeAsync(MIGRATION_POLL_ACTIVE_MS);
    expect(fetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(
      MIGRATION_POLL_IDLE_MS - MIGRATION_POLL_ACTIVE_MS,
    );
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(store.migration?.phase).toBe('done');

    await vi.advanceTimersByTimeAsync(MIGRATION_POLL_IDLE_MS);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('stops for a history service without migrations', async () => {
    const notFound = Object.assign(new Error('Not Found'), {
      isAxiosError: true,
      response: {
        status: 404,
        headers: { 'content-type': 'application/json' },
      },
    });
    const fetch = vi
      .spyOn(historyApi, 'fetchMigrationStatus')
      .mockResolvedValueOnce(status())
      .mockRejectedValue(notFound);
    const store = useHistoryStore();

    await store.fetchMigration();
    await vi.advanceTimersByTimeAsync(MIGRATION_POLL_ACTIVE_MS);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(store.migration).toBeNull();

    await vi.advanceTimersByTimeAsync(10 * MIGRATION_POLL_IDLE_MS);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('keeps the last status while the proxy has no route to history', async () => {
    // The proxy answers 404 in plain text while the history service is down
    const noRoute = Object.assign(new Error('Not Found'), {
      isAxiosError: true,
      response: {
        status: 404,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      },
    });
    const fetch = vi
      .spyOn(historyApi, 'fetchMigrationStatus')
      .mockResolvedValueOnce(status())
      .mockRejectedValue(noRoute);
    const store = useHistoryStore();

    await store.fetchMigration();
    await vi.advanceTimersByTimeAsync(MIGRATION_POLL_ACTIVE_MS);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(store.migration).toEqual(status());

    await vi.advanceTimersByTimeAsync(MIGRATION_POLL_ACTIVE_MS);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('keeps the last status while the service does not answer', async () => {
    const fetch = vi
      .spyOn(historyApi, 'fetchMigrationStatus')
      .mockResolvedValueOnce(status())
      .mockRejectedValue(new Error('Network Error'));
    const store = useHistoryStore();

    await store.fetchMigration();
    await vi.advanceTimersByTimeAsync(MIGRATION_POLL_ACTIVE_MS);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(store.migration).toEqual(status());

    await vi.advanceTimersByTimeAsync(MIGRATION_POLL_ACTIVE_MS);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('keeps one schedule when fetched again early', async () => {
    const fetch = vi
      .spyOn(historyApi, 'fetchMigrationStatus')
      .mockResolvedValue(status());
    const store = useHistoryStore();

    // For example, the stream reconnects while a fetch is on its way
    await Promise.all([store.fetchMigration(), store.fetchMigration()]);
    expect(fetch).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(MIGRATION_POLL_ACTIVE_MS);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
