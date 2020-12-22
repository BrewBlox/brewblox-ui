import Vue from 'vue';
import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import { DEVICE_TOPIC } from '@/helpers/const';
import { extendById, findById } from '@/helpers/functional';
import store from '@/store';

import {
  EventControlDevice,
  EventControlDeviceState,
} from '../types';

@Module({ generateMutationSetters: true })
export class EventControlModule extends VuexModule {
  public devices: EventControlDevice[] = [];
  public states: EventControlDeviceState[] = [];

  public get deviceIds(): string[] {
    return this.devices.map(v => v.id);
  }

  public deviceById(id: string | null): EventControlDevice | null {
    return findById(this.devices, id);
  }

  public stateById(id: string | null): EventControlDeviceState | null {
    return findById(this.states, id);
  }

  @Mutation
  public setDevice(device: EventControlDevice): void {
    this.devices = extendById(this.devices, device);
  }

  @Mutation
  public setState(state: EventControlDeviceState): void {
    this.states = extendById(this.states, state);
  }

  @Action
  public async changeState(state: EventControlDeviceState): Promise<void> {
    Vue.$eventbus.publish(`${DEVICE_TOPIC}/change/${state.id}`, state);
  }

  @Action
  public async start(): Promise<void> {
    Vue.$eventbus.subscribe(DEVICE_TOPIC + '/config/#');
    Vue.$eventbus.addListener(DEVICE_TOPIC + '/config/#',
      (_, evt: EventControlDevice) => {
        if (evt.id) {
          this.devices = extendById(this.devices, evt);
        }
      });

    Vue.$eventbus.subscribe(DEVICE_TOPIC + '/state/#');
    Vue.$eventbus.addListener(DEVICE_TOPIC + '/state/#',
      (_, evt: EventControlDeviceState) => {
        if (evt.id && evt.values) {
          this.states = extendById(this.states, evt);
        }
      });
  }
}


export const eventControlStore = new EventControlModule({ store, name: 'event-control' });
