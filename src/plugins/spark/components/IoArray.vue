<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { mutate,objectSorter, objectStringSorter } from '@/helpers/functional';
import { Link } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';
import { Block, DigitalState, IoChannel, IoPin } from '@/plugins/spark/types';

import { typeName as actuatorType } from '../features/DigitalActuator/getters';
import { DigitalActuatorBlock } from '../features/DigitalActuator/types';
import BlockCrudComponent from './BlockCrudComponent';

interface EditableChannel extends IoChannel {
  id: number;
  name: string;
  driver: DigitalActuatorBlock | null;
}

interface IoArrayBlock extends Block {
  data: {
    pins: IoPin[];
  };
}

@Component
export default class IoArray extends BlockCrudComponent {
  readonly block!: IoArrayBlock;

  get claimedChannels(): { [channel: number]: string } {
    return sparkStore.blockValues(this.serviceId)
      .filter(block => block.type === actuatorType && block.data.hwDevice.id === this.block.id)
      .reduce((acc, block) => mutate(acc, block.data.channel, block.id), {});
  }

  get channels(): EditableChannel[] {
    return this.block.data.pins
      .map((pin, idx) => {
        const id = idx + 1;
        const driverId = this.claimedChannels[id];
        const [name] = Object.keys(pin);
        const driver = !!driverId
          ? sparkStore.blockById(this.serviceId, driverId)
          : null;
        return { ...pin[name], id, driver, name };
      })
      .sort(objectStringSorter('name'));
  }

  saveChannels(): void {
    this.block.data.pins = this.channels
      .sort(objectSorter('id'))
      .map(channel => {
        const { state, config, name } = channel;
        return { [name]: { state, config } };
      });
    this.saveBlock();
  }

  driverLink(channel: EditableChannel): Link {
    return new Link(get(channel, 'driver.id', null), actuatorType);
  }

  driverDriven(block: Block): boolean {
    return sparkStore.drivenChains(this.serviceId)
      .some((chain: string[]) => chain[0] === block.id);
  }

  driverLimitedBy(block: Block): string {
    const limiting: string[] = sparkStore.limiters(this.serviceId)[block.id];
    return limiting ? limiting.join(', ') : '';
  }

  async saveDriver(channel: EditableChannel, link: Link): Promise<void> {
    const currentDriver = channel.driver;
    if (currentDriver && currentDriver.id === link.id) {
      return;
    }
    if (currentDriver) {
      currentDriver.data.channel = 0;
      await sparkStore.saveBlock([this.serviceId, currentDriver]);
    }
    if (link.id) {
      const newDriver: DigitalActuatorBlock = sparkStore.blockById(this.serviceId, link.id);
      newDriver.data.hwDevice.id = this.blockId;
      newDriver.data.channel = channel.id;
      await sparkStore.saveBlock([this.serviceId, newDriver]);
    }
  }

  async saveState(channel: EditableChannel, state: DigitalState): Promise<void> {
    if (channel.driver) {
      channel.driver.data.desiredState = state;
      await sparkStore.saveBlock([this.serviceId, channel.driver]);
    }
  }

  createActuator(channel: EditableChannel): void {
    createDialog({
      component: 'BlockWizardDialog',
      parent: this,
      serviceId: this.serviceId,
      initialFeature: actuatorType,
    })
      .onOk(block => {
        if (block.type === actuatorType) {
          this.saveDriver(channel, new Link(block.id, actuatorType));
        }
      });
  }
}
</script>

<template>
  <q-card-section>
    <q-item v-for="channel in channels" :key="channel.id" dark>
      <q-item-section>{{ channel.name }}</q-item-section>
      <q-item-section>
        <DigitalStateField
          v-if="channel.driver"
          :disable="driverDriven(channel.driver)"
          :value="channel.driver.data.desiredState"
          :pending="channel.driver.data.state !== channel.driver.data.desiredState"
          :pending-reason="driverLimitedBy(channel.driver)"
          @input="v => saveState(channel, v)"
        />
        <div v-else>
          ---
        </div>
      </q-item-section>
      <q-item-section>
        <LinkField
          :value="driverLink(channel)"
          :service-id="serviceId"
          title="Driver"
          @input="link => saveDriver(channel, link)"
        />
      </q-item-section>
      <q-item-section side>
        <BlockDialogButton
          v-if="channel.driver"
          :block-id="channel.driver.id"
          :service-id="serviceId"
          flat
        >
          <q-tooltip>Configure Digital Actuator</q-tooltip>
        </BlockDialogButton>
        <q-btn v-else flat icon="add" @click="createActuator(channel)">
          <q-tooltip>Create new Digital Actuator</q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-card-section>
</template>
