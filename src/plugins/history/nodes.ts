import get from 'lodash/get';
import set from 'lodash/set';

import { prettify } from '@/helpers/units';
import { propertyNameWithUnit } from '@/helpers/units/parseObject';
import { historyStore, QueryTarget } from '@/store/history';

export interface QuasarNode {
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
            const splitKeys = fkey
              // compensate for units containing a / - replace with placeholder, split, return
              // start [
              // then anything except / or ]
              // then /
              // then anything except / or ]
              // then ]
              // replace the / between the brackets with placeholder "{{div}}"
              .replace(/(\[[^\/\]]*)(\/)([^\/\]]*\])/, '$1{{div}}$3')
              .split('/')
              .map(sk => sk.replace(/{{div}}/, '/'));
            set(acc, [k, ...splitKeys], splitKeys.pop());
          });
          return acc;
        },
        {},
      );
    return Object.entries(raw)
      .map(([k, v]) => nodeRecurser([], k, v));
  };

export const expandedNodes =
  (nodes: QuasarNode[], filter: string): string[] => {
    const lowerFilter = filter.toLowerCase();
    const compare = (node: QuasarNode): boolean => !!node.label.toLowerCase().match(lowerFilter);

    const checkNode = (node: QuasarNode): string[] => {
      const children = node.children || [];
      const vals: string[] = children
        .reduce((acc: string[], n: QuasarNode) => { acc.push(...checkNode(n)); return acc; }, []);
      if (vals.length > 0 || children.some(compare)) {
        vals.push(node.value);
      }
      return vals;
    };

    return nodes
      .reduce((acc: string[], n: QuasarNode) => { acc.push(...checkNode(n)); return acc; }, []);
  };

export const targetSplitter =
  (targets: QueryTarget[]): string[] =>
    targets
      .reduce(
        (acc: string[], tar: QueryTarget) => {
          acc.push(...tar.fields.map(f => `${tar.measurement}/${f}`));
          return acc;
        },
        []
      );

export const targetBuilder =
  (vals: string[], filterUnknown = true): QueryTarget[] => {
    const knownFields = historyStore.fields;
    return vals
      .reduce(
        (acc: QueryTarget[], v: string) => {
          const [measurement, ...keys] = v.split('/');
          const field = keys.join('/');
          const existing = acc.find(t => t.measurement === measurement);
          if (filterUnknown
            && !get(knownFields, measurement, [] as string[]).includes(field)) {
            return acc;
          }
          if (existing) {
            existing.fields.push(field);
            return acc;
          }
          acc.push({ measurement, fields: [field] });
          return acc;
        },
        [],
      );
  };

export const defaultLabel = (key: string): string => {
  const [name, postfix] = propertyNameWithUnit(key);
  const prettyName = name.split('/').slice(1).join(' ');
  const prettyUnit = prettify(postfix || '');
  return `${prettyName} ${prettyUnit}`;
};
