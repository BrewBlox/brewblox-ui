import isObject from 'lodash/isObject';

export interface SerializedMetaClass {
  __metaclass: string;
}

export interface MetaClass {
  metaclass: string;
  postfix: string;
  value: string | number | null;
  toJSON(): SerializedMetaClass;
}

export function isMetaClass(obj: any): obj is MetaClass {
  return isObject(obj) && 'metaclass' in obj;
}
