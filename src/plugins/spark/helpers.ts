import defaults from 'lodash/defaults';
import isArray from 'lodash/isArray';
import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';
import range from 'lodash/range';
import { VueConstructor } from 'vue';

import { ref } from '@/helpers/component-ref';
import { createBlockDialog, createDialog } from '@/helpers/dialog';
import {
  base64ToHex,
  dateString,
  durationString,
  hexToBase64,
  round,
  shortDateString,
  truncate,
  truncateRound,
  typeMatchFilter,
  unitDurationString,
} from '@/helpers/functional';
import { saveFile } from '@/helpers/import-export';
import notify from '@/helpers/notify';
import { GraphAxis, GraphConfig } from '@/plugins/history/types';
import { objectUnit, serializedPropertyName } from '@/plugins/spark/parse-object';
import { sparkStore } from '@/plugins/spark/store';
import { Link, Unit } from '@/plugins/spark/units';
import { ComponentResult, Crud, WidgetFeature } from '@/store/features';

import { compatibleTypes } from './getters';
import type {
  AnalogConstraint,
  AnyConstraintsObj,
  Block,
  BlockAddress,
  BlockConfig,
  BlockCrud,
  BlockField,
  BlockOrIntfType,
  BlockType,
  DataBlock,
  DigitalConstraint,
  DisplayOpts,
  DisplaySettingsBlock,
  DisplaySlot,
} from './types';

export const blockIdRules = (serviceId: string): InputRule[] => [
  v => !!v || 'Name must not be empty',
  v => sparkStore.blockById(serviceId, v) === null || 'Name must be unique',
  v => /^[a-zA-Z]/.test(v) || 'Name must start with a letter',
  v => /^[a-zA-Z0-9 \(\)_\-\|]*$/.test(v) || 'Name may only contain letters, numbers, spaces, and ()-_|',
  v => v.length < 200 || 'Name must be less than 200 characters',
];

export const installFilters = (Vue: VueConstructor): void => {
  Vue.filter(
    'unit',
    (value: Unit | null) =>
      (value !== null && value !== undefined ? value.toString() : '-'));
  Vue.filter(
    'link',
    (value: Link | null) =>
      (value !== null && value !== undefined ? value.toString() : '-'));
  Vue.filter('round', round);
  Vue.filter('truncateRound', truncateRound);
  Vue.filter('hexToBase64', hexToBase64);
  Vue.filter('base64ToHex', base64ToHex);
  Vue.filter('duration', durationString);
  Vue.filter('truncated', truncate);
  Vue.filter('unitDuration', unitDurationString);
  Vue.filter('dateString', dateString);
  Vue.filter('shortDateString', shortDateString);
};

const errorComponent = (error: string): ComponentResult => ({
  component: 'InvalidWidget',
  error,
});

export const blockWidgetSelector = (ctor: VueConstructor, typeName: BlockType | null): WidgetFeature['component'] => {
  const component = ref(ctor);
  return (crud: Crud<BlockConfig> | BlockCrud): ComponentResult => {
    const { config } = crud.widget;
    const module = sparkStore.moduleById(config.serviceId);
    if (module === null) {
      return errorComponent(`Spark service '${config.serviceId}' not found`);
    }
    // If crud is a BlockCrud, block is already set
    // Otherwise we'll have to check the store
    const block = ('block' in crud)
      ? crud.block
      : module.blockById(config.blockId);
    if (block === null) {
      return errorComponent(`Block '${config.blockId}' not found`);
    }
    if (typeName !== null && block.type !== typeName) {
      return errorComponent(`Block type '${block.type}' does not match widget type '${typeName}'`);
    }
    return { component };
  };
};

export const isCompatible = (type: string | null, intf: BlockOrIntfType | BlockOrIntfType[] | null): boolean => {
  if (!intf) { return true; }
  if (!type) { return false; }
  if (type === intf) { return true; };
  if (isArray(intf)) { return intf.some(i => isCompatible(type, i)); }
  return Boolean(compatibleTypes[intf]?.includes(type));
};

export const canDisplay = (addr: BlockAddress): boolean =>
  isCompatible(addr?.type, [
    'TempSensorInterface',
    'SetpointSensorPairInterface',
    'ActuatorAnalogInterface',
    'Pid',
  ]);

const displayBlock = (serviceId: string | undefined | null): DisplaySettingsBlock | undefined =>
  serviceId
    ? sparkStore.serviceBlocks(serviceId)
      .find(typeMatchFilter<DisplaySettingsBlock>('DisplaySettings'))
    : undefined;

export const isDisplayed = (addr: BlockAddress): boolean =>
  addr.id !== null
  && !!displayBlock(addr.serviceId)?.data.widgets
    .find(w => Object.values(w).find(v => v instanceof Link && v.id === addr.id));

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
    notify.warn(`Block '${addr.id}' can't be shown on the Spark display`, { shown: opts.showNotify });
  }
  else if (opts.unique && isDisplayed(addr)) {
    notify.info(`Block '${addr.id}' is already shown on the Spark display`, { shown: opts.showNotify });
  }
  else if (!opts.pos) {
    notify.info('Spark display is already full', { shown: opts.showNotify });
  }
  else {
    const { id, type } = addr;

    const link = new Link(id, type as BlockType);
    const slot: DisplaySlot = {
      pos: opts.pos,
      color: opts.color,
      name: opts.name.slice(0, 15),
    };
    if (isCompatible(type, 'TempSensorInterface')) {
      slot.tempSensor = link;
    }
    else if (isCompatible(type, 'SetpointSensorPairInterface')) {
      slot.setpointSensorPair = link;
    }
    else if (isCompatible(type, 'ActuatorAnalogInterface')) {
      slot.actuatorAnalog = link;
    }
    else if (isCompatible(type, 'Pid')) {
      slot.pid = link;
    }

    display.data.widgets = [slot, ...display.data.widgets.filter(w => w.pos !== opts.pos)];
    await sparkStore.saveBlock(display);
    notify.info(`Added block '${addr.id}' to the Spark display`, { shown: opts.showNotify });
  }

  if (opts.showDialog) {
    createBlockDialog(display);
  }
};

