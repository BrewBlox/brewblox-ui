import axios from 'axios';
import { defineStore } from 'pinia';
import { exportFile } from 'quasar';
import {
  computed,
  ref,
  shallowReactive,
  ShallowRef,
  shallowRef,
  triggerRef,
} from 'vue';
import { concatById, filterById, findById } from '@/utils/collections';
import { uniqueFilter } from '@/utils/functional';
import { typed } from '@/utils/misc';
import { notify } from '@/utils/notify';
import { bloxQty, isoDateString, JSQuantity } from '@/utils/quantity';
import { MIGRATION_POLL_ACTIVE_MS, MIGRATION_POLL_IDLE_MS } from '../migration';
import type {
  ApiQuery,
  CsvPrecision,
  DisplayNames,
  GraphConfig,
  GraphSource,
  GraphValueAxes,
  HistorySource,
  LabelPrecision,
  LineColors,
  LoggedSession,
  MetricsSource,
  MigrationStatus,
  QueryParams,
  RangeMax,
  RangeMin,
} from '../types';
import { upgradeGraphConfig } from '../utils';
import { historyApi, sessionApi } from './api';
import {
  graphSourceTransformer,
  metricsSourceTransformer,
} from './transformers';

type SourcesContainer = {
  [id: string]: ShallowRef<HistorySource>;
};

type FieldsContainer = {
  [serviceId: string]: string[];
};

function buildQuery(params: QueryParams, fields: string[]): ApiQuery {
  return {
    start: isoDateString(params.start),
    end: isoDateString(params.end),
    duration: params.duration,
    fields,
  };
}

