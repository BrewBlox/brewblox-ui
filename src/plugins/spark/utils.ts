import defaults from 'lodash/defaults';
import isArray from 'lodash/isArray';
import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';
import range from 'lodash/range';
import { Enum } from 'typescript-string-enums';
import { App, Component } from 'vue';

import { GraphAxis, GraphConfig } from '@/plugins/history/types';
import { sparkStore } from '@/plugins/spark/store';
import { Quantity, SetpointProfileBlock, SparkPatchEvent, SparkStateEvent, SparkUpdateEvent } from '@/shared-types';
import { ComponentResult, WidgetFeature } from '@/store/features';
import { Widget } from '@/store/widgets';
import { bloxLink, bloxQty, isLink, isQuantity, prettyLink, prettyQty, prettyUnit } from '@/utils/bloxfield';
import { cref } from '@/utils/component-ref';
import { createBlockDialog, createDialog } from '@/utils/dialog';
import { durationString } from '@/utils/duration';
import {
  matchesType,
  typeMatchFilter,
} from '@/utils/functional';
import { saveFile } from '@/utils/import-export';
import notify from '@/utils/notify';

import { compatibleTypes } from './getters';
import {
  AnyConstraint,
  AnyConstraintsObj,
  Block,
  BlockAddress,
  BlockConfig,
  BlockField,
  BlockIntfType,
  BlockType,
  ComparedBlockType,
  DigitalActuatorBlock,
  DisplayOpts,
  DisplaySettingsBlock,
  DisplaySlot,
  MotorValveBlock,
} from './types';

export const blockIdRules = (serviceId: string): InputRule[] => [
  v => !!v || 'Name must not be empty',
  v => sparkStore.blockById(serviceId, v) === null || 'Name must be unique',
  v => /^[a-zA-Z]/.test(v) || 'Name must start with a letter',
  v => /^[a-zA-Z0-9 \(\)_\-\|]*$/.test(v) || 'Name may only contain letters, numbers, spaces, and ()-_|',
  v => v.length < 200 || 'Name must be less than 200 characters',
];

export const prettyBlock = (v: BlockAddress | null | undefined): string =>
  v?.id || '<not set>';

export const prettyAny = (v: unknown): string => {
  if (isQuantity(v)) {
    return prettyQty(v);
  }
  if (isLink(v)) {
    return prettyLink(v);
  }
  return JSON.stringify(v);
};

// export const installFilters = (Vue: VueConstructor): void => {
//   Vue.filter('quantity', prettyQty);
//   Vue.filter('prettyUnit', prettyUnit);
//   Vue.filter('duration', (v: any, nullV = '<not set>') => durationString(v, nullV));
//   Vue.filter('link', prettyLink);
//   Vue.filter('block', (v: BlockAddress) => v?.id || '<not set>');
//   Vue.filter('widgetTitle', (type: string) => featureStore.widgetTitle(type));
//   Vue.filter('pretty', prettyAny);
//   Vue.filter('round', round);
//   Vue.filter('truncateRound', truncateRound);
//   Vue.filter('hexToBase64', hexToBase64);
//   Vue.filter('base64ToHex', base64ToHex);
//   Vue.filter('truncated', truncate);
//   Vue.filter('dateString', dateString);
//   Vue.filter('shortDateString', shortDateString);
//   Vue.filter('capitalize', capitalize);
// };

const errorComponent = (error: string): ComponentResult => ({
  component: 'InvalidWidget',
  error,
});

export function blockWidgetSelector(
  app: App,
  ctor: Component,
  typeName: BlockType | null,
): WidgetFeature['component'] {
  const component = cref(app, ctor);
  return (widget: Widget): ComponentResult => {
    const { config } = widget;
    const module = sparkStore.moduleById(config.serviceId);
    if (module === null) {
      return errorComponent(`Spark service '${config.serviceId}' not found`);
    }
    const block = module.blockById(config.blockId);
    if (block === null) {
      return errorComponent(`Block '${config.blockId}' not found`);
    }
    if (typeName !== null && block.type !== typeName) {
      return errorComponent(`Block type '${block.type}' does not match widget type '${typeName}'`);
    }
    return { component };
  };
}

export const isCompatible = (type: string | null, intf: ComparedBlockType): boolean => {
  if (!intf) { return true; }
  if (!type) { return false; }
  if (type === intf) { return true; }
  if (isArray(intf)) { return intf.some(i => isCompatible(type, i)); }
  return Boolean(compatibleTypes[intf]?.includes(type));
};

export const canDisplay = (addr: BlockAddress): boolean =>
  isCompatible(addr?.type, [
    BlockIntfType.TempSensorInterface,
    BlockIntfType.SetpointSensorPairInterface,
    BlockIntfType.ActuatorAnalogInterface,
    BlockType.Pid,
  ]);

