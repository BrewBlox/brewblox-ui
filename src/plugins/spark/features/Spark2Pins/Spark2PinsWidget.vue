<script lang="ts">
import { Component } from 'vue-property-decorator';

import { Link } from '@/helpers/units';
import { IoArrayLink } from '@/helpers/units/KnownLinks';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import sparkStore from '@/plugins/spark/store';
import { IoChannel } from '@/plugins/spark/types';

import { typeName as actuatorType } from '../DigitalActuator/getters';
import { DigitalActuatorBlock } from '../DigitalActuator/types';
import { Spark2PinId, Spark2PinsBlock } from './types';

interface EditableChannel extends IoChannel {
  id: Spark2PinId;
}

@Component
export default class Spark2PinsWidget extends BlockWidget {
  readonly block!: Spark2PinsBlock;

  get channels(): EditableChannel[] {
    return this.block.data.pins
      .map((pin, idx) => {
        const id = idx + 1;
        return { id, ...pin[Spark2PinId[id]] };
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
        return { [Spark2PinId[id]]: { state, config } };
      });
    this.saveBlock();
  }

  channelName(channel) {
    return Spark2PinId[channel.id];
  }

  driverLink(channel: EditableChannel): Link {
    return new Link(this.claimedChannels[channel.id] || null, actuatorType);
  }

  saveDriver(channel: EditableChannel, link: Link) {
    const currentDriver = this.driverLink(channel);
    if (currentDriver.id === link.id) {
      return;
    }
    if (currentDriver.id) {
      const block: DigitalActuatorBlock = sparkStore.blockById(this.serviceId, currentDriver.id);
      block.data.hwDevice = new IoArrayLink(null);
      block.data.channel = 0;
      sparkStore.saveBlock([this.serviceId, block]);
    }
    if (link.id) {
      const block: DigitalActuatorBlock = sparkStore.blockById(this.serviceId, link.id);
      block.data.hwDevice = new IoArrayLink(this.blockId);
      block.data.channel = channel.id;
      sparkStore.saveBlock([this.serviceId, block]);
    }
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :field="me">
      <template v-slot:actions>
        <CreateActuatorsAction :block="block"/>
      </template>
    </BlockWidgetToolbar>

    <q-card-section>
      <q-item v-for="channel in channels" :key="channel.id" dark>
        <q-item-section>{{ channelName(channel) }}</q-item-section>
        <q-item-section>
          <ActuatorField :value="channel.state" disable/>
        </q-item-section>
        <q-item-section>
          <LinkField
            :value="driverLink(channel)"
            :service-id="serviceId"
            title="Driver"
            @input="link => saveDriver(channel, link)"
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
