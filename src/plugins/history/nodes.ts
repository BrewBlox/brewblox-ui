import escapeRegExp from 'lodash/escapeRegExp';
import set from 'lodash/set';

import { sentenceCased } from '@/helpers/functional';
import { prettify } from '@/helpers/units';
import { propertyNameWithUnit } from '@/helpers/units/parseObject';

import { historyStore } from './store';
import { QueryTarget } from './types';

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

export const filteredNodes =
  (nodes: QuasarNode[], filter: string): string[] => {
    const exp = new RegExp(escapeRegExp(filter), 'i');

    const compare = (node: QuasarNode): boolean =>
      exp.test(node.label) || exp.test(node.value);

    const checkNode = (node: QuasarNode): string[] => {
      const selected = (node.children ?? []).flatMap(checkNode);
      if (selected.length > 0 || compare(node)) {
        selected.push(node.value);
      }
      return selected;
    };

    return nodes.flatMap(n => checkNode(n));
  };

export const targetSplitter =
  (targets: QueryTarget[]): string[] =>
    targets
      .flatMap(tar => tar.fields.map(f => `${tar.measurement}/${f}`));

export const targetBuilder =
  (vals: string[], filterUnknown = true): QueryTarget[] => {
    const knownFields = historyStore.fields;
    return vals
      .reduce(
        (acc: QueryTarget[], v: string) => {
          const [measurement, ...keys] = v.split('/');
          const field = keys.join('/');
          const existing = acc.find(t => t.measurement === measurement);
          if (filterUnknown && !knownFields[measurement]?.includes(field)) {
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
