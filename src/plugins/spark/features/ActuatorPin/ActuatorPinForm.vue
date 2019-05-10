<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';
import { ActuatorPinBlock } from './types';

@Component
export default class ActuatorPinForm extends BlockForm {
  get block(): ActuatorPinBlock {
    return this.blockField as ActuatorPinBlock;
  }

  defaultData() {
    return {
      state: 2,
      invert: false,
      constrainedBy: { constraints: [], unconstrained: 0 },
    };
  }

  presets() {
    return [
      {
        label: 'Fridge compressor',
        value: {
          state: 0,
          invert: false,
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
            <q-item-label caption>Inverted</q-item-label>
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
