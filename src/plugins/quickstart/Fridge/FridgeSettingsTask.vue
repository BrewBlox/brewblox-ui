<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import { JSQuantity, tempQty } from '@/utils/bloxfield';

import { QuickstartAction } from '../types';
import { createOutputActions } from '../utils';
import { defineChangedBlocks, defineCreatedBlocks, defineDisplayedBlocks, defineWidgets } from './changes';
import { defineLayouts } from './changes-layout';
import { FridgeConfig, FridgeOpts } from './types';

export default defineComponent({
  name: 'FridgeSettingsTask',
  props: {
    config: {
      type: Object as PropType<FridgeConfig>,
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

    function done(): void {
      const opts: FridgeOpts = {
        fridgeSetting: fridgeSetting.value,
      };

      const createdBlocks = defineCreatedBlocks(props.config, opts);
      const changedBlocks = defineChangedBlocks(props.config);
      const layouts = defineLayouts(props.config);
      const widgets = defineWidgets(props.config, opts, layouts);
      const displayedBlocks = defineDisplayedBlocks(props.config);

      const updates: Partial<FridgeConfig> = {
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
      fridgeSetting,
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
            Initial setpoint value
          </q-item-label>
          <p>
            The setup creates a Setpoint for your fridge.<br>
            You can set the initial values now.
          </p>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <QuantityField
            v-model="fridgeSetting"
            label="Fridge setpoint"
            title="Fridge setting"
          />
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
