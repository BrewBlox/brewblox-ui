import { BloxField, JSBloxField } from './types';

export const isBloxField =
  (obj: unknown): obj is BloxField =>
    obj instanceof Object
    && '__bloxtype' in obj;

export const isJSBloxField =
  (obj: unknown): obj is JSBloxField =>
    isBloxField(obj)
    && 'toJSON' in obj;
