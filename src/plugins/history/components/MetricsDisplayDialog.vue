<script setup lang="ts">
import { DEFAULT_METRICS_DECIMALS, DEFAULT_METRICS_EXPIRY } from '../const';
import { defaultLabel } from '../nodes';
import { MetricsConfig } from '../types';
import { UseDialogEmits, UseDialogProps, useDialog } from '@/composables';
import { durationMs, durationString } from '@/utils/quantity';
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
  set: (v) => (local.renames[props.field] = v ?? defaultLabel(props.field)),
});

const fresh = computed<string>({
  get: () =>
    durationString(local.freshDuration[props.field] ?? DEFAULT_METRICS_EXPIRY),
  set: (val) => {
    const ms = durationMs(val) ?? DEFAULT_METRICS_EXPIRY;
    local.freshDuration[props.field] = ms;
  },
});

const decimals = computed<number>({
  get: () => local.decimals[props.field] ?? DEFAULT_METRICS_DECIMALS,
  set: (v) => {
    const numV = v !== null ? v : DEFAULT_METRICS_DECIMALS;
    local.decimals[props.field] = numV;
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
          title="Label"
          label="Label"
        />
        <TextField
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
