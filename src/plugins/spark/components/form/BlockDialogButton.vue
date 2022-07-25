<script lang="ts">
import { useSparkStore } from '@/plugins/spark/store';
import { createBlockDialog } from '@/utils/block-dialog';
import { Block } from 'brewblox-proto/ts';
import isString from 'lodash/isString';
import { computed, defineComponent } from 'vue';

function validateBlockId(v: unknown): boolean {
  return v === null || isString(v);
}

export default defineComponent({
  name: 'BlockDialogButton',
  props: {
    blockId: {
      type: String,
      default: null,
      validator: validateBlockId,
    },
    serviceId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const sparkStore = useSparkStore();

    const block = computed<Block | null>(() =>
      sparkStore.blockById(props.serviceId, props.blockId),
    );

    return {
      block,
      createBlockDialog,
    };
  },
});
</script>

<template>
  <q-btn
    :disable="!block"
    :icon="block ? 'mdi-pencil' : 'mdi-pencil-off'"
    @click="createBlockDialog(block)"
  >
    <slot />
  </q-btn>
</template>
