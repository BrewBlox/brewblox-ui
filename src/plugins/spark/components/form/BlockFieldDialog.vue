<script setup lang="ts">
import cloneDeep from 'lodash/cloneDeep';
import { onBeforeMount, ref } from 'vue';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import type { BlockAddress, BlockFieldSpec } from '@/plugins/spark/types';

interface Props extends UseDialogProps {
  modelValue: any;
  address: BlockAddress;
  field: BlockFieldSpec;
  comparison?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  comparison: false,
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup<any>();
const local = ref<any>();

function save(): void {
  onDialogOK(local.value);
}

onBeforeMount(() => (local.value = cloneDeep(props.modelValue)));
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{ title, message, html }">
      <component
        :is="field.component"
        :model-value="local"
        v-bind="field.componentProps"
        :service-id="address.serviceId"
        :block-id="address.id"
        :comparison="comparison"
        editable
        @update:model-value="(v) => (local = v)"
      />
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
