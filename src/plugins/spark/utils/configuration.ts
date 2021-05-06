import defaults from 'lodash/defaults';
import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';

import { GraphAxis, GraphConfig } from '@/plugins/history/types';
import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress, BlockConfig, BlockField, ProfileValues } from '@/plugins/spark/types';
import { Block, SetpointProfileBlock } from '@/shared-types';
import { bloxQty, isQuantity, prettyUnit } from '@/utils/bloxfield';
import notify from '@/utils/notify';

export const asBlockAddress =
  (block: Block): BlockAddress =>
    pick(block, ['id', 'serviceId', 'type']);

export function makeBlockIdRules(serviceId: string): InputRule[] {
  return [
    v => !!v || 'Name must not be empty',
    v => sparkStore.blockById(serviceId, v) === null || 'Name must be unique',
    v => /^[a-zA-Z]/.test(v) || 'Name must start with a letter',
    v => /^[a-zA-Z0-9 \(\)_\-\|]*$/.test(v) || 'Name may only contain letters, numbers, spaces, and ()-_|',
    v => v.length < 200 || 'Name must be less than 200 characters',
  ];
}

const postfix = (obj: any): string =>
  isQuantity(obj)
    ? bloxQty(obj).postfix
    : '';

export function makeBlockGraphConfig<BlockT extends Block = Block>(
  block: BlockT,
  config: Pick<BlockConfig, 'graphAxes' | 'graphLayout' | 'queryParams'>,
  fieldFilter: ((f: BlockField) => boolean) = (() => true),
): GraphConfig {
  const { queryParams, graphAxes, graphLayout } = defaults(config, {
    queryParams: { duration: '1h' },
    graphAxes: {},
    graphLayout: {},
  });

  const graphedFields: BlockField[] = sparkStore
    .spec(block)
    .fields
    .filter(f => f.graphed)
    .filter(f => fieldFilter(f));

  const graphedObj: Mapped<BlockField> = keyBy(
    graphedFields,
    f => {
      return [
        block.serviceId,
        block.id,
        f.key + postfix(block.data[f.key]),
      ].join('/');
    });

  const fieldAxes: Mapped<GraphAxis> = mapValues(
    graphedObj,
    f => f.graphAxis ?? 'y');

  const renames: Mapped<string> = mapValues(
    graphedObj,
    f => `${f.graphName ?? f.title} ${prettyUnit(postfix(block.data[f.key]))}`);

  const targets = [{
    measurement: block.serviceId,
    fields: graphedFields
      .map(f => `${block.id}/${f.key}${postfix(block.data[f.key])}`),
  }];

  return {
    params: queryParams,
    axes: defaults(graphAxes, fieldAxes),
    layout: defaults({ title: block.id }, graphLayout),
    targets,
    renames,
    colors: {},
    precision: {},
  };
}

export async function discoverBlocks(serviceId: string | null, show = true): Promise<string[]> {
  const module = sparkStore.moduleById(serviceId);
  if (!module) {
    return [];
  }
  const discovered = await module.fetchDiscoveredBlocks();
  if (show) {
    notify.info({
      icon: 'mdi-magnify-plus-outline',
      message: discovered.length > 0
        ? `Discovered <i>${discovered.join(', ')}</i>.`
        : 'Discovered no new blocks.',
    });
  }
  return discovered;
}

export function calculateProfileValues(block: SetpointProfileBlock | null): ProfileValues | null {
  if (!block || !block.data.enabled || !block.data.drivenTargetId.id) {
    return null;
  }

  const now = new Date().getTime() / 1000;
  const start = block.data.start || 0;
  const idx = block.data.points.findIndex(point => start + point.time > now);
  if (idx < 1) {
    return null;
  }
  const prev = block.data.points[idx - 1];
  const next = block.data.points[idx];
  const unit = prev.temperature.unit;
  const prevVal = prev.temperature.value as number;
  const nextVal = next.temperature.value as number;
  const duration = (next.time - prev.time) || 1;
  const currentVal = prevVal + (now - start + prev.time) * (nextVal - prevVal) / duration;

  return {
    prev: bloxQty(prevVal, unit),
    current: bloxQty(currentVal, unit),
    next: bloxQty(nextVal, unit),
  };
}

// source: https://www.adriangranados.com/blog/dbm-to-percent-conversion
export function calculateWiFiPct(dbm: number): number {
  if (dbm < -92) {
    return 1;
  }
  if (dbm > -21) {
    return 100;
  }
  return Math.round(((-0.0154 * dbm * dbm) - (0.3794 * dbm)) + 98.182);
}
