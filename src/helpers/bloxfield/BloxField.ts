import { BloxField, JSBloxField } from './types';


export function isBloxField(obj: any): obj is BloxField {
  return obj instanceof Object && '__bloxtype' in obj;
}

export function isJSBloxField(obj: any): obj is JSBloxField {
  return isBloxField && 'toJSON' in obj;
}
