<script setup lang="ts">
import { useSparkStore } from '@/plugins/spark/store';
import { isCompatible } from '@/plugins/spark/utils/info';
import { prettyQty } from '@/utils/quantity';
import { Block, BlockIntfType } from 'brewblox-proto/ts';
import { computed } from 'vue';

interface Props {
  modelValue: string | null;
  serviceId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [data: string];
}>();

const sensorFilter = (block: Block): boolean =>
  isCompatible(block.type, BlockIntfType.TempSensorInterface);

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
</script>

<template>
  <q-select
    v-model="local"
    :options="opts"
    :hint="sensorTemp"
    :rules="[(v) => !!v || 'Sensor must be selected']"
  />
</template>
