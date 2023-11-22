import { defineStore } from 'pinia';
import { ref } from 'vue';
import { eventbus } from '@/eventbus';
import { useServiceStore } from '@/store/services';
import { userUnits } from '@/user-settings';
import { concatById, findById } from '@/utils/collections';
import { bloxQty, shortDateString } from '@/utils/quantity';
import type { TiltStateEvent, TiltStateValue } from '../types';
import { makeTiltId, splitTiltId } from '../utils';

export const useTiltStore = defineStore('tiltStore', () => {
  const values = ref<TiltStateValue[]>([]);

  function setValue(value: TiltStateValue): void {
    values.value = concatById(values.value, value);
  }

  function saveDeviceName(id: string, name: string): void {
    const [serviceId, mac] = splitTiltId(id);
    eventbus.publish(`brewcast/tilt/${serviceId}/names`, {
      [mac]: name,
    });
    const state = findById(values.value, id);
    if (state) {
      setValue({ ...state, name });
    }
  }

  async function parseStateEvent(evt: TiltStateEvent): Promise<void> {
    const serviceStore = useServiceStore();

    const tempUnit = userUnits.value.temperature;
    const temp = evt.data[`temperature[${tempUnit}]`];
    const sg = evt.data['specificGravity'];
    const rssi = evt.data['rssi[dBm]'];
    const plato = evt.data['plato[degP]'];
    const uncalTemp = evt.data[`uncalibratedTemperature[${tempUnit}]`] ?? null;
    const uncalSG = evt.data['uncalibratedSpecificGravity'] ?? null;
    const uncalPlato = evt.data['uncalibratedPlato[degP]'] ?? null;

    setValue({
      id: makeTiltId(evt.key, evt.mac),
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
