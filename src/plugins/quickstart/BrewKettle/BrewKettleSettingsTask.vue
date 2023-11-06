<script setup lang="ts">
import { UseTaskEmits, UseTaskProps } from '../composables';
import { BrewKettleConfig, BrewKettleOpts } from './types';
import { userUnits } from '@/user-settings';
import { bloxQty, deltaTempQty } from '@/utils/quantity';
import { Quantity } from 'brewblox-proto/ts';
import { computed, ref } from 'vue';

const props = defineProps<UseTaskProps<BrewKettleConfig>>();

const emit = defineEmits<UseTaskEmits<BrewKettleConfig>>();

const fullPowerDelta = ref<Quantity>(deltaTempQty(2));

const userTemp = computed<string>(() => userUnits.value.temperature);

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
</script>

<template>
  <QuickstartCard>
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
  </QuickstartCard>
</template>
