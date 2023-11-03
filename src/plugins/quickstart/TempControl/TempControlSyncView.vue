<script setup lang="ts">
import { PidConfig } from '../types';
import TempControlPidView from './TempControlPidView.vue';

interface Props {
  blockConfig: PidConfig;
  modeConfig: PidConfig;
}

defineProps<Props>();

defineEmits<{
  apply: [leading: 'pid' | 'mode'];
}>();
</script>

<template>
  <div class="row q-ma-md q-mt-lg q-gutter-sm q-pr-sm q-pb-sm">
    <q-icon
      name="warning"
      color="warning"
      size="lg"
      class="col-auto"
    />
    <div class="q-px-sm q-mb-none col">
      <slot name="message" />
    </div>

    <div class="col-break" />

    <LabeledField
      label="Active settings (block)"
      class="col-grow bordered"
    >
      <TempControlPidView
        :model-value="blockConfig"
        class="column"
      />
    </LabeledField>
    <div class="column col-auto justify-center">
      <q-btn
        flat
        icon="mdi-arrow-left"
        label="Apply"
        stack
        @click="$emit('apply', 'mode')"
      />
      <q-btn
        flat
        icon="mdi-arrow-right"
        label="Store"
        stack
        @click="$emit('apply', 'pid')"
      />
    </div>
    <LabeledField
      label="Stored settings (mode)"
      class="col-grow bordered"
    >
      <TempControlPidView
        :model-value="modeConfig"
        class="column"
      />
    </LabeledField>
  </div>
</template>