export const useHistoryStore = defineStore('historyStore', () => {
  const sessions = ref<LoggedSession[]>([]);
  const fieldsDuration = ref<JSQuantity>(bloxQty('1d'));
  const fields = ref<FieldsContainer>({});
  const sources = shallowReactive<SourcesContainer>({});
  const streamConnected = ref<boolean>(false);
  const stream = ref<WebSocket | null>(null);
  const migration = ref<MigrationStatus | null>(null);
  let migrationTimer: ReturnType<typeof setTimeout> | undefined;
  let migrationFetches = 0;

  const sessionTags = computed<string[]>(() =>
    sessions.value
      .flatMap((session) => session.tags ?? [])
      .filter(uniqueFilter),
  );

  function _startQuery(src: HistorySource): void {
    if (stream.value?.readyState === WebSocket.OPEN) {
      stream.value.send(
        JSON.stringify({
          id: src.id,
          command: src.command,
          query: buildQuery(src.params, src.fields),
        }),
      );
    }
  }

  function _endQuery(src: HistorySource): void {
    if (stream.value?.readyState === WebSocket.OPEN) {
      stream.value.send(
        JSON.stringify({
          id: src.id,
          command: 'stop',
        }),
      );
    }
  }

  function _transform({ id, data }: { id: string; data: any }): void {
    const source = sources[id];
    if (source != null) {
      if (source.value.command === 'ranges') {
        graphSourceTransformer(source.value as GraphSource, data);
      }
      if (source.value.command === 'metrics') {
        metricsSourceTransformer(source.value as MetricsSource, data);
      }
      triggerRef(source);
    }
  }

  function _connect(): void {
    stream.value = historyApi.openStream();
    stream.value.onopen = () => {
      streamConnected.value = true;
      Object.values(sources).forEach((src) => _startQuery(src.value));
      // The history service may have restarted, or been updated
      fetchMigration();
    };
    stream.value.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      data.error
        ? notify.error(`History error: ${event.data}`)
        : _transform(data);
    };
    stream.value.onclose = () => {
      streamConnected.value = false;
      setTimeout(() => _connect(), 2000);
    };
    stream.value.onerror = () => {
      stream.value?.close();
      stream.value = null;
    };
  }

  /**
   * Fetches the status of the migration of a legacy history database,
   * and schedules the next fetch: often while a migration is not done, else seldom.
   * A history service without migrations answers 404 in JSON:
   * it is asked again when the stream reconnects.
   * The proxy's 404 while history is down is plain text, and keeps the last status.
   */
  async function fetchMigration(): Promise<void> {
    const fetchId = ++migrationFetches;
    clearTimeout(migrationTimer);
    try {
      const status = await historyApi.fetchMigrationStatus();
      if (fetchId !== migrationFetches) {
        return;
      }
      migration.value = status;
    } catch (e) {
      if (fetchId !== migrationFetches) {
        return;
      }
      if (
        axios.isAxiosError(e) &&
        e.response?.status === 404 &&
        `${e.response.headers['content-type']}`.includes('application/json')
      ) {
        migration.value = null;
        return;
      }
      // Keep the last status while the history service does not answer
    }
    const active = migration.value != null && migration.value.phase !== 'done';
    migrationTimer = setTimeout(
      () => fetchMigration(),
      active ? MIGRATION_POLL_ACTIVE_MS : MIGRATION_POLL_IDLE_MS,
    );
  }

  function sessionById(id: Maybe<string>): LoggedSession | null {
    return findById(sessions.value, id);
  }

  function sourceById<T extends HistorySource>(
    id: Maybe<string>,
  ): ShallowRef<T> | null {
    if (id == null) {
      return null;
    }
    return (sources[id] as ShallowRef<T>) ?? null;
  }

  async function createSession(session: LoggedSession): Promise<void> {
    await sessionApi.create(session); // triggers callback
  }

  async function saveSession(session: LoggedSession): Promise<void> {
    await sessionApi.persist(session); // triggers callback
  }

  async function removeSession(session: LoggedSession): Promise<void> {
    await sessionApi.remove(session); // triggers callback
  }

  function removeSource(id: Maybe<string>): void {
    if (id != null && id in sources) {
      _endQuery(sources[id].value);
      delete sources[id];
    }
  }

  function _addSource(source: HistorySource): void {
    removeSource(source.id);
    _startQuery(source);
    sources[source.id] = shallowRef(source);
  }

  async function createGraphSource(
    id: string,
    params: QueryParams,
    renames: DisplayNames,
    axes: GraphValueAxes,
    colors: LineColors,
    precision: LabelPrecision,
    min: RangeMin,
    max: RangeMax,
    fields: string[],
  ): Promise<void> {
    const validFields = fields.filter((field) => !!field);
    if (validFields.length === 0) {
      return;
    }
    _addSource(
      typed<GraphSource>({
        id,
        params,
        renames,
        axes,
        colors,
        precision,
        min,
        max,
        command: 'ranges',
        fields: validFields,
        values: {},
        truncated: false,
      }),
    );
  }

  async function createMetricsSource(
    id: string,
    params: QueryParams,
    renames: DisplayNames,
    fields: string[],
  ): Promise<void> {
    const validFields = fields.filter((field) => !!field);
    if (validFields.length === 0) {
      return;
    }
    _addSource(
      typed<MetricsSource>({
        id,
        params,
        renames,
        command: 'metrics',
        fields: validFields,
        updated: new Date(),
        values: [],
      }),
    );
  }

  async function fetchFields(): Promise<void> {
    const s = fieldsDuration.value.to('s').round(0).toString();
    const storedFields = await historyApi.fetchFields(s);
    fields.value = storedFields.reduce((acc: Mapped<string[]>, f: string) => {
      const [service, ...sections] = f.split('/');
      const arr = acc[service] ?? [];
      return { ...acc, [service]: [...arr, sections.join('/')] };
    }, {});
  }

  async function downloadCsv({
    params,
    fields,
    precision,
    fileName,
  }: {
    params: QueryParams;
    fields: string[];
    precision: CsvPrecision;
    fileName: string;
  }): Promise<void> {
    exportFile(
      fileName,
      await historyApi.downloadCsv({
        ...buildQuery(params, fields),
        precision,
      }),
    );
  }

  async function downloadGraphCsv(
    config: GraphConfig,
    precision: CsvPrecision,
    header: string,
  ): Promise<void> {
    await downloadCsv({
      params: config.params,
      fields: config.fields,
      precision,
      fileName: `${header}.csv`,
    });
  }

  async function start(): Promise<void> {
    sessions.value = await sessionApi.fetch();

    // check if any sessions must be upgraded
    [...sessions.value].forEach((session) => {
      let dirty = false;
      session.notes.forEach((note) => {
        if (note.type === 'Graph') {
          const upgraded = upgradeGraphConfig(note.config);
          if (upgraded) {
            dirty = true;
            note.config = upgraded;
          }
        }
      });
      if (dirty) {
        // Immediately set upgraded session, to prevent rendering with invalid data
        concatById(sessions.value, session);
        saveSession(session);
      }
    });

    sessionApi.subscribe(
      (session: LoggedSession): void => {
        sessions.value = concatById(sessions.value, session);
      },
      (id: string): void => {
        sessions.value = filterById(sessions.value, { id });
      },
    );

    _connect();
  }

  return {
    sessions,
    fieldsDuration,
    fields,
    sources,
    streamConnected,
    stream,
    migration,
    sessionTags,

    sessionById,
    sourceById,
    createSession,
    saveSession,
    removeSession,
    createGraphSource,
    createMetricsSource,
    removeSource,
    fetchFields,
    downloadCsv,
    downloadGraphCsv,
    fetchMigration,
    start,
  };
});
