import { defineStore } from 'pinia';
import { exportFile } from 'quasar';
import { computed, reactive, ref } from 'vue';
import { concatById, filterById, findById } from '@/utils/collections';
import { uniqueFilter } from '@/utils/functional';
import { notify } from '@/utils/notify';
import { bloxQty, isoDateString, JSQuantity } from '@/utils/quantity';
import type {
  ApiQuery,
  CsvPrecision,
  GraphConfig,
  HistorySource,
  LoggedSession,
  QueryParams,
} from '../types';
import { upgradeGraphConfig } from '../utils';
import { historyApi, sessionApi } from './api';

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
  const fields = ref<Mapped<string[]>>({});
  const sources = reactive<Mapped<HistorySource>>({});
  const streamConnected = ref<boolean>(false);
  const stream = ref<WebSocket | null>(null);

  const sessionTags = computed<string[]>(() =>
    sessions.value
      .flatMap((session) => session.tags ?? [])
      .filter(uniqueFilter),
  );

  // private
  function startQuery(src: HistorySource): void {
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

  // private
  function endQuery(src: HistorySource): void {
    stream.value?.send(
      JSON.stringify({
        id: src.id,
        command: 'stop',
      }),
    );
  }

  // private
  function connect(): void {
    stream.value = historyApi.openStream();
    stream.value.onopen = () => {
      streamConnected.value = true;
      Object.values(sources).forEach((src) => startQuery(src));
    };
    stream.value.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      data.error
        ? notify.error(`History error: ${event.data}`)
        : transform(data);
    };
    stream.value.onclose = () => {
      streamConnected.value = false;
      setTimeout(() => connect(), 2000);
    };
    stream.value.onerror = () => {
      stream.value?.close();
      stream.value = null;
    };
  }

  function sessionById(id: string | null): LoggedSession | null {
    return findById(sessions.value, id);
  }

  function sourceById<T extends HistorySource>(id: string | null): T | null {
    if (id == null) {
      return null;
    }
    return (sources[id] as T) ?? null;
  }

  function transform({ id, data }: { id: string; data: any }): void {
    const source = sources[id];
    if (source != null) {
      sources[id] = source.transformer(source, data);
    }
  }

  function setSource(source: HistorySource): void {
    sources[source.id] = source;
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

  async function addSource(source: HistorySource): Promise<void> {
    setSource(source);
    startQuery(source);
  }

  async function removeSource(source: Maybe<HistorySource>): Promise<void> {
    if (source) {
      endQuery(source);
      delete sources[source.id];
    }
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
    connect();
  }

  return {
    sessions,
    fieldsDuration,
    fields,
    sources,
    streamConnected,
    stream,
    sessionTags,

    sessionById,
    sourceById,
    setSource,
    createSession,
    saveSession,
    removeSession,
    addSource,
    removeSource,
    fetchFields,
    downloadCsv,
    downloadGraphCsv,
    start,
  };
});
