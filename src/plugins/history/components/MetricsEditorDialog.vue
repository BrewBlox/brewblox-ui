<script lang="ts">
import { useDialog } from '@/composables';
import { deepCopy } from '@/utils/objects';
import defaults from 'lodash/defaults';
import { defineComponent, PropType, ref } from 'vue';
import { MetricsConfig } from '../types';
import { emptyMetricsConfig } from '../utils';

export default defineComponent({
  name: 'MetricsEditorDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: Object as PropType<MetricsConfig>,
      required: true,
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogRef, dialogProps, onDialogHide, onDialogCancel, onDialogOK } =
      useDialog.setup();

    const local = ref<MetricsConfig>(
      defaults(deepCopy(props.modelValue), emptyMetricsConfig()),
    );

    return {
      dialogRef,
      dialogProps,
      onDialogOK,
      onDialogHide,
      onDialogCancel,
      local,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="onDialogOK(local)"
  >
    <Card>
      <template #toolbar>
        <Toolbar title="Select metrics" />
      </template>

      <MetricsEditor v-model:config="local" />

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
          @click="onDialogOK(local)"
        />
      </template>
    </Card>
  </q-dialog>
</template>
