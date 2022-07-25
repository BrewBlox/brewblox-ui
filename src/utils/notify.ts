import { LogLevel, useLoggingStore } from '@/store/logging';
import isString from 'lodash/isString';
import { Notify } from 'quasar';

type NotifyFunc = (message: QNotifyArgs, options?: Partial<RecordOpts>) => void;

export type QNotifyArgs = Parameters<Notify['create']>[0];

export interface RecordOpts {
  shown: boolean;
  logged: boolean;
}

export const notifyColors: Record<LogLevel, string> = {
  DEBUG: 'info',
  INFO: 'info',
  DONE: 'positive',
  WARN: 'warning',
  ERROR: 'negative',
};

export const notifyIcons: Record<LogLevel, string> = {
  DEBUG: '',
  INFO: '',
  DONE: 'mdi-check-all',
  WARN: 'warning',
  ERROR: 'error',
};

function basicNotify(
  level: LogLevel,
  message: QNotifyArgs,
  opts: Partial<RecordOpts> = {},
): void {
  const args = {
    message: '',
    html: true,
    color: notifyColors[level],
    icon: notifyIcons[level],
    ...(isString(message) ? { message } : message),
  };

  if (opts.logged ?? true) {
    useLoggingStore().addEntry({
      level,
      time: new Date(),
      message: args.message,
    });
  }

  if (opts.shown ?? true) {
    Notify.create(args);
  }
}

const debug: NotifyFunc = (msg, opts) => basicNotify('DEBUG', msg, opts);
const info: NotifyFunc = (msg, opts) => basicNotify('INFO', msg, opts);
const done: NotifyFunc = (msg, opts) => basicNotify('DONE', msg, opts);
const warn: NotifyFunc = (msg, opts) => basicNotify('WARN', msg, opts);
const error: NotifyFunc = (msg, opts) => basicNotify('ERROR', msg, opts);

export const notify = {
  debug,
  info,
  done,
  warn,
  error,
};
