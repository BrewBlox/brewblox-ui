<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { mutate, objectSorter, objectStringSorter } from '@/helpers/functional';
import { Link } from '@/helpers/units';
import { blockTypes, DigitalActuatorBlock } from '@/plugins/spark/block-types';
import { sparkStore } from '@/plugins/spark/store';
import { Block, DigitalState, IoChannel, IoPin } from '@/plugins/spark/types';

import BlockCrudComponent from '../BlockCrudComponent';

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

const actuatorType = blockTypes.DigitalActuator;

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
    return new Link(channel.driver?.id ?? null, actuatorType);
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
      await sparkStore.saveBlock(currentDriver);
    }
    if (link.id) {
      const newDriver: DigitalActuatorBlock = sparkStore.blockById(this.serviceId, link.id);
      newDriver.data.hwDevice = new Link(this.blockId, this.block.type);
      newDriver.data.channel = channel.id;
      await sparkStore.saveBlock(newDriver);
    }
  }

  async saveState(channel: EditableChannel, state: DigitalState): Promise<void> {
    if (channel.driver) {
      channel.driver.data.desiredState = state;
      await sparkStore.saveBlock(channel.driver);
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
  <div class="widget-body column">
    <div
      v-for="channel in channels"
      :key="channel.id"
      class="col row q-gutter-x-sm q-gutter-y-xs q-mt-none items-stretch justify-start"
    >
      <div class="col-auto q-pt-sm self-baseline text-h6 min-width-sm">
        {{ channel.name }}
      </div>
      <div class="col-auto row items-baseline min-width-sm">
        <DigitalStateButton
          v-if="channel.driver"
          :disable="driverDriven(channel.driver)"
          :value="channel.driver.data.desiredState"
          :pending="channel.driver.data.state !== channel.driver.data.desiredState"
          :pending-reason="driverLimitedBy(channel.driver)"
          class="col-auto self-center"
          @input="v => saveState(channel, v)"
        />
        <div v-else class="darkened text-italic q-pa-sm">
          Not set
        </div>
      </div>
      <LinkField
        :value="driverLink(channel)"
        :service-id="serviceId"
        title="Driver"
        label="Driver"
        dense
        class="col-grow"
        @input="link => saveDriver(channel, link)"
      />
    </div>
  </div>
</template>
