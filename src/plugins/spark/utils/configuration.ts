import { GraphAxis, GraphConfig } from '@/plugins/history/types';
import { useBlockSpecStore, useSparkStore } from '@/plugins/spark/store';
import {
  BlockAddress,
  BlockConfig,
  BlockFieldSpec,
  ProfileValues,
} from '@/plugins/spark/types';
import { isQuantity } from '@/utils/identity';
import { bloxLink } from '@/utils/link';
import { bloxQty, durationMs, parseDate, prettyUnit } from '@/utils/quantity';
import {
  Block,
  BlockIntfType,
  IoDriverInterfaceBlock,
  Link,
  SetpointProfileBlock,
} from 'brewblox-proto/ts';
import defaults from 'lodash/defaults';
import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';
import { isBlockCompatible } from './info';

export const asBlockAddress = (block: Block): BlockAddress =>
  pick(block, ['id', 'serviceId', 'type']);

export function makeBlockIdRules(serviceId: string): InputRule[] {
  return [
    (v) => !!v || 'Name must not be empty',
    (v) =>
      useSparkStore().blockById(serviceId, v) === null || 'Name must be unique',
    (v) => /^[a-zA-Z]/.test(v) || 'Name must start with a letter',
    (v) =>
      /^[a-zA-Z0-9 \(\)_\-\|]*$/.test(v) ||
      'Name may only contain letters, numbers, spaces, and ()-_|',
    (v) => v.length < 200 || 'Name must be less than 200 characters',
  ];
}

const postfix = (obj: any): string =>
  isQuantity(obj) ? bloxQty(obj).postfix : '';

export function makeBlockGraphConfig<BlockT extends Block = Block>(
  block: BlockT,
  config: Pick<BlockConfig, 'graphAxes' | 'graphLayout' | 'queryParams'>,
  fieldFilter: (f: BlockFieldSpec) => boolean = () => true,
): GraphConfig {
  const { queryParams, graphAxes, graphLayout } = defaults(config, {
    queryParams: { duration: '1h' },
    graphAxes: {},
    graphLayout: {},
  });

  const graphedFields: BlockFieldSpec[] = useBlockSpecStore()
    .fieldSpecsByType(block.type)
    .filter((f) => f.graphed && fieldFilter(f));

  const graphedObj: Mapped<BlockFieldSpec> = keyBy(graphedFields, (f) => {
    return [block.serviceId, block.id, f.key + postfix(block.data[f.key])].join(
      '/',
    );
  });

  const fieldAxes: Mapped<GraphAxis> = mapValues(
    graphedObj,
    (f) => f.graphAxis ?? 'y',
  );

  const renames: Mapped<string> = mapValues(
    graphedObj,
    (f) =>
      `${f.graphName ?? f.title} ${prettyUnit(postfix(block.data[f.key]))}`,
  );

  const fields = graphedFields.map(
    (f) =>
      `${block.serviceId}/${block.id}/${f.key}${postfix(block.data[f.key])}`,
  );

  return {
    version: '1.0',
    params: queryParams,
    axes: defaults(graphAxes, fieldAxes),
    layout: defaults({ title: block.id }, graphLayout),
    fields,
    renames,
    colors: {},
    precision: {},
  };
}

export function calculateProfileValues(
  block: SetpointProfileBlock | null,
): ProfileValues | null {
  if (!block || !block.data.enabled || !block.data.targetId.id) {
    return null;
  }

  const now = new Date().getTime();
  const start = parseDate(block.data.start)?.getTime() ?? 0;
  const idx = block.data.points.findIndex(
    (point) => start + durationMs(point.time) > now,
  );
  if (idx < 1) {
    return null;
  }
  const prev = block.data.points[idx - 1];
  const next = block.data.points[idx];
  const unit = prev.temperature.unit;
  const prevVal = prev.temperature.value as number;
  const nextVal = next.temperature.value as number;
  const duration = durationMs(next.time) - durationMs(prev.time) || 1;
  const currentVal =
    prevVal +
    ((now - start + durationMs(prev.time)) * (nextVal - prevVal)) / duration;

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
  return Math.round(-0.0154 * dbm * dbm - 0.3794 * dbm + 98.182);
}

export async function unlinkChannelActuators(
  serviceId: string,
  hwDevice: Link,
  channel: number,
): Promise<void> {
  if (!hwDevice.id || !channel) {
    return;
  }

  const sparkStore = useSparkStore();

  await Promise.all(
    sparkStore
      .blocksByService(serviceId)
      .filter((block): block is IoDriverInterfaceBlock =>
        isBlockCompatible(block, BlockIntfType.IoDriverInterface),
      )
      .filter(
        (block) =>
          block.data.hwDevice.id === hwDevice.id &&
          block.data.channel === channel,
      )
      .map((block) =>
        sparkStore.patchBlock(block, { hwDevice: bloxLink(null), channel: 0 }),
      ),
  );
}

export async function setExclusiveChannelActuator(
  actuator: Maybe<Block>,
  hwDevice: Link,
  channel: number,
): Promise<void> {
  if (
    !isBlockCompatible<IoDriverInterfaceBlock>(
      actuator,
      BlockIntfType.IoDriverInterface,
    )
  ) {
    return;
  }

  if (
    actuator.data.hwDevice.id === hwDevice.id &&
    actuator.data.channel === channel
  ) {
    return; // no change
  }

  await unlinkChannelActuators(actuator.serviceId, hwDevice, channel);
  await useSparkStore().patchBlock(actuator, { hwDevice, channel });
}
