import capitalize from 'lodash/capitalize';
import escapeRegExp from 'lodash/escapeRegExp';
import flatMap from 'lodash/flatMap';
import set from 'lodash/set';
import startCase from 'lodash/startCase';

import { prettyUnit } from '@/utils/bloxfield';
import { splitPostfixed } from '@/utils/parsing';

import { QueryTarget } from './types';

function sentenceCased(s: string): string {
  return capitalize(startCase(s));
}

export function defaultLabel(key: string): string {
  const [name, postfix] = splitPostfixed(key);
  const path = name.split('/').slice(1);
  const nameStr = sentenceCased(path.pop()!);
  const pathStr = path.length ? `[${path.join(' ')}] ` : '';
  const unitStr = prettyUnit(postfix);
  return `${pathStr}${nameStr} ${unitStr}`.trim();
}

function nodeRecurser(
  parent: string[],
  key: string,
  val: string | any,
  partial: Partial<QuasarNode>,
): QuasarNode {
  // Leaf nodes
  if (typeof val === 'string') {
    const [name, postfix] = splitPostfixed(key);
    const label = postfix !== null
      ? `${sentenceCased(name)} ${prettyUnit(postfix)}`
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
}

export function nodeBuilder(
  fields: { [measurement: string]: string[] },
  partial: Partial<QuasarNode> = {},
): QuasarNode[] {
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
}

export function filteredNodes(nodes: QuasarNode[], filter: string): string[] {
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
}

export function targetSplitter(targets: QueryTarget[]): string[] {
  return flatMap(
    targets,
    tar => tar.fields.map(f => `${tar.measurement}/${f}`),
  );
}

export function targetBuilder(vals: string[], knownFields: Mapped<string[]>): QueryTarget[] {
  return vals
    .reduce(
      (acc: QueryTarget[], v: string) => {
        const [measurement, ...keys] = v.split('/');
        const field = keys.join('/');
        const existing = acc.find(t => t.measurement === measurement);
        if (!knownFields[measurement]?.includes(field)) {
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
}
