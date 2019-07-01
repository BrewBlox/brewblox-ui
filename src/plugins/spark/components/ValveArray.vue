<script lang="ts">
import get from 'lodash/get';
import { Dialog } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import { Link } from '@/helpers/units';
import sparkStore from '@/plugins/spark/store';
import { Block, DigitalState, IoChannel, IoPin } from '@/plugins/spark/types';

import { typeName as valveType } from '../features/MotorValve/getters';
import { MotorValveBlock } from '../features/MotorValve/types';
import BlockCrudComponent from './BlockCrudComponent';

interface EditableChannel extends IoChannel {
  id: number;
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

  @Prop({ type: Object, required: true })
  public readonly idEnum!: any;

  @Prop({ type: Object, required: true })
  public readonly nameEnum!: any;

  get claimedChannels() {
    return sparkStore.blockValues(this.serviceId)
      .filter(block => block.type === valveType && block.data.hwDevice.id === this.block.id)
      .reduce((acc, block: MotorValveBlock) => ({ ...acc, [block.data.startChannel]: block.id }), {});
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

  saveChannels() {
    this.block.data.pins = this.channels
      .map(channel => {
        const { id, state, config } = channel;
        return { [this.idEnum[id]]: { state, config } };
      });
    this.saveBlock();
  }

  channelName(channel) {
    return this.nameEnum[channel.id];
  }

  driverLink(channel: EditableChannel): Link {
    return new Link(get(channel, 'driver.id', null), valveType);
  }

  async saveDriver(channel: EditableChannel, link: Link) {
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

  async saveState(channel: EditableChannel, state: DigitalState) {
    if (channel.driver) {
      channel.driver.data.desiredState = state;
      await sparkStore.saveBlock([this.serviceId, channel.driver]);
    }
  }

  createActuator(channel: EditableChannel) {
    Dialog.create({
      component: 'BlockWizardDialog',
      root: this.$root,
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
    <q-item v-for="channel in channels" :key="channel.id" dark>
      <q-item-section>{{ channelName(channel) }}</q-item-section>
      <q-item-section>
        <DigitalStateField
          v-if="channel.driver"
          :value="channel.driver.data.desiredState"
          :actual-value="channel.driver.data.state"
          @input="v => saveState(channel, v)"
        />
        <div v-else>---</div>
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
        <BlockFormButton
          v-if="channel.driver"
          :block-id="channel.driver.id"
          :service-id="serviceId"
          flat
        >
          <q-tooltip>Configure valve</q-tooltip>
        </BlockFormButton>
        <q-btn v-else flat icon="add" @click="createActuator(channel)">
          <q-tooltip>Create new valve</q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-card-section>
</template>
