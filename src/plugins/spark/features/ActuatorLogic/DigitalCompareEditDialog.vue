<script lang="ts">
import { useDialog } from '@/composables';
import { ENUM_LABELS_DIGITAL_OP } from '@/plugins/spark/const';
import { selectable } from '@/utils/collections';
import { deepCopy } from '@/utils/objects';
import { DigitalCompare } from 'brewblox-proto/ts';
import { defineComponent, PropType, ref } from 'vue';

const operatorOpts = selectable(ENUM_LABELS_DIGITAL_OP);

export default defineComponent({
  name: 'DigitalCompareEditDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: Object as PropType<DigitalCompare>,
      required: true,
    },
    serviceId: {
      type: String,
      required: true,
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogRef, dialogProps, onDialogHide, onDialogOK, onDialogCancel } =
      useDialog.setup();
    const local = ref<DigitalCompare>(deepCopy(props.modelValue));

    function save(): void {
      onDialogOK(local.value);
    }

    return {
      operatorOpts,
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      local,
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
