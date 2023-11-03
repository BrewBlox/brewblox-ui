<script setup lang="ts">
import { PidConfig } from '../types';
import TempControlPidView from './TempControlPidView.vue';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'TempControlSyncView',
  components: {
    TempControlPidView,
  },
  props: {
    blockConfig: {
      type: Object as PropType<PidConfig>,
      required: true,
    },
    modeConfig: {
      type: Object as PropType<PidConfig>,
      required: true,
    },
  },
  emits: ['apply'],
  setup(props, { emit }) {
    function apply(leading: 'pid' | 'mode'): void {
      emit('apply', leading);
    }

    return {
      apply,
    };
  },
});
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
        @click="apply('mode')"
      />
      <q-btn
        flat
        icon="mdi-arrow-right"
        label="Store"
        stack
        @click="apply('pid')"
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
