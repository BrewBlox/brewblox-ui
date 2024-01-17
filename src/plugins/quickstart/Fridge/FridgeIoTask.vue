<script setup lang="ts">
import { reactive } from 'vue';
import { UseTaskEmits, UseTaskProps } from '../composables';
import { GpioChange } from '../types';
import { FridgeConfig } from './types';

const props = defineProps<UseTaskProps<FridgeConfig>>();

const emit = defineEmits<UseTaskEmits<FridgeConfig>>();

const changedGpio = reactive<GpioChange[]>(props.config.changedGpio);

function taskDone(): void {
  emit('update:config', { ...props.config, changedGpio });
  emit('next');
}
</script>

<template>
  <QuickstartCard>
    <q-card-section>
      <q-item class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1"> Output channels </q-item-label>
        </q-item-section>
      </q-item>
      <q-item class="text-weight-light">
        <q-item-section>
          <p>
            These are your selected output channels. If you are using Spark 4
            GPIO channels, you can edit them here.
          </p>
          <LabeledField label="Cooler output">
            <i>{{ config.coolChannel.blockId }}</i>
            {{ config.coolChannel.name }}
          </LabeledField>
          <LabeledField label="Heater output">
            <i>{{ config.heatChannel.blockId }}</i>
            {{ config.heatChannel.name }}
          </LabeledField>
        </q-item-section>
      </q-item>
    </q-card-section>
    <q-card-section
      v-for="change in changedGpio"
      :key="`gpio-${change.blockId}`"
    >
      <div class="text-subtitle1">
        Position {{ change.modulePosition }}: GPIO Module {{ change.blockId }}
      </div>
      <OneWireGpioEditor v-model:channels="change.channels" />
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
        label="Next"
        color="primary"
        @click="taskDone"
      />
    </template>
  </QuickstartCard>
</template>
