<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import { bloxLink, Link } from '@/helpers/bloxfield';
import { createBlockWizardDialog } from '@/helpers/dialog';
import { mutate, objectStringSorter, typeMatchFilter } from '@/helpers/functional';
import { isBlockDriven } from '@/plugins/spark/helpers';
import { Block, BlockType, ChannelMapping, MotorValveBlock } from '@/plugins/spark/types';
import { DigitalState, IoChannel, IoPin } from '@/plugins/spark/types';

import BlockCrudComponent from '../BlockCrudComponent';

interface EditableChannel extends IoChannel {
  id: string;
  nid: number;
  name: string;
  driver: MotorValveBlock | null;
}

interface ValveArrayBlock extends Block {
  data: {
    pins: IoPin[];
  };
}

@Component
export default class ValveArray extends BlockCrudComponent {
  readonly block!: ValveArrayBlock;

  @Prop({ type: Array, default: () => [] })
  public readonly mapping!: ChannelMapping[];

  get claimedChannels(): { [nid: number]: MotorValveBlock } {
    return this.sparkModule
      .blocks
      .filter(typeMatchFilter<MotorValveBlock>(BlockType.MotorValve))
      .filter(block => block.data.hwDevice.id === this.block.id)
      .reduce((acc, block) => mutate(acc, block.data.startChannel, block), {});
  }

  mappedName(id: string): string | null {
    return this.mapping.length
      ? this.mapping.find(m => m.id === id)?.name ?? null
      : id;
  }

  get channels(): EditableChannel[] {
    return this.block.data.pins
      .reduce(
        (acc: EditableChannel[], pin: IoPin, idx: number) => {
          const nid = idx + 1;
          const [[id, channel]] = Object.entries(pin);
          const name = this.mappedName(id);
          if (name) {
            const driver = this.claimedChannels[nid] ?? null;
            acc.push({ ...channel, id, nid, name, driver });
          }
          return acc;
        },
        []
      )
      .sort(objectStringSorter('name'));
  }

  saveChannels(): void {
    this.block.data.pins = this.channels
      .map(channel => {
        const { state, config, id } = channel;
        return { [id]: { state, config } };
      });
    this.saveBlock();
  }

  driverLink(channel: EditableChannel): Link {
    return bloxLink(channel.driver?.id ?? null, BlockType.MotorValve);
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
    if (channel.driver && channel.driver.id === link.id) {
      return;
    }
    if (channel.driver) {
      channel.driver.data.startChannel = 0;
      await this.sparkModule.saveBlock(channel.driver);
    }
    if (link.id) {
      const newDriver = this.sparkModule.blockById<MotorValveBlock>(link.id)!;
      newDriver.data.hwDevice = bloxLink(this.blockId, this.block.type);
      newDriver.data.startChannel = channel.nid;
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
    createBlockWizardDialog(this.serviceId, BlockType.MotorValve)
      .onOk(block => {
        if (block.type === BlockType.MotorValve) {
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
      :key="`channel-${channel.id}`"
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
