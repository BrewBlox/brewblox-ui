<script lang="ts">
import get from 'lodash/get';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { mutate } from '@/helpers/functional';
import { Link } from '@/helpers/units';
import { blockTypes, MotorValveBlock } from '@/plugins/spark/block-types';
import { sparkStore } from '@/plugins/spark/store';
import { Block, DigitalState, IoChannel, IoPin } from '@/plugins/spark/types';

import BlockCrudComponent from '../BlockCrudComponent';

interface EditableChannel extends IoChannel {
  id: number;
  driver: MotorValveBlock | null;
}

interface ValveArrayBlock extends Block {
  data: {
    pins: IoPin[];
  };
}

const valveType = blockTypes.MotorValve;

@Component
export default class ValveArray extends BlockCrudComponent {
  readonly block!: ValveArrayBlock;

  @Prop({ type: Object, required: true })
  public readonly idEnum!: any;

  @Prop({ type: Object, required: true })
  public readonly nameEnum!: any;

  get claimedChannels(): { [channel: number]: string } {
    return sparkStore.blockValues(this.serviceId)
      .filter(block => block.type === valveType && block.data.hwDevice.id === this.block.id)
      .reduce((acc, block: MotorValveBlock) => mutate(acc, block.data.startChannel, block.id), {});
  }

  get channels(): EditableChannel[] {
    return this.block.data.pins
      .reduce(
        (acc: EditableChannel[], pin: IoPin, idx: number) => {
          const id = idx + 1;
          if (!this.nameEnum || this.nameEnum[id] !== undefined) {
            const driverId = this.claimedChannels[id];
            const driver = !!driverId
              ? sparkStore.blockById(this.serviceId, driverId)
              : null;
            acc.push({ ...pin[this.idEnum[id]], id, driver });
          }
          return acc;
        },
        []
      )
      .reverse();
  }

  saveChannels(): void {
    this.block.data.pins = this.channels
      .map(channel => {
        const { id, state, config } = channel;
        return { [this.idEnum[id]]: { state, config } };
      });
    this.saveBlock();
  }

  channelName(channel): string {
    return this.nameEnum[channel.id];
  }

  driverLink(channel: EditableChannel): Link {
    return new Link(get(channel, 'driver.id', null), valveType);
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
    if (channel.driver && channel.driver.id === link.id) {
      return;
    }
    if (channel.driver) {
      channel.driver.data.startChannel = 0;
      await sparkStore.saveBlock([this.serviceId, channel.driver]);
    }
    if (link.id) {
      const newDriver: MotorValveBlock = sparkStore.blockById(this.serviceId, link.id);
      newDriver.data.hwDevice.id = this.blockId;
      newDriver.data.startChannel = channel.id;
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
      initialFeature: valveType,
    })
      .onOk(block => {
        if (block.type === valveType) {
          this.saveDriver(channel, new Link(block.id, valveType));
        }
      });
  }
}
</script>

<template>
  <q-card-section>
    <q-item v-for="channel in channels" :key="channel.id">
      <q-item-section>{{ channelName(channel) }}</q-item-section>
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
        <BlockField
          :value="driverLink(channel)"
          :service-id="serviceId"
          title="Driver"
          label="Driver"
          no-show
          dense
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
          <q-tooltip>Configure valve</q-tooltip>
        </BlockDialogButton>
        <q-btn v-else flat icon="add" @click="createActuator(channel)">
          <q-tooltip>Create new valve</q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-card-section>
</template>
