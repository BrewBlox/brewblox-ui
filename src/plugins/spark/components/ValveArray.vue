<script lang="ts">
import { Dialog } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import { Link } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import sparkStore from '@/plugins/spark/store';
import { Block, DigitalState, IoChannel, IoPin } from '@/plugins/spark/types';

import { typeName as valveType } from '../features/MotorValve/getters';
import { MotorValveBlock } from '../features/MotorValve/types';

interface EditableChannel extends IoChannel {
  id: number;
}

interface ValveArrayBlock extends Block {
  data: {
    pins: IoPin[];
  };
}

@Component
export default class ValveArray extends BlockWidget {
  readonly block!: ValveArrayBlock;

  @Prop({ type: Object, required: true })
  public readonly idEnum!: any;

  @Prop({ type: Object, required: true })
  public readonly nameEnum!: string;

  get channels(): EditableChannel[] {
    return this.block.data.pins
      .reduce(
        (acc: EditableChannel[], pin: IoPin, idx: number) => {
          const id = idx + 1;
          if (!this.nameEnum || this.nameEnum[id] !== undefined) {
            acc.push({ id, ...pin[this.idEnum[id]] });
          }
          return acc;
        },
        []
      );
  }

  get claimedChannels() {
    return sparkStore.blockValues(this.serviceId)
      .filter(block => block.type === valveType && block.data.hwDevice.id === this.block.id)
      .reduce((acc, block: MotorValveBlock) => ({ ...acc, [block.data.startChannel]: block.id }), {});
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
    return new Link(this.claimedChannels[channel.id] || null, valveType);
  }

  driverBlock(channel: EditableChannel): MotorValveBlock | null {
    const link = this.driverLink(channel);
    return link.id
      ? sparkStore.blockById(this.serviceId, link.id)
      : null;
  }

  async saveDriver(channel: EditableChannel, link: Link) {
    const currentDriver = this.driverLink(channel);
    if (currentDriver.id === link.id) {
      return;
    }
    if (currentDriver.id) {
      const block: MotorValveBlock = sparkStore.blockById(this.serviceId, currentDriver.id);
      block.data.startChannel = 0;
      await sparkStore.saveBlock([this.serviceId, block]);
    }
    if (link.id) {
      const block: MotorValveBlock = sparkStore.blockById(this.serviceId, link.id);
      block.data.hwDevice.id = this.blockId;
      block.data.startChannel = channel.id;
      await sparkStore.saveBlock([this.serviceId, block]);
    }
  }

  async saveState(channel: EditableChannel, state: DigitalState) {
    const block = this.driverBlock(channel);
    if (block) {
      block.data.state = state;
      channel.state = state;
      await sparkStore.saveBlock([this.serviceId, block]);
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
        <ActuatorField
          v-if="claimedChannels[channel.id]"
          :value="driverBlock(channel).data.state"
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
          v-if="driverLink(channel).id"
          :block-id="driverLink(channel).id"
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
