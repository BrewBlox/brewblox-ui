<script lang="ts">
import { Component } from 'vue-property-decorator';

import { bloxLink, Link } from '@/helpers/bloxfield';
import { mutate, objectSorter, objectStringSorter, typeMatchFilter } from '@/helpers/functional';
import { isBlockDriven } from '@/plugins/spark/helpers';
import { BlockType, DigitalActuatorBlock } from '@/plugins/spark/types';
import { Block, DigitalState, IoChannel, IoPin } from '@/plugins/spark/types';
import { createBlockWizard } from '@/plugins/wizardry';

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
export default class IoArray extends BlockCrudComponent<IoArrayBlock> {

  get claimedChannels(): { [channel: number]: string } {
    return this.sparkModule
      .blocks
      .filter(typeMatchFilter<DigitalActuatorBlock>(BlockType.DigitalActuator))
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
    return bloxLink(channel.driver?.id ?? null, BlockType.DigitalActuator);
  }

  driverDriven(block: Block): boolean {
    return isBlockDriven(block);
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
      newDriver.data.hwDevice = bloxLink(this.blockId, this.block.type);
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
    createBlockWizard(this.serviceId, BlockType.DigitalActuator)
      .onOk(({ block }) => {
        if (block && block.type === BlockType.DigitalActuator) {
          this.saveDriver(channel, bloxLink(block.id, block.type));
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
