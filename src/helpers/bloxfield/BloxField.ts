import { BloxField, JSBloxField } from './types';

export const isBloxField =
  (obj: any): obj is BloxField =>
    obj instanceof Object
    && '__bloxtype' in obj;

export const isJSBloxField =
  (obj: any): obj is JSBloxField =>
    isBloxField(obj)
    && 'toJSON' in obj;