const displayBlock = (serviceId: string | undefined | null): DisplaySettingsBlock | undefined =>
  serviceId
    ? sparkStore.serviceBlocks(serviceId)
      .find(typeMatchFilter<DisplaySettingsBlock>(BlockType.DisplaySettings))
    : undefined;

export const isDisplayed = (addr: BlockAddress): boolean =>
  addr.id !== null
  && !!displayBlock(addr.serviceId)?.data.widgets
    .find(w => Object.values(w).find(v => isLink(v) && v.id === addr.id));

export const tryDisplayBlock = async (addr: BlockAddress, options: Partial<DisplayOpts> = {}): Promise<void> => {
  const display = displayBlock(addr?.serviceId);
  if (!addr || !addr.id || !addr.type || !display) { return; }

  const { widgets } = display.data;
  const takenPos = widgets.map(w => w.pos);
  const opts: DisplayOpts = {
    pos: range(1, 7).find(v => !takenPos.includes(v)),
    color: '4169E1',
    name: addr.id,
    unique: true,
    showNotify: true,
    showDialog: true,
    ...options,
  };

  if (!canDisplay(addr)) {
    notify.warn(`Block <i>${addr.id}</i> can't be shown on the Spark display`, { shown: opts.showNotify });
  }
  else if (opts.unique && isDisplayed(addr)) {
    notify.info(`Block <i>${addr.id}</i> is already shown on the Spark display`, { shown: opts.showNotify });
  }
  else if (!opts.pos) {
    notify.info('Spark display is already full', { shown: opts.showNotify });
  }
  else {
    const { id, type } = addr;

    const link = bloxLink(id, type as BlockType);
    const slot: DisplaySlot = {
      pos: opts.pos,
      color: opts.color,
      name: opts.name.slice(0, 15),
    };
    if (isCompatible(type, BlockIntfType.TempSensorInterface)) {
      slot.tempSensor = link;
    }
    else if (isCompatible(type, BlockIntfType.SetpointSensorPairInterface)) {
      slot.setpointSensorPair = link;
    }
    else if (isCompatible(type, BlockIntfType.ActuatorAnalogInterface)) {
      slot.actuatorAnalog = link;
    }
    else if (isCompatible(type, BlockType.Pid)) {
      slot.pid = link;
    }

    display.data.widgets = [slot, ...display.data.widgets.filter(w => w.pos !== opts.pos)];
    await sparkStore.saveBlock(display);
    notify.info(`Added <i>${addr.id}</i> to the Spark display`, { shown: opts.showNotify });
  }

  if (opts.showDialog) {
    createBlockDialog(display);
  }
};

export const saveHwInfo = (serviceId: string): void => {
  const linked: string[] = [];
  const addressed: string[] = [];

  sparkStore.serviceBlocks(serviceId)
    .forEach(block => {
      if (matchesType<MotorValveBlock>(BlockType.MotorValve, block)) {
        const { hwDevice, startChannel } = block.data;
        if (hwDevice.id === null || !startChannel) {
          return;
        }
        const target = sparkStore.blockById(serviceId, hwDevice.id);
        const pin = target?.data.pins[startChannel - 1];
        if (target && pin !== undefined) {
          const [name] = Object.keys(pin);
          linked.push(`${block.id}: ${target.id} ${name}`);
        }
      }

      if (matchesType<DigitalActuatorBlock>(BlockType.DigitalActuator, block)) {
        const { hwDevice, channel } = block.data;
        if (hwDevice.id === null || !channel) {
          return;
        }
        const target = sparkStore.blockById(serviceId, hwDevice.id);
        const pin = target?.data.pins[channel - 1];
        if (target && pin !== undefined) {
          const [name] = Object.keys(pin);
          linked.push(`${block.id}: ${target.id} ${name}`);
        }
      }

      if ('address' in block.data) {
        addressed.push(`${block.id}: ${block.data.address}`);
      }
    });

  const lines = [
    `Service: ${serviceId}`,
    `Date: ${new Date().toLocaleString()}`,
    '\n[Actuators]',
    ...linked,
    '\n[OneWire addresses]',
    ...addressed,
  ];
  saveFile(lines.join('\n'), `spark-hardware-${serviceId}.txt`, true);
};

