import { defineStore } from 'pinia';
import { exportFile } from 'quasar';

import { concatById, filterById, findById } from '@/utils/collections';
import { uniqueFilter } from '@/utils/functional';
import { notify } from '@/utils/notify';
import { JSQuantity, bloxQty, isoDateString } from '@/utils/quantity';

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

interface HistoryStoreState {
  sessions: LoggedSession[];
  fieldsDuration: JSQuantity;
  fields: Mapped<string[]>;
  sources: HistorySource[];
  streamConnected: boolean;
  stream: WebSocket | null;
}

export const useHistoryStore = defineStore('historyStore', {
  state: (): HistoryStoreState => ({
    sessions: [],
    fieldsDuration: bloxQty('1d'),
    fields: {},
    sources: [],
    streamConnected: false,
    stream: null,
  }),
  getters: {
    sessionTags: (state): string[] =>
      state.sessions
        .flatMap((session) => session.tags ?? [])
        .filter(uniqueFilter),
  },
  actions: {
    // private
    startQuery(src: HistorySource): void {
      if (this.stream?.readyState === WebSocket.OPEN) {
        this.stream.send(
          JSON.stringify({
            id: src.id,
            command: src.command,
            query: buildQuery(src.params, src.fields),
          }),
        );
      }
    },

    // private
    endQuery(src: HistorySource): void {
      this.stream?.send(
        JSON.stringify({
          id: src.id,
          command: 'stop',
        }),
      );
    },

    // private
    connect(): void {
      this.stream = historyApi.openStream();
      this.stream.onopen = () => {
        this.streamConnected = true;
        this.sources.forEach((src) => this.startQuery(src));
      };
      this.stream.onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        data.error
          ? notify.error(`History error: ${event.data}`)
          : this.transform(data);
      };
      this.stream.onclose = () => {
        this.streamConnected = false;
        setTimeout(() => this.connect(), 2000);
      };
      this.stream.onerror = () => {
        this.stream?.close();
        this.stream = null;
      };
    },

    sessionById(id: string | null): LoggedSession | null {
      return findById(this.sessions, id);
    },

    sourceById<T extends HistorySource>(id: string | null): T | null {
      return findById(this.sources, id) as T | null;
    },

    transform({ id, data }: { id: string; data: any }): void {
      const source = this.sourceById(id);
      if (source !== null) {
        this.sources = concatById(
          this.sources,
          source.transformer(source, data),
        );
      }
    },

    setSource(source: HistorySource): void {
      this.sources = concatById(this.sources, source);
    },

    async createSession(session: LoggedSession): Promise<void> {
      await sessionApi.create(session); // triggers callback
    },

    async saveSession(session: LoggedSession): Promise<void> {
      await sessionApi.persist(session); // triggers callback
    },

    async removeSession(session: LoggedSession): Promise<void> {
      await sessionApi.remove(session); // triggers callback
    },

    async addSource(source: HistorySource): Promise<void> {
      this.setSource(source);
      this.startQuery(source);
    },

    async removeSource(source: Maybe<HistorySource>): Promise<void> {
      if (source) {
        this.endQuery(source);
        this.sources = filterById(this.sources, source);
      }
    },

    async fetchFields(): Promise<void> {
      const s = this.fieldsDuration.to('s').round(0).toString();
      const fields = await historyApi.fetchFields(s);
      this.fields = fields.reduce((acc: Mapped<string[]>, f: string) => {
        const [service, ...sections] = f.split('/');
        const arr = acc[service] ?? [];
        return { ...acc, [service]: [...arr, sections.join('/')] };
      }, {});
    },

    async downloadCsv({
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
    },

    async downloadGraphCsv(
      config: GraphConfig,
      precision: CsvPrecision,
      header: string,
    ): Promise<void> {
      await this.downloadCsv({
        params: config.params,
        fields: config.fields,
        precision,
        fileName: `${header}.csv`,
      });
    },

    async start(): Promise<void> {
      this.sessions = await sessionApi.fetch();

      // check if any sessions must be upgraded
      [...this.sessions].forEach((session) => {
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
          concatById(this.sessions, session);
          this.saveSession(session);
        }
      });

      sessionApi.subscribe(
        (session: LoggedSession): void => {
          this.sessions = concatById(this.sessions, session);
        },
        (id: string): void => {
          this.sessions = filterById(this.sessions, { id });
        },
      );
      this.connect();
    },
  },
});
