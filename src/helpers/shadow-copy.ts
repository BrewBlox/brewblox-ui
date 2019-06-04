import get from 'lodash/get';
import set from 'lodash/set';

import { deserialize, serialize } from '@/helpers/units/parseObject';

/**
 * Use ShadowMapping to bind sources of values to inputs used in the component.
 *
 * Object looks like:
 * {
 *    keyInput: {
 *      path: 'propertyName.propertyName.propertyName',
 *      default: 'anything'
 *    }
 * }
 *
 * The purpose is to have a single source of truth, while not updating the source when updating
 * the contents of the inputs.
 *
 * 'path' in keyInput is used as 'path' is used in https://lodash.com/docs/4.17.5#get
 */

interface AnyData {
  [key: string]: any;
}

export interface ShadowMapping {
  [key: string]: {
    path: string;
    default?: any;
  };
}

export const toShadow = (source: AnyData, mapping: ShadowMapping): AnyData =>
  Object.entries(mapping)
    .reduce(
      (total, [key, val]) => ({
        ...total,
        [key]: get(source, val.path, val.default),
      }),
      {},
    );

export const fromShadow = (
  shadow: AnyData,
  mapping: ShadowMapping,
  output: AnyData = {},
): AnyData =>
  Object.entries(mapping)
    .reduce(
      (acc, [key, val]) => {
        set(acc, val.path, shadow[key]);
        return acc;
      },
      { ...output },
    );

export function deepCopy<T>(obj: T): T {
  return deserialize(JSON.parse(JSON.stringify(serialize(obj))));
}
