<script setup lang="ts">
import { MetricsConfig } from '../types';
import { emptyMetricsConfig } from '../utils';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import cloneDeep from 'lodash/cloneDeep';
import defaults from 'lodash/defaults';
import { ref } from 'vue';

interface Props extends UseDialogProps {
  modelValue: MetricsConfig;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup();

const local = ref<MetricsConfig>(
  defaults(cloneDeep(props.modelValue), emptyMetricsConfig()),
);
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
