<script setup lang="ts">
import { Block } from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { notify } from '@/utils/notify';
import { useSparkStore } from '../../store';
import { BlockAddress } from '../../types';

interface Props extends UseDialogProps {
  address: BlockAddress;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
});

defineEmits<UseDialogEmits>();

const sparkStore = useSparkStore();
const { dialogRef, dialogOpts, onDialogHide } = useDialog.setup<never>();

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
