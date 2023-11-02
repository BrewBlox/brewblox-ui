<script lang="ts">
import { MetricsConfig } from '../types';
import { emptyMetricsConfig } from '../utils';
import { useDialog } from '@/composables';
import cloneDeep from 'lodash/cloneDeep';
import defaults from 'lodash/defaults';
import { defineComponent, PropType, ref } from 'vue';

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
    const { dialogRef, dialogOpts, onDialogHide, onDialogCancel, onDialogOK } =
      useDialog.setup();

    const local = ref<MetricsConfig>(
      defaults(cloneDeep(props.modelValue), emptyMetricsConfig()),
    );

    return {
      dialogRef,
      dialogOpts,
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
    v-bind="dialogOpts"
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
