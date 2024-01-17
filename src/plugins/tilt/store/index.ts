import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { eventbus } from '@/eventbus';
import { useServiceStore } from '@/store/services';
import { userUnits } from '@/user-settings';
import { makeObjectSorter } from '@/utils/functional';
import { typed } from '@/utils/misc';
import { bloxQty, shortDateString } from '@/utils/quantity';
import type { TiltStateEvent, TiltStateValue } from '../types';
import { makeTiltId, splitTiltId } from '../utils';

const sorter = makeObjectSorter<TiltStateValue>('id');

export const useTiltStore = defineStore('tiltStore', () => {
  const valueMap = reactive<Mapped<TiltStateValue>>({});

  const values = computed<TiltStateValue[]>(() =>
    Object.values(valueMap).sort(sorter),
  );

  function saveDeviceName(id: string, name: string): void {
    const [serviceId, mac] = splitTiltId(id);
    eventbus.publish(`brewcast/tilt/${serviceId}/names`, {
      [mac]: name,
    });
    const existing = valueMap[id];
    if (existing) {
      existing.name = name;
    }
  }

  async function parseStateEvent(evt: TiltStateEvent): Promise<void> {
    const serviceStore = useServiceStore();

    const id = makeTiltId(evt.key, evt.mac);
    const tempUnit = userUnits.value.temperature;
    const temp = evt.data[`temperature[${tempUnit}]`];
    const sg = evt.data['specificGravity'];
    const rssi = evt.data['rssi[dBm]'];
    const plato = evt.data['plato[degP]'];
    const uncalTemp = evt.data[`uncalibratedTemperature[${tempUnit}]`] ?? null;
    const uncalSG = evt.data['uncalibratedSpecificGravity'] ?? null;
    const uncalPlato = evt.data['uncalibratedPlato[degP]'] ?? null;

    valueMap[id] = typed<TiltStateValue>({
      id,
      serviceId: evt.key,
      timestamp: new Date(evt.timestamp),
      color: evt.color,
      mac: evt.mac,
      name: evt.name,
      data: {
        temperature: bloxQty(temp, tempUnit),
        specificGravity: sg,
        rssi: bloxQty(rssi, 'dBm'),
        plato: bloxQty(plato, 'degP'),
        uncalibratedTemperature: bloxQty(uncalTemp, tempUnit),
        uncalibratedSpecificGravity: uncalSG,
        uncalibratedPlato: bloxQty(uncalPlato, 'degP'),
      },
    });

    serviceStore.updateStatus({
      color: 'green',
      desc: `Last update: ${shortDateString(evt.timestamp)}`,
      id: evt.key,
      icon: 'mdi-test-tube',
    });
  }

  return {
    values,
    saveDeviceName,
    parseStateEvent,
  };
});
