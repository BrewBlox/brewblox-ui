<script setup lang="ts">
import { computed, onBeforeMount } from 'vue';
import { useDashboardStore } from '@/store/dashboards';

interface Props {
  modelValue: string | null;
  defaultValue?: string | null;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  defaultValue: null,
  label: 'Dashboard',
});

const emit = defineEmits<{
  'update:modelValue': [payload: string | null];
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