const addressedTypes: BlockType[] = [
  'TempSensorOneWire',
  'DS2408',
  'DS2413',
];

export const saveHwInfo = (serviceId: string): void => {
  const linked: string[] = [];
  const addressed: string[] = [];

  sparkStore.serviceBlocks(serviceId)
    .forEach(block => {
      if (block.type === 'MotorValve') {
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

      if (block.type === 'DigitalActuator') {
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
      throw new Error(`Service '${serviceId}' not found`);
    }

    if (opts.download) {
      saveHwInfo(serviceId);
    }

    if (opts.restore) {
      module.blocks
        .filter(block => addressedTypes.includes(block.type) && !block.id.startsWith('New|'))
        .forEach(block => addresses[block.data.address] = block.id);
    }

    await module.clearBlocks();
    await module.fetchDiscoveredBlocks();
    await module.fetchBlocks();

    if (opts.restore) {
      const renameArgs: [string, string][] = module.blocks
        .filter(block => addressedTypes.includes(block.type) && !!addresses[block.data.address])
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
    title: 'Reset blocks',
    message: `This will remove all blocks on ${serviceId}. Are you sure?`,
    noBackdropDismiss: true,
    cancel: true,
    options: {
      type: 'checkbox',
      items: [
        { label: 'Remember names of discovered blocks', value: 0 },
        { label: 'Create text file with actuator/sensor info', value: 1 },
      ],
      model: [0, 1], // pre-check default actions
    },
  })
    .onOk((selected: number[]) => resetBlocks(serviceId, {
      restore: selected.includes(0),
      download: selected.includes(1),
    }));
};

export const asDataBlock =
  (block: Block): DataBlock =>
    pick(block, ['id', 'nid', 'type', 'groups', 'data']);

export const asBlock =
  (block: DataBlock, serviceId: string): Block =>
    ({
      ...block,
      serviceId,
      type: block.type as BlockType,
    });

export const asBlockAddress =
  (block: Block): BlockAddress =>
    pick(block, ['id', 'serviceId', 'type']);

export const prettifyConstraints =
  (obj: AnyConstraintsObj | undefined): string =>
    (obj === undefined || obj.constraints.length === 0)
      ? '<no constraints>'
      : obj
        .constraints
        .map((c: AnalogConstraint | DigitalConstraint) => {
          // Analog
          if ('min' in c) {
            return `Minimum = ${c.min}`;
          }
          if ('max' in c) {
            return `Maximum = ${c.max}`;
          }
          if ('balanced' in c) {
            return `Balanced by ${c.balanced.balancerId.id ?? '<not set>'}`;
          }
          // Digital
          if ('minOff' in c) {
            return `Minimum OFF = ${unitDurationString(c.minOff)}`;
          }
          if ('minOn' in c) {
            return `Minimum ON = ${unitDurationString(c.minOn)}`;
          }
          if ('mutexed' in c) {
            return `Mutexed by ${c.mutexed.mutexId.id ?? '<not set>'}`;
          }
          if ('delayedOn' in c) {
            return `Delayed ON = ${unitDurationString(c.delayedOn)}`;
          }
          if ('delayedOff' in c) {
            return `Delayed OFF = ${unitDurationString(c.delayedOff)}`;
          }
          // Fallback
          return 'Unknown constraint';
        })
        .sort()
        .join(', ');


export const blockGraphCfg = <BlockT extends Block = any>(crud: BlockCrud<BlockT>): GraphConfig => {
  const { queryParams, graphAxes, graphLayout } = defaults(crud.widget.config, {
    queryParams: { duration: '1h' },
    graphAxes: {},
    graphLayout: {},
  });

  const graphedFields: BlockField[] = sparkStore
    .spec(crud.block)
    .fields
    .filter(f => f.graphed);

  const graphedObj: Mapped<BlockField> = keyBy(
    graphedFields,
    f => {
      const key = serializedPropertyName(f.key, crud.block.data);
      return `${crud.block.serviceId}/${crud.block.id}/${key}`;
    });

  const fieldAxes: Mapped<GraphAxis> = mapValues(
    graphedObj,
    f => f.graphAxis ?? 'y');

  const renames: Mapped<string> = mapValues(
    graphedObj,
    f => {
      const name = f.graphName ?? f.title;
      const unit = objectUnit(crud.block.data[f.key]);
      return unit ? `${name} [${unit}]` : name;
    });

  const targets = [{
    measurement: crud.block.serviceId,
    fields: graphedFields
      .map(f => serializedPropertyName(f.key, crud.block.data))
      .map(k => `${crud.block.id}/${k}`),
  }];

  return {
    params: queryParams,
    axes: defaults(graphAxes, fieldAxes),
    layout: defaults({ title: crud.widget.title }, graphLayout),
    targets,
    renames,
    colors: {},
  };
};
