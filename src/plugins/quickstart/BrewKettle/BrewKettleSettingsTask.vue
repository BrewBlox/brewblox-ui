<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import { Quantity } from '@/shared-types';
import { useSystemStore } from '@/store/system';
import { bloxQty, deltaTempQty } from '@/utils/quantity';

import { QuickstartAction } from '../types';
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
  emits: ['update:config', 'back', 'next'],
  setup(props, { emit }) {
    const systemStore = useSystemStore();
    const fullPowerDelta = ref<Quantity>(deltaTempQty(2));

    const userTemp = computed<string>(() => systemStore.units.temperature);

    const kp = computed<Quantity>(() =>
      bloxQty(100 / (fullPowerDelta.value.value || 2), `1/${userTemp.value}`),
    );

    function taskDone(): void {
      const kettleOpts: BrewKettleOpts = {
        kp: kp.value,
      };

      emit('update:config', { ...props.config, kettleOpts });
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
            <InlineQuantityField
              v-model="fullPowerDelta"
              title="Full power delta"
            />
            too low, run at full power (100%).
          </p>
          <p class="text-italic">
            Proportional gain Kp of the Kettle PID will be set to {{ kp }}.
          </p>
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
        @click="taskDone"
      />
    </template>
  </WizardBody>
</template>
