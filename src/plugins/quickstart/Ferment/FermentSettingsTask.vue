<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import { JSQuantity, tempQty } from '@/utils';

import { QuickstartAction } from '../types';
import { createOutputActions } from '../utils';
import { defineChangedBlocks, defineCreatedBlocks, defineDisplayedBlocks, defineWidgets } from './changes';
import { defineLayouts } from './changes-layout';
import { FermentConfig, FermentMode, FermentOpts } from './types';

const targetOpts: SelectOption<FermentMode>[] = [
  {
    label: 'Beer',
    value: 'beer',
  },
  {
    label: 'Fridge',
    value: 'fridge',
  },
];

export default defineComponent({
  name: 'FermentSettingsTask',
  props: {
    config: {
      type: Object as PropType<FermentConfig>,
      required: true,
    },
    actions: {
      type: Array as PropType<QuickstartAction[]>,
      required: true,
    },
  },
  emits: [
    'update:config',
    'update:actions',
    'back',
    'next',
  ],
  setup(props, { emit }) {
    const fridgeSetting = ref<JSQuantity>(tempQty(20));
    const beerSetting = ref<JSQuantity>(tempQty(20));
    const activeSetpoint = ref<FermentMode>('beer');

    function done(): void {
      const opts: FermentOpts = {
        fridgeSetting: fridgeSetting.value,
        beerSetting: beerSetting.value,
        activeSetpoint: activeSetpoint.value,
      };

      const createdBlocks = defineCreatedBlocks(props.config, opts);
      const changedBlocks = defineChangedBlocks(props.config);
      const layouts = defineLayouts(props.config);
      const widgets = defineWidgets(props.config, opts, layouts);
      const displayedBlocks = defineDisplayedBlocks(props.config);

      const updates: Partial<FermentConfig> = {
        layouts,
        widgets,
        changedBlocks,
        createdBlocks,
        displayedBlocks,
      };

      emit('update:config', { ...props.config, ...updates });
      emit('update:actions', createOutputActions());
      emit('next');
    }

    return {
      targetOpts,
      fridgeSetting,
      beerSetting,
      activeSetpoint,
      done,
    };
  },
});
</script>

<template>
  <WizardBody>
    <q-card-section>
      <q-item class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Initial setpoints
          </q-item-label>
          <p>The setup creates 2 setpoints, one for your beer and one for your fridge.</p>
          <p>
            To change which temperature is actively controlled,
            you will change which setpoint is used as input by the PIDs.
            The quick actions on your dashboard will help you switch and reconfigure the PIDs.<br>
          </p>
          <p>You can set the initial values now.</p>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <QuantityField v-model="fridgeSetting" label="Fridge setpoint" title="Fridge setting" />
        </q-item-section>
        <q-item-section>
          <QuantityField v-model="beerSetting" label="Beer setpoint" title="Beer setting" />
        </q-item-section>
        <q-item-section class="col-auto">
          <LabeledField label="Active setpoint">
            <q-btn-toggle
              v-model="activeSetpoint"
              :options="targetOpts"
              unelevated
              dense
              class="col-auto"
            />
          </LabeledField>
        </q-item-section>
      </q-item>
    </q-card-section>

    <template #actions>
      <q-btn
        unelevated
        label="Back"
        @click="$emit('back')"
      />
      <q-space />
      <q-btn
        unelevated
        label="Done"
        color="primary"
        @click="done"
      />
    </template>
  </WizardBody>
</template>
