<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { mutate, objectSorter, objectStringSorter, typeMatchFilter } from '@/helpers/functional';
import { DigitalActuatorBlock } from '@/plugins/spark/types';
import { Block, DigitalState, IoChannel, IoPin } from '@/plugins/spark/types';
import { Link } from '@/plugins/spark/units';

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

@Component
export default class IoArray extends BlockCrudComponent {
  readonly block!: IoArrayBlock;

  get claimedChannels(): { [channel: number]: string } {
    return this.sparkModule
      .blocks
      .filter(typeMatchFilter<DigitalActuatorBlock>('DigitalActuator'))
      .filter(block => block.data.hwDevice.id === this.block.id)
      .reduce((acc, block) => mutate(acc, block.data.channel, block.id), {});
  }

  get channels(): EditableChannel[] {
    return this.block.data.pins
      .map((pin, idx) => {
        const id = idx + 1;
        const driverId = this.claimedChannels[id];
        const [name] = Object.keys(pin);
        const driver = this.sparkModule.blockById<DigitalActuatorBlock>(driverId);
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
    return new Link(channel.driver?.id ?? null, 'DigitalActuator');
  }

  driverDriven(block: Block): boolean {
    return this.sparkModule
      .drivenChains
      .some((chain: string[]) => chain[0] === block.id);
  }

  driverLimitedBy(block: Block): string {
    return this.sparkModule
      .limiters[block.id]
      ?.join(', ')
      ?? '';
  }

  async saveDriver(channel: EditableChannel, link: Link): Promise<void> {
    const currentDriver = channel.driver;
    if (currentDriver && currentDriver.id === link.id) {
      return;
    }
    if (currentDriver) {
      currentDriver.data.channel = 0;
      await this.sparkModule.saveBlock(currentDriver);
    }
    if (link.id) {
      const newDriver = this.sparkModule.blockById<DigitalActuatorBlock>(link.id)!;
      newDriver.data.hwDevice = new Link(this.blockId, this.block.type);
      newDriver.data.channel = channel.id;
      await this.sparkModule.saveBlock(newDriver);
    }
  }

  async saveState(channel: EditableChannel, state: DigitalState): Promise<void> {
    if (channel.driver) {
      channel.driver.data.desiredState = state;
      await this.sparkModule.saveBlock(channel.driver);
    }
  }

  createActuator(channel: EditableChannel): void {
    createDialog({
      component: 'BlockWizardDialog',
      parent: this,
      serviceId: this.serviceId,
      initialFeature: 'DigitalActuator',
    })
      .onOk((block: Block) => {
        if (block.type === 'DigitalActuator') {
          this.saveDriver(channel, new Link(block.id, 'DigitalActuator'));
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
