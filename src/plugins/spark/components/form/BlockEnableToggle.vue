<script setup lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { EnablerInterfaceBlock } from 'brewblox-proto/ts';
import { computed } from 'vue';

interface Props {
  hideEnabled?: boolean;
  emitToggle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hideEnabled: false,
  emitToggle: false,
});

const emit = defineEmits<{
  change: [enabled: boolean];
}>();

const { block, patchBlock } = useBlockWidget.setup<EnablerInterfaceBlock>();

const enabled = computed<boolean>(() => block.value.data.enabled);

function toggleEnabled(): void {
  const newV = !block.value.data.enabled;
  if (props.emitToggle) {
    emit('change', newV);
  } else {
    patchBlock({ enabled: newV });
  }
}
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
