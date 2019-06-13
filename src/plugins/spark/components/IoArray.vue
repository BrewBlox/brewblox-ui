<script lang="ts">
import { Dialog } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import { Link } from '@/helpers/units';
import { IoArrayLink } from '@/helpers/units/KnownLinks';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import sparkStore from '@/plugins/spark/store';
import { Block, DigitalState, IoChannel, IoPin } from '@/plugins/spark/types';

import { typeName as actuatorType } from '../features/DigitalActuator/getters';
import { DigitalActuatorBlock } from '../features/DigitalActuator/types';

interface EditableChannel extends IoChannel {
  id: number;
}

interface IoArrayBlock extends Block {
  data: {
    pins: IoPin[];
  };
}

@Component
export default class IoArray extends BlockWidget {
  readonly block!: IoArrayBlock;

  @Prop({ type: Object, required: true })
  public readonly idEnum!: any;

  get channels(): EditableChannel[] {
    return this.block.data.pins
      .map((pin, idx) => {
        const id = idx + 1;
        return { id, ...pin[this.idEnum[id]] };
      });
  }

  get claimedChannels() {
    return sparkStore.blockValues(this.serviceId)
      .filter(block => block.type === actuatorType && block.data.hwDevice.id === this.block.id)
      .reduce((acc, block) => ({ ...acc, [block.data.channel]: block.id }), {});
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
    return this.idEnum[channel.id];
  }

  driverLink(channel: EditableChannel): Link {
    return new Link(this.claimedChannels[channel.id] || null, actuatorType);
  }

  async saveDriver(channel: EditableChannel, link: Link) {
    const currentDriver = this.driverLink(channel);
    if (currentDriver.id === link.id) {
      return;
    }
    if (currentDriver.id) {
      const block: DigitalActuatorBlock = sparkStore.blockById(this.serviceId, currentDriver.id);
      block.data.channel = 0;
      await sparkStore.saveBlock([this.serviceId, block]);
    }
    if (link.id) {
      const block: DigitalActuatorBlock = sparkStore.blockById(this.serviceId, link.id);
      block.data.hwDevice = new IoArrayLink(this.blockId);
      block.data.channel = channel.id;
      await sparkStore.saveBlock([this.serviceId, block]);
    }
  }

  async saveState(channel: EditableChannel, state: DigitalState) {
    const link = this.driverLink(channel);
    if (link.id) {
      const block: DigitalActuatorBlock = sparkStore.blockById(this.serviceId, link.id);
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
      <q-item-section>{{ channelName(channel) }}</q-item-section>
      <q-item-section>
        <ActuatorField
          v-if="claimedChannels[channel.id]"
          :value="channel.state"
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
          <q-tooltip>Configure Digital Actuator</q-tooltip>
        </BlockFormButton>
        <q-btn v-else flat icon="add" @click="createActuator(channel)">
          <q-tooltip>Create new Digital Actuator</q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-card-section>
</template>
