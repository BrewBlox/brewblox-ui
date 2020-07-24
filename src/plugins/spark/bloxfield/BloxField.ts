import isObject from 'lodash/isObject';

export interface JSONBloxField {
  __bloxtype: string;
}

export interface JSBloxField extends JSONBloxField {
  postfix: string;
  value: string | number | null;
  toJSON(): JSONBloxField;
}

export function isAnyBloxField(obj: any): obj is JSBloxField {
  return isObject(obj) && '__bloxtype' in obj;
}

export function isJSONBloxField(obj: any): obj is JSONBloxField {
  return isObject(obj) && '__bloxtype' in obj && !('toJSON' in obj);
}

export function isJSBloxField(obj: any): obj is JSBloxField {
  return isObject(obj) && '__bloxtype' in obj && 'toJSON' in obj;
}
