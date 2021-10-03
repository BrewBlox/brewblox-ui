import { defineStore } from 'pinia';

import { useSystemStore } from '@/store/system';
import { concatById } from '@/utils/collections';
import { bloxQty } from '@/utils/quantity';

import type { TiltStateEvent, TiltStateValue } from '../types';

interface TiltStoreState {
  values: TiltStateValue[];
}

export const useTiltStore = defineStore('tiltStore', {
  state: (): TiltStoreState => ({
    values: [],
  }),
  actions: {
    setValue(value: TiltStateValue): void {
      this.values = concatById(this.values, value);
    },

    async parseStateEvent(evt: TiltStateEvent): Promise<void> {
      const systemStore = useSystemStore();
      const tempUnit = systemStore.units.temperature;
      const temp = evt.data[`Temperature[${tempUnit}]`];
      const sg = evt.data['Specific gravity'];
      const signalStrength = evt.data['Signal strength[dBm]'];
      const plato = evt.data['Plato[degP]'];
      const calTemp = evt.data[`Calibrated temperature[${tempUnit}]`] ?? null;
      const calSg = evt.data['Calibrated specific gravity'] ?? null;
      const calPlato = evt.data['Calibrated plato[degP]'] ?? null;

      this.setValue({
        id: `${evt.key}__${evt.colour}`,
        serviceId: evt.key,
        color: evt.colour,
        timestamp: new Date(evt.timestamp),
        data: {
          temperature: bloxQty(temp, tempUnit),
          specificGravity: sg,
          signalStrength: bloxQty(signalStrength, 'dBm'),
          plato: bloxQty(plato, 'degP'),
          calibratedTemperature: bloxQty(calTemp, tempUnit),
          calibratedSpecificGravity: calSg,
          calibratedPlato: bloxQty(calPlato, 'degP'),
        },
      });
    },
  },
});
