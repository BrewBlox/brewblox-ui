<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import { systemStore } from '@/store/system';
import { bloxQty, deltaTempQty, JSQuantity } from '@/utils';

import { QuickstartAction } from '../types';
import { createOutputActions } from '../utils';
import { defineChangedBlocks, defineCreatedBlocks, defineDisplayedBlocks, defineWidgets } from './changes';
import { defineLayouts } from './changes-layout';
import { BrewKettleConfig, BrewKettleOpts } from './types';

export default defineComponent({
  name: 'BrewKettleSettingsTask',
  props: {
    config: {
      type: Object as PropType<BrewKettleConfig>,
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
    const fullPowerDelta = ref<JSQuantity>(deltaTempQty(2));

    const userTemp = computed<string>(
      () => systemStore.units.temperature,
    );

    const kp = computed<JSQuantity>(
      () => bloxQty(100 / (fullPowerDelta.value.value || 2), `1/${userTemp.value}`),
    );

    function taskDone(): void {
      const opts: BrewKettleOpts = {
        kp: kp.value,
      };

      const createdBlocks = defineCreatedBlocks(props.config, opts);
      const changedBlocks = defineChangedBlocks(props.config);
      const layouts = defineLayouts(props.config);
      const widgets = defineWidgets(props.config, opts, layouts);
      const displayedBlocks = defineDisplayedBlocks(props.config);

      const updates: Partial<BrewKettleConfig> = {
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
      fullPowerDelta,
      kp,
      taskDone,
    };
  },
});
</script>

<template>
  <WizardBody>
    <q-card-section class="text-weight-light">
      <q-item>
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Brew kettle heating
          </q-item-label>
          <p>
            If the temperature is more than
            <InlineQuantityField v-model="fullPowerDelta" title="Full power delta" /> too low,
            run at full power (100%).
          </p>
          <p class="text-italic">
            Proportional gain Kp of the Kettle PID will be set to {{ kp }}.
          </p>
        </q-item-section>
      </q-item>
    </q-card-section>

    <template #actions>
      <q-btn unelevated label="Back" @click="$emit('back')" />
      <q-space />
      <q-btn unelevated label="Done" color="primary" @click="taskDone" />
    </template>
  </WizardBody>
</template>
