<script lang="ts">

import { computed, defineComponent } from 'vue';

import { sparkStore } from '@/plugins/spark/store';
import { BlockIntfType } from '@/plugins/spark/types';
import { isCompatible } from '@/plugins/spark/utils';
import { prettyQty } from '@/utils/bloxfield';

export default defineComponent({
  name: 'QuickstartSensorField',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    serviceId: {
      type: String,
      required: true,
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {

    const local = computed<string>({
      get: () => props.modelValue,
      set: v => emit('update:modelValue', v),
    });

    const opts = computed<string[]>(
      () => sparkStore.serviceBlocks(props.serviceId)
        .filter(block => isCompatible(block.type, BlockIntfType.TempSensorInterface))
        .map(block => block.id),
    );

    const sensorTemp = computed<string>(
      () => {
        const block = sparkStore.blockById(props.serviceId, local.value);
        return prettyQty(block?.data.value);
      },
    );

    return {
      local,
      opts,
      sensorTemp,
    };
  },
});
</script>

<template>
  <q-select
    v-model="local"
    :options="opts"
    :hint="sensorTemp"
    :rules="[v => !!v || 'Sensor must be selected']"
  />
</template>
