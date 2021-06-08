<script lang="ts">
import { computed, defineComponent, PropType, reactive } from 'vue';

import { useDialog } from '@/composables';
import { deepCopy, durationMs, durationString } from '@/utils';

import { DEFAULT_DECIMALS, DEFAULT_FRESH_DURATION } from '../Metrics/const';
import { MetricsConfig } from '../Metrics/types';
import { defaultLabel } from '../nodes';

export default defineComponent({
  name: 'MetricsDisplayDialog',
  props: {
    ...useDialog.props,
    config: {
      type: Object as PropType<MetricsConfig>,
      required: true,
    },
    field: {
      type: String,
      required: true,
    },
  },
  emits: [
    ...useDialog.emits,
  ],
  setup(props) {
    const {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      onDialogOK,
    } = useDialog.setup();

    const local = reactive(deepCopy(props.config));

    const rename = computed<string>({
      get: () => local.renames[props.field] ?? defaultLabel(props.field),
      set: v => local.renames[props.field] = v ?? defaultLabel(props.field),
    });

    const fresh = computed<string>({
      get: () => durationString(
        local.freshDuration[props.field] ?? DEFAULT_FRESH_DURATION),
      set: val => {
        const ms = durationMs(val) ?? DEFAULT_FRESH_DURATION;
        local.freshDuration[props.field] = ms;
      },
    });

    const decimals = computed<number>({
      get: () => local.decimals[props.field] ?? DEFAULT_DECIMALS,
      set: v => {
        const numV = v !== null ? v : DEFAULT_DECIMALS;
        local.decimals[props.field] = numV;
      },
    });

    function save(): void {
      onDialogOK(local);
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      rename,
      fresh,
      decimals,
      save,
    };
  },
});
</script>


<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <div class="column q-gutter-xs">
        <InputField v-model="rename" title="Label" label="Label" />
        <InputField v-model="fresh" title="Warn when older than" label="Warn when older than" />
        <InputField
          v-model="decimals"
          :decimals="0"
          :rules="[v => v >= 0 || 'Must be 0 or more']"
          type="number"
          title="Number of decimals"
          label="Number of decimals"
        />
      </div>

      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
