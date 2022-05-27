<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';

export default defineComponent({
  name: 'BlockEnableToggle',
  props: {
    dataKey: {
      type: String,
      default: 'enabled',
    },
    hideEnabled: {
      type: Boolean,
      default: false,
    },
    emitToggle: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const { block, saveBlock } = useBlockWidget.setup();

    const enabled = computed<boolean>(() =>
      Boolean(block.value?.data[props.dataKey]),
    );

    function toggleEnabled(): void {
      if (props.emitToggle) {
        emit('change', !enabled.value);
      } else {
        block.value.data[props.dataKey] = !enabled.value;
        saveBlock();
      }
    }

    return {
      enabled,
      toggleEnabled,
    };
  },
});
</script>

<template>
  <div
    v-if="!(enabled && hideEnabled)"
    class="row no-wrap items-center q-gutter-x-md q-mx-md q-mt-sm q-py-sm clickable rounded-borders"
    style="max-width: 100%"
    @click="toggleEnabled"
  >
    <q-icon
      :name="enabled ? 'mdi-link' : 'mdi-link-variant-off'"
      :color="enabled ? 'positive' : 'negative'"
      size="md"
      class="col-auto"
    />
    <div class="col">
      <small class="col fade-5">Click to toggle</small>
      <div
        v-show="enabled"
        class="col"
      >
        <slot name="enabled"> This block is enabled. </slot>
      </div>
      <div
        v-show="!enabled"
        class="col"
      >
        <slot name="disabled"> This block is disabled. </slot>
      </div>
    </div>
  </div>
</template>
