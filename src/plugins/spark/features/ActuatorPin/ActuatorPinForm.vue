<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';
import { ActuatorPinBlock } from './state';

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
    <BlockWidgetSettings v-if="!$props.embedded" v-bind="$props" :block="block"/>

    <q-card-section>
      <q-expansion-item class="text-h6" opened group="modal" icon="settings" label="Settings">
        <q-item dark>
          <q-item-section>
            <div class="column">
              <span>State</span>
              <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
            </div>
          </q-item-section>
          <q-item-section>
            <ActuatorState
              :disable="isDriven"
              :field="block.data.state"
              :change="callAndSaveBlock(v => block.data.state = v)"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section side>Inverted</q-item-section>
          <q-item-section>
            <q-toggle
              :value="block.data.invert"
              @input="v => { block.data.invert = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item
        class="text-h6"
        group="modal"
        icon="mdi-less-than-or-equal"
        label="Constraints"
      >
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

      <q-expansion-item class="text-h6" group="modal" icon="mdi-cube" label="Block Settings">
        <BlockSettings v-bind="$props" :presets-data="presets()"/>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
