<script setup lang="ts">
import { useSparkStore } from '@/plugins/spark/store';
import { isCompatible } from '@/plugins/spark/utils/info';
import { prettyQty } from '@/utils/quantity';
import { Block, BlockIntfType } from 'brewblox-proto/ts';
import { computed, defineComponent, PropType } from 'vue';

const sensorFilter = (block: Block): boolean =>
  isCompatible(block.type, BlockIntfType.TempSensorInterface);

export default defineComponent({
  name: 'QuickstartSensorField',
  props: {
    modelValue: {
      type: null as unknown as PropType<string | null>,
      default: () => null,
    },
    serviceId: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const sparkStore = useSparkStore();

    const local = computed<string>({
      get: () => props.modelValue ?? '',
      set: (v) => emit('update:modelValue', v),
    });

    const opts = computed<string[]>(() =>
      sparkStore
        .blocksByService(props.serviceId)
        .filter(sensorFilter)
        .map((block) => block.id),
    );

    const sensorTemp = computed<string>(() => {
      const block = sparkStore.blockById(props.serviceId, local.value);
      return prettyQty(block?.data.value);
    });

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
    :rules="[(v) => !!v || 'Sensor must be selected']"
  />
</template>
