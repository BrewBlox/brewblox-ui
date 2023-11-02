<script lang="ts">
import { useSparkStore } from '../../store';
import { BlockAddress } from '../../types';
import { useDialog } from '@/composables';
import { notify } from '@/utils/notify';
import { Block } from 'brewblox-proto/ts';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'BlockJsonDialog',
  props: {
    ...useDialog.props,
    address: {
      type: Object as PropType<BlockAddress>,
      required: true,
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const sparkStore = useSparkStore();
    const { dialogRef, dialogOpts, onDialogHide } = useDialog.setup();

    const block = computed<Block | null>(() =>
      sparkStore.blockByAddress(props.address),
    );

    const displayValue = computed<string>(() =>
      JSON.stringify(block.value, undefined, 4),
    );

    async function clipboardCopy(): Promise<void> {
      try {
        await navigator.clipboard.writeText(displayValue.value);
        notify.info('Copied block to clipboard');
      } catch (err) {
        notify.error(`Failed to copy: ${err}`);
      }
    }

    return {
      dialogRef,
      dialogOpts,
      onDialogHide,
      block,
      displayValue,
      clipboardCopy,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
    @hide="onDialogHide"
  >
    <Card>
      <template #toolbar>
        <Toolbar
          :title="address.id || 'Unknown block'"
          subtitle="Block JSON"
        />
      </template>

      <q-card-section>
        <div style="white-space: pre-wrap">{{ displayValue }}</div>
      </q-card-section>

      <template #actions>
        <q-btn
          unelevated
          label="Copy to clipboard"
          @click="clipboardCopy"
        />
      </template>
    </Card>
  </q-dialog>
</template>
