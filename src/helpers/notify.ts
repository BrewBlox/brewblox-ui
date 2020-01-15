import isString from 'lodash/isString';
import { Notify } from 'quasar';
import { Arg1 } from 'tsargs';

import { loggingStore, LogLevel } from '@/store/logging';

export type QNotifyArgs = Arg1<Notify['create']>

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

const notify = (level: LogLevel, message: QNotifyArgs, opts: Partial<RecordOpts>): void => {
  const args = {
    message: '',
    color: notifyColors[level],
    icon: notifyIcons[level],
    ...(isString(message) ? { message } : message),
  };

  if (opts.logged ?? true) {
    loggingStore.commitEntry({
      level,
      time: new Date(),
      message: args.message,
    });
  }

  if (opts.shown ?? true) {
    Notify.create(args);
  }
};
const debug = (message: QNotifyArgs, options: Partial<RecordOpts> = {}): void =>
  notify('DEBUG', message, options);
const info = (message: QNotifyArgs, options: Partial<RecordOpts> = {}): void =>
  notify('INFO', message, options);
const done = (message: QNotifyArgs, options: Partial<RecordOpts> = {}): void =>
  notify('DONE', message, options);
const warn = (message: QNotifyArgs, options: Partial<RecordOpts> = {}): void =>
  notify('WARN', message, options);
const error = (message: QNotifyArgs, options: Partial<RecordOpts> = {}): void =>
  notify('ERROR', message, options);

export default {
  notify,
  debug,
  info,
  done,
  warn,
  error,
};
