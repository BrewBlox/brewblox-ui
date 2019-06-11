<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockForm from '@/plugins/spark/components/BlockForm';
import sparkStore from '@/plugins/spark/store';

import { Block } from '../../types';
import { channel } from './getters';
import { DigitalActuatorBlock } from './types';

@Component
export default class DigitalActuatorForm extends BlockForm {
  readonly block!: DigitalActuatorBlock;

  get actuatorChannel() {
    return channel[this.block.data.channel];
  }

  get hwBlock(): Block | null {
    const blockId = this.block.data.hwDevice.id;
    return !!blockId
      ? sparkStore.blockById(this.serviceId, blockId)
      : null;
  }

  get channelOpts() {
    const opts = [{ label: 'Not set', value: 0 }];
    if (this.hwBlock) {
      opts.push(
        ...Object.keys(this.hwBlock.data.pins)
          .map((k, idx) => ({ label: k, value: idx + 1 })));
    }
    return opts;
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props"/>

    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="settings" label="Settings">
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Target Pin Array</q-item-label>
            <LinkField
              :value="block.data.hwDevice"
              :service-id="serviceId"
              title="Pin Array"
              @input="v => { block.data.hwDevice = v; block.data.channel = 0; saveBlock(); }"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Pin Channel</q-item-label>
            <SelectField
              :value="block.data.channel"
              :options="channelOpts"
              title="Pin Channel"
              @input="v => { block.data.channel = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section style="justify-content: flex-start">
            <q-item-label caption>State</q-item-label>
            <ActuatorField
              :value="block.data.state"
              :disable="isDriven"
              @input="v => { block.data.state = v; saveBlock(); }"
            />
            <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
          </q-item-section>
          <q-item-section style="justify-content: flex-start">
            <q-item-label caption>Invert</q-item-label>
            <q-toggle
              :value="block.data.invert"
              @input="v => { block.data.invert = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>
      <q-expansion-item group="modal" icon="mdi-less-than-or-equal" label="Constraints">
        <q-item dark>
          <q-item-section>
            <DigitalConstraints
              :value="block.data.constrainedBy"
              :service-id="serviceId"
              @input="v => { block.data.constrainedBy = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
