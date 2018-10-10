import { get, set } from 'lodash';

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
  Object.keys(mapping)
    .reduce(
      (total, key) => ({
        [key]: get(source, mapping[key].path) || mapping[key].default,
        ...total,
      }),
      {},
    );

export const fromShadow = (
  shadow: AnyData,
  mapping: ShadowMapping,
  output: AnyData = {},
): AnyData =>
  Object.keys(mapping)
    .reduce(
      (acc, key) => {
        set(acc, mapping[key].path, shadow[key]);
        return acc;
      },
      output,
    );

export const deepCopy = (obj: any) => JSON.parse(JSON.stringify(obj));
