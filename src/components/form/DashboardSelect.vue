<script setup lang="ts">
import { useDashboardStore } from '@/store/dashboards';
import { computed, onBeforeMount, PropType } from 'vue';

const props = defineProps({
  modelValue: {
    type: null as unknown as PropType<string | null>,
    default: () => null,
  },
  defaultValue: {
    type: null as unknown as PropType<string | null>,
    default: () => null,
  },
  label: {
    type: String,
    default: 'Dashboard',
  },
});

const emit = defineEmits<{
  (e: 'update:modelValue', data: string | null): void;
}>();

const dashboardStore = useDashboardStore();
const local = computed<string | null>({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const options = computed<SelectOption[]>(() =>
  dashboardStore.dashboards.map((dash) => ({
    label: dash.title,
    value: dash.id,
  })),
);

onBeforeMount(() => {
  if (!props.modelValue && props.defaultValue) {
    local.value = props.defaultValue;
  }
});
</script>

<template>
  <q-select
    v-model="local"
    v-bind="{ label, options, ...$attrs }"
    map-options
    emit-value
    @keyup.enter.exact.stop
  />
</template>
