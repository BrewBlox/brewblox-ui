import { Notify } from 'quasar';
import { VueConstructor } from 'vue';

import { ref } from '@/helpers/component-ref';
import { createDialog } from '@/helpers/dialog';
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
import { Link, Unit } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';
import { Crud, WidgetSelector } from '@/store/features';

import { blockTypes } from './block-types';
import { BlockConfig, BlockCrud } from './types';

export const blockIdRules = (serviceId: string): InputRule[] => [
  v => !!v || 'Name must not be empty',
  v => !sparkStore.blockIds(serviceId).includes(v) || 'Name must be unique',
  v => !!v.match(/^[a-zA-Z]/) || 'Name must start with a letter',
  v => !!v.match(/^[a-zA-Z0-9 \(\)_\-\|]*$/) || 'Name may only contain letters, numbers, spaces, and ()-_|',
  v => v.length < 200 || 'Name must be less than 200 characters',
];

export const digitalConstraintLabels = new Map([
  ['minOff', 'Minimum OFF time'],
  ['minOn', 'Minimum ON time'],
  ['mutex', 'Mutually exclusive'],
]);

export const analogConstraintLabels = new Map([
  ['min', 'Minimum'],
  ['max', 'Maximum'],
  ['balanced', 'Balanced'],
]);

export const constraintLabels = new Map([
  ...digitalConstraintLabels.entries(),
  ...analogConstraintLabels.entries(),
]);

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

export const blockWidgetSelector = (component: VueConstructor): WidgetSelector => {
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

export const resetBlocks = async (serviceId: string, opts: { restore: boolean; download: boolean }): Promise<void> => {
  try {
    const addresses: Mapped<string> = {};
    const linkedTypes = [
      blockTypes.DigitalActuator,
      blockTypes.MotorValve,
    ];
    const addressedTypes = [
      blockTypes.TempSensorOneWire,
      blockTypes.DS2408,
      blockTypes.DS2413,
    ];

    if (opts.download) {
      const linked: string[] = [];
      const addressed: string[] = [];

      sparkStore.blockValues(serviceId)
        .forEach(block => {
          if (linkedTypes.includes(block.type)) {
            const { hwDevice, channel } = block.data;
            if (!hwDevice.id || !channel) { return; }
            const target = sparkStore.blockById(serviceId, block.data.hwDevice.id);
            const [name] = Object.keys(target.data.pins[channel]);
            linked.push(`${block.id}: ${target.id} ${name}`);
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

    Notify.create({
      icon: 'mdi-check-all',
      color: 'positive',
      message: 'Removed all Blocks' + (opts.restore ? ', and restored discovered blocks' : ''),
    });
  } catch (e) {
    Notify.create({
      icon: 'error',
      color: 'negative',
      message: `Failed to remove Blocks: ${e.toString()}`,
    });
  }
};

export const startResetBlocks = (serviceId: string): void => {
  createDialog({
    title: 'Reset Blocks',
    message: `This will remove all Blocks on ${serviceId}. Are you sure?`,
    dark: true,
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
