<script lang="ts">
import { useDashboardStore } from '@/store/dashboards';
import { computed, defineComponent, onBeforeMount } from 'vue';

export default defineComponent({
  name: 'DashboardSelect',
  props: {
    modelValue: {
      type: String,
      default: null,
    },
    defaultValue: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: 'Dashboard',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
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

    return {
      local,
      options,
    };
  },
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
