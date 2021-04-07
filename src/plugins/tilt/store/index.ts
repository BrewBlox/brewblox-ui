import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import { bloxQty } from '@/helpers/bloxfield';
import { extendById } from '@/helpers/functional';
import store from '@/store';
import { systemStore } from '@/store/system';

import { TiltStateEvent, TiltStateValue } from '../types';

@Module({ generateMutationSetters: true })
export class TiltModule extends VuexModule {
  public values: TiltStateValue[] = [];

  @Mutation
  public setValue(value: TiltStateValue): void {
    this.values = extendById(this.values, value);
  }

  @Action
  public async parseStateEvent(evt: TiltStateEvent): Promise<void> {
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
  }
}

export const tiltStore = new TiltModule({ store, name: 'tilt' });
