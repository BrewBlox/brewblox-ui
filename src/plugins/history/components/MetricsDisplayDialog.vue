<script setup lang="ts">
import { DEFAULT_METRICS_DECIMALS, DEFAULT_METRICS_EXPIRY_MS } from '../const';
import { defaultLabel } from '../nodes';
import { MetricsConfig } from '../types';
import { UseDialogEmits, UseDialogProps, useDialog } from '@/composables';
import { bloxQty, durationMs } from '@/utils/quantity';
import { Quantity } from 'brewblox-proto/ts';
import cloneDeep from 'lodash/cloneDeep';
import { computed, reactive } from 'vue';

interface Props extends UseDialogProps {
  config: MetricsConfig;
  field: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup<MetricsConfig>();

const local = reactive(cloneDeep(props.config));

const rename = computed<string>({
  get: () => local.renames[props.field] ?? defaultLabel(props.field),
  set: (v) => {
    if (v && v !== defaultLabel(props.field)) {
      local.renames[props.field] = v;
    } else {
      delete local.renames[props.field];
    }
  },
});

const fresh = computed<Quantity>({
  get: () =>
    bloxQty(
      local.freshDuration[props.field] ?? DEFAULT_METRICS_EXPIRY_MS,
      'ms',
    ),
  set: (val) => {
    const ms = durationMs(val);
    if (ms != DEFAULT_METRICS_EXPIRY_MS) {
      local.freshDuration[props.field] = ms;
    } else {
      delete local.freshDuration[props.field];
    }
  },
});

const decimals = computed<number>({
  get: () => local.decimals[props.field] ?? DEFAULT_METRICS_DECIMALS,
  set: (v) => {
    if (v != null && v !== DEFAULT_METRICS_DECIMALS) {
      local.decimals[props.field] = v;
    } else {
      delete local.decimals[props.field];
    }
  },
});

function save(): void {
  onDialogOK(local);
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{ title, message, html }">
      <div class="column q-gutter-xs">
        <TextField
          v-model="rename"
          :placeholder="defaultLabel(props.field)"
          title="Label"
          label="Label"
        />
        <DurationField
          v-model="fresh"
          title="Warn when older than"
          label="Warn when older than"
        />
        <NumberField
          v-model="decimals"
          :decimals="0"
          :rules="[(v) => v >= 0 || 'Must be 0 or more']"
          title="Number of decimals"
          label="Number of decimals"
        />
      </div>

      <template #actions>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
