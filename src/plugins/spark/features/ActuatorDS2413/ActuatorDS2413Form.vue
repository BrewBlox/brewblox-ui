<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';
import { DS2413Link } from '@/helpers/units/KnownLinks';
import { ActuatorDS2413Block } from '@/plugins/spark/features/ActuatorDS2413/types';
import { channel } from './getters';

@Component
export default class ActuatorDS2413Form extends BlockForm {
  get block(): ActuatorDS2413Block {
    return this.blockField as ActuatorDS2413Block;
  }

  get actuatorChannel() {
    return channel[this.block.data.channel];
  }

  get channelOpts() {
    return channel
      .map((v, idx) => ({ label: v, value: idx }));
  }

  defaultData() {
    return {
      hwDevice: new DS2413Link(null),
      channel: 0,
      state: 0,
      constrainedBy: { constraints: [] },
    };
  }

  presets() {
    return [
      {
        label: 'Fridge compressor',
        value: {
          hwDevice: new DS2413Link(null),
          channel: 0,
          state: 0,
          constrainedBy: {
            constraints: [
              { 'minOff[second]': 300 },
              { 'minOn[second]': 180 },
            ],
          },
        },
      },
    ];
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar v-if="!$props.embedded" v-bind="$props" :block="block"/>
    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="settings" label="Settings">
        <q-item dark>
          <q-item-section>
            <q-item-label caption>DS2413 target Block</q-item-label>
            <LinkPopupEdit
              :field="block.data.hwDevice"
              :service-id="serviceId"
              :change="callAndSaveBlock(v => block.data.hwDevice = v)"
              label="DS2413 Block"
              tag="span"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>DS2413 Channel</q-item-label>
            <SelectPopupEdit
              :field="block.data.channel"
              :options="channelOpts"
              :change="callAndSaveBlock(v => block.data.channel = v)"
              label="DS2413 Channel"
              tag="span"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section style="justify-content: flex-start">
            <q-item-label caption>State</q-item-label>
            <ActuatorState
              :disable="isDriven"
              :field="block.data.state"
              :change="callAndSaveBlock(v => block.data.state = v)"
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
              :service-id="block.serviceId"
              :field="block.data.constrainedBy"
              :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>
      <q-expansion-item group="modal" icon="mdi-cube" label="Block Settings">
        <BlockSettings v-bind="$props" :presets-data="presets()"/>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
