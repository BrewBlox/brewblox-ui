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
  unitDurationString,
} from '@/helpers/functional';
import { saveFile } from '@/helpers/import-export';
import notify from '@/helpers/notify';
import { Link, Unit } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';
import { Crud, WidgetFeature } from '@/store/features';

import { blockTypes, interfaceTypes, isCompatible } from './block-types';
import { DisplaySettingsBlock } from './features/DisplaySettings/types';
import { BlockAddress, BlockConfig, BlockCrud, DisplayOpts, DisplaySlot } from './types';

export const blockIdRules = (serviceId: string): InputRule[] => [
  v => !!v || 'Name must not be empty',
  v => !sparkStore.blockIds(serviceId).includes(v) || 'Name must be unique',
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

export const blockWidgetSelector = (component: VueConstructor): WidgetFeature['component'] => {
  const widget = ref(component);
  return (crud: Crud) => {
    const { config }: { config: BlockConfig } = crud.widget;
    if (!sparkStore.serviceAvailable(config.serviceId)) {
      throw new Error(`Spark service '${config.serviceId}' not found`);
    }
    const bCrud = crud as BlockCrud;
    if ((bCrud.isStoreBlock || bCrud.isStoreBlock === undefined)
      && !sparkStore.blockIds(config.serviceId).includes(config.blockId)) {
      throw new Error(`Block '${config.blockId}' not found in store`);
    }
    return widget;
  };
};

export const canDisplay = (addr: BlockAddress): boolean => {
  if (!addr) { return false; }
  return [
    interfaceTypes.TempSensor,
    interfaceTypes.SetpointSensorPair,
    interfaceTypes.ActuatorAnalog,
    blockTypes.Pid,
  ]
    .some(intf => isCompatible(addr.type, intf));
};

const displayBlock = (serviceId: string | undefined): DisplaySettingsBlock | undefined =>
  serviceId
    ? sparkStore.blockValues(serviceId).find(v => v.type === blockTypes.DisplaySettings)
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

    const link = new Link(id, type);
    const slot: DisplaySlot = {
      pos: opts.pos,
      color: opts.color,
      name: opts.name.slice(0, 15),
    };
    if (isCompatible(type, interfaceTypes.TempSensor)) {
      slot.tempSensor = link;
    }
    else if (isCompatible(type, interfaceTypes.SetpointSensorPair)) {
      slot.setpointSensorPair = link;
    }
    else if (isCompatible(type, interfaceTypes.ActuatorAnalog)) {
      slot.actuatorAnalog = link;
    }
    else if (isCompatible(type, blockTypes.Pid)) {
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

const linkedTypes = [
  blockTypes.DigitalActuator,
  blockTypes.MotorValve,
];

const addressedTypes = [
  blockTypes.TempSensorOneWire,
  blockTypes.DS2408,
  blockTypes.DS2413,
];

export const saveHwInfo = (serviceId: string): void => {
  const linked: string[] = [];
  const addressed: string[] = [];

  sparkStore.blockValues(serviceId)
    .forEach(block => {
      if (linkedTypes.includes(block.type)) {
        const { hwDevice, channel } = block.data;
        if (!hwDevice.id || !channel) { return; }
        const target = sparkStore.blockById(serviceId, block.data.hwDevice.id);
        const pin = target.data.pins[channel - 1];
        if (pin !== undefined) {
          const [name] = Object.keys(pin);
          linked.push(`${block.id}: ${target.id} ${name}`);
        }
      }
      if (addressedTypes.includes(block.type)) {
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

    if (opts.download) {
      saveHwInfo(serviceId);
    }

    if (opts.restore) {
      sparkStore.blockValues(serviceId)
        .filter(block => addressedTypes.includes(block.type) && !block.id.startsWith('New|'))
        .forEach(block => addresses[block.data.address] = block.id);
    }

    await sparkStore.clearBlocks(serviceId);
    await sparkStore.fetchDiscoveredBlocks(serviceId);
    await sparkStore.fetchBlocks(serviceId);

    if (opts.restore) {
      const renameArgs: [string, string, string][] = sparkStore.blockValues(serviceId)
        .filter(block => addressedTypes.includes(block.type) && !!addresses[block.data.address])
        .map(block => [serviceId, block.id, addresses[block.data.address]]);
      await Promise.all(renameArgs.map(sparkStore.renameBlock));
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
