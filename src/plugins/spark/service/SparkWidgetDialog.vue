<script lang="ts">
import { defineComponent } from 'vue';

import { useDialog, useGlobals } from '@/composables';

import SparkWidget from './SparkWidget.vue';

export default defineComponent({
  name: 'SparkWidgetDialog',
  components: {
    SparkWidget,
  },
  props: {
    ...useDialog.props,
    serviceId: {
      type: String,
      required: true,
    },
  },
  emits: [
    ...useDialog.emits,
  ],
  setup() {
    const {
      dialogRef,
      dialogProps,
      onDialogHide,
    } = useDialog.setup();
    const { dense } = useGlobals.setup();

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      dense,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    :maximized="dense"
    v-bind="dialogProps"
    @hide="onDialogHide"
  >
    <SparkWidget :service-id="serviceId" />
  </q-dialog>
</template>