export const resetBlocks = async (serviceId: string, opts: { restore: boolean; download: boolean }): Promise<void> => {
  try {
    const addresses: Mapped<string> = {};
    const module = sparkStore.moduleById(serviceId);

    if (!module) {
      throw new Error(`Service <b>${serviceId}</b> not found`);
    }

    if (opts.download) {
      saveHwInfo(serviceId);
    }

    if (opts.restore) {
      module.blocks
        .filter(block =>
          isCompatible(block.type, BlockIntfType.OneWireDeviceInterface)
          && !block.id.startsWith('New|'))
        .forEach(block => addresses[block.data.address] = block.id);
    }

    await module.clearBlocks();
    await module.fetchDiscoveredBlocks();
    await module.fetchBlocks();

    if (opts.restore) {
      const renameArgs: [string, string][] = module.blocks
        .filter(block =>
          isCompatible(block.type, BlockIntfType.OneWireDeviceInterface)
          && !!addresses[block.data.address])
        .map(block => [block.id, addresses[block.data.address]]);
      await Promise.all(renameArgs.map(module.renameBlock));
    }
    notify.done('Removed all blocks' + (opts.restore ? ', and restored discovered blocks' : ''));
  } catch (e) {
    notify.error(`Failed to remove blocks: ${e.toString()}`);
  }
};

export const startResetBlocks = (serviceId: string): void => {
  createDialog({
    component: 'CheckboxDialog',
    componentProps: {
      title: 'Reset blocks',
      message: `This will remove all blocks on <b>${serviceId}</b>. Are you sure?`,
      html: true,
      noBackdropDismiss: true,
      selectOptions: [
        { label: 'Remember names of discovered blocks', value: 0 },
        { label: 'Export sensor and pin names', value: 1 },
      ],
      modelValue: [0, 1], // pre-check default actions
    },
  })
    .onOk((selected: number[]) => resetBlocks(serviceId, {
      restore: selected.includes(0),
      download: selected.includes(1),
    }));
};

interface ProfileValues {
  prev: Quantity;
  current: Quantity;
  next: Quantity;
}

export const profileValues =
  (block: SetpointProfileBlock | null): ProfileValues | null => {
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
  };

export const asBlockAddress =
  (block: Block): BlockAddress =>
    pick(block, ['id', 'serviceId', 'type']);

export const prettifyConstraints =
  (obj: AnyConstraintsObj | undefined): string =>
    (obj === undefined || obj.constraints.length === 0)
      ? '<no constraints>'
      : obj
        .constraints
        .map((c: AnyConstraint) => {
          // Analog
          if ('min' in c) {
            return `Minimum = ${c.min}`;
          }
          if ('max' in c) {
            return `Maximum = ${c.max}`;
          }
          if ('balanced' in c) {
            return `Balanced by ${prettyLink(c.balanced.balancerId)}`;
          }
          // Digital
          if ('minOff' in c) {
            return `Minimum OFF = ${durationString(c.minOff)}`;
          }
          if ('minOn' in c) {
            return `Minimum ON = ${durationString(c.minOn)}`;
          }
          if ('mutexed' in c) {
            return `Mutexed by ${prettyLink(c.mutexed.mutexId)}`;
          }
          if ('delayedOn' in c) {
            return `Delayed ON = ${durationString(c.delayedOn)}`;
          }
          if ('delayedOff' in c) {
            return `Delayed OFF = ${durationString(c.delayedOff)}`;
          }
          // Fallback
          return 'Unknown constraint';
        })
        .sort()
        .join(', ');

const postfix = (obj: any): string =>
  isQuantity(obj)
    ? bloxQty(obj).postfix
    : '';

export function blockGraphCfg<BlockT extends Block = Block>(
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

export const discoverBlocks = async (serviceId: string | null, show = true): Promise<string[]> => {
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
};

export async function cleanUnusedNames(serviceId: string | null): Promise<void> {
  const module = sparkStore.moduleById(serviceId);
  if (!module) { return; }
  const names = await module.cleanUnusedNames();

  const message = names.length > 0
    ? `Cleaned block names: <i>${names.join(', ')}</i>.`
    : 'No unused names found.';

  notify.info({ message, icon: 'mdi-tag-remove' });
}

export const enumHint = (e: Enum<any>): string =>
  'One of: ' + Enum.values(e).map(v => `'${v}'`).join(', ');

export const isBlockDriven = (block: Block | null): boolean =>
  Boolean(
    block
    && sparkStore
      .moduleById(block.serviceId)
      ?.drivenChains
      .some((chain: string[]) => chain[0] === block.id));

export const isSparkState = (data: unknown): data is SparkStateEvent =>
  (data as SparkStateEvent).type === 'Spark.state';

export const isSparkPatch = (data: unknown): data is SparkPatchEvent =>
  (data as SparkPatchEvent).type === 'Spark.patch';

export const isSparkUpdate = (data: unknown): data is SparkUpdateEvent =>
  (data as SparkUpdateEvent).type === 'Spark.update';
