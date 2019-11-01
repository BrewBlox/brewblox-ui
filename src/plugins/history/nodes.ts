import get from 'lodash/get';
import set from 'lodash/set';
import { } from 'quasar';

import { sentenceCased } from '@/helpers/functional';
import { prettify } from '@/helpers/units';
import { propertyNameWithUnit } from '@/helpers/units/parseObject';
import { historyStore, QueryTarget } from '@/store/history';

export interface QuasarNode {
  label: string;
  value: any;
  children?: QuasarNode[];

  icon?: string;
  iconColor?: string;
  img?: string;
  avatar?: string;
  disabled?: boolean;
  expandable?: boolean;
  selectable?: boolean;
  handler?: (node: QuasarNode) => void;
  tickable?: boolean;
  noTick?: boolean;
  tickStrategy?: string;
  lazy?: boolean;
  header?: string;
  body?: string;
}

export const defaultLabel = (key: string): string => {
  const [name, postfix] = propertyNameWithUnit(key);
  const path = name.split('/').slice(1);
  const prettyName = sentenceCased(path.pop()!);
  const prettyPath = path.length ? `[${path.join(' ')}] ` : '';
  const prettyUnit = postfix ? prettify(postfix!) : '';
  return `${prettyPath}${prettyName} ${prettyUnit}`;
};

const nodeRecurser =
  (parent: string[], key: string, val: string | any, partial: Partial<QuasarNode>): QuasarNode => {
    // Leaf nodes
    if (typeof val === 'string') {
      const [name, postfix] = propertyNameWithUnit(key);
      const label = postfix !== null
        ? `${sentenceCased(name)} ${prettify(postfix)}`
        : sentenceCased(name);
      return {
        ...partial,
        label,
        value: [...parent, key].join('/'),
      };
    }

    // branch nodes
    return {
      label: key,
      value: [...parent, key].join('/'),
      children: Object.entries(val)
        .map(([k, v]) => nodeRecurser([...parent, key], k, v, partial)),
    };
  };

export const nodeBuilder =
  (fields: { [measurement: string]: string[] }, partial: Partial<QuasarNode> = {}): QuasarNode[] => {
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
      .map(([k, v]) => nodeRecurser([], k, v, partial));
  };

export const expandedNodes =
  (nodes: QuasarNode[], filter: string): string[] => {
    const lowerFilter = filter.toLowerCase();
    const compare = (node: QuasarNode): boolean => !!node.label.toLowerCase().match(lowerFilter);

    const checkNode = (node: QuasarNode): string[] => {
      const vals = node.children
        ? node.children.flatMap(n => checkNode(n))
        : [];
      if (node.children && node.children.some(compare)) {
        vals.push(node.value);
      }
      return vals;
    };

    return nodes.flatMap(n => checkNode(n));
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
