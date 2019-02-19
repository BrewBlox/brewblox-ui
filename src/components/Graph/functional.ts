import set from 'lodash/set';
import { QueryTarget } from "@/store/history/state";

interface QuasarNode {
  label: string;
  value: any;
  children?: QuasarNode[];
}

const nodeRecurser =
  (parent: string[], key: string, val: string | any): QuasarNode => {
    if (typeof val === 'string') {
      return { label: key, value: [...parent, key].join('/') };
    }
    return {
      label: key,
      value: [...parent, key].join('/'),
      children: Object.entries(val)
        .map(([k, v]) => nodeRecurser([...parent, key], k, v)),
    };
  };

export const nodeBuilder =
  (fields: { [measurement: string]: string[] }): QuasarNode[] => {
    const raw = Object.entries(fields)
      .reduce(
        (acc, [k, fieldKeys]) => {
          fieldKeys.forEach(fkey => {
            const splitKeys = fkey.split('/');
            set(acc, [k, ...splitKeys], splitKeys.pop());
          });
          return acc;
        },
        {},
      );
    return Object.entries(raw)
      .map(([k, v]) => nodeRecurser([], k, v));
  };

export const targetSplitter =
  (targets: QueryTarget[]): string[] =>
    targets
      .reduce(
        (acc: string[], tar: QueryTarget) =>
          ([...acc, ...tar.fields.map(f => `${tar.measurement}/${f}`)]),
        []
      );

export const targetBuilder =
  (vals: string[]): QueryTarget[] =>
    vals
      .reduce(
        (acc: QueryTarget[], v: string) => {
          const [measurement, ...keys] = v.split('/');
          const field = keys.join('/');
          const existing = acc.find(t => t.measurement == measurement);
          if (existing) {
            existing.fields.push(field);
            return acc;
          }
          return [...acc, { measurement, fields: [field] }];
        },
        [],
      );
