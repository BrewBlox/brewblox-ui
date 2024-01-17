<script setup lang="ts">
import { DigitalCompare } from 'brewblox-proto/ts';
import cloneDeep from 'lodash/cloneDeep';
import { ref } from 'vue';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { ENUM_LABELS_DIGITAL_OP } from '@/plugins/spark/const';
import { selectable } from '@/utils/collections';

interface Props extends UseDialogProps {
  modelValue: DigitalCompare;
  serviceId: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
});

defineEmits<UseDialogEmits>();

const operatorOpts = selectable(ENUM_LABELS_DIGITAL_OP);

const { dialogRef, dialogOpts, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup<DigitalCompare>();
const local = ref<DigitalCompare>(cloneDeep(props.modelValue));

function save(): void {
  onDialogOK(local.value);
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
      <LinkField
        v-model="local.id"
        :service-id="serviceId"
        title="target"
        label="Digital actuator input"
        clearable
      />
      <div class="row justify-between q-px-sm">
        <q-select
          v-model="local.op"
          :options="operatorOpts"
          map-options
          emit-value
          label="Operator"
          class="min-width-md col-auto"
          @keyup.enter.exact.stop
        />
        <DigitalStateButton
          v-model="local.rhs"
          class="self-center"
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
