import isString from 'lodash/isString';
import { Notify } from 'quasar';
import { Arg1 } from 'tsargs';

import { loggingStore } from './store';
import { LogLevel } from './types';

export type NotifyArgs = Arg1<Notify['create']>

export interface LogOpts {
  silent: boolean;
}

const notifyColors: Record<LogLevel, string> = {
  DEBUG: 'info',
  INFO: 'info',
  DONE: 'positive',
  WARN: 'warning',
  ERROR: 'negative',
};

const notifyIcons: Record<LogLevel, string> = {
  DEBUG: '',
  INFO: '',
  DONE: 'mdi-check-all',
  WARN: 'warning',
  ERROR: 'error',
};

export function create(level: LogLevel, message: NotifyArgs, options: Partial<LogOpts>): void {
  const opts: LogOpts = {
    silent: false,
    ...options,
  };
  const argDefaults: NotifyArgs = {
    message: '',
    color: notifyColors[level],
    icon: notifyIcons[level],
  };
  const args: NotifyArgs = isString(message)
    ? { ...argDefaults, message }
    : { ...argDefaults, ...message };

  if (!opts.silent) {
    Notify.create(args);
  }
  loggingStore.commitEntry({
    level,
    time: new Date(),
    message: args.message,
  });
}

export const debug = (message: NotifyArgs, options: Partial<LogOpts> = {}): void =>
  create('DEBUG', message, options);
export const info = (message: NotifyArgs, options: Partial<LogOpts> = {}): void =>
  create('INFO', message, options);
export const done = (message: NotifyArgs, options: Partial<LogOpts> = {}): void =>
  create('DONE', message, options);
export const warn = (message: NotifyArgs, options: Partial<LogOpts> = {}): void =>
  create('WARN', message, options);
export const error = (message: NotifyArgs, options: Partial<LogOpts> = {}): void =>
  create('ERROR', message, options);

export default {
  create,
  debug,
  info,
  done,
  warn,
  error,
};
