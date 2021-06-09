<script lang="ts">
import isString from 'lodash/isString';
import { defineComponent, PropType, ref } from 'vue';

import { useDialog } from '@/composables';
import { AnalogConstraintsObj, DigitalConstraintsObj } from '@/plugins/spark/types';
import { deepCopy } from '@/utils/objects';

import AnalogConstraints from './AnalogConstraints.vue';
import DigitalConstraints from './DigitalConstraints.vue';

type ConstraintsObj = AnalogConstraintsObj | DigitalConstraintsObj;

function typeValidator(v: unknown): boolean {
  return isString(v) && ['analog', 'digital'].includes(v);
}

export default defineComponent({
  name: 'ConstraintsDialog',
  components: {
    analog: AnalogConstraints,
    digital: DigitalConstraints,
  },
  props: {
    ...useDialog.props,
    modelValue: {
      type: Object as PropType<ConstraintsObj>,
      default: () => ({ constraints: [] }),
    },
    serviceId: {
      type: String,
      required: true,
    },
    type: {
      type: String as PropType<'analog' | 'digital'>,
      required: true,
      validator: typeValidator,
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
      onDialogOK,
      onDialogCancel,
    } = useDialog.setup();

    const local = ref<ConstraintsObj>(deepCopy(props.modelValue));

    function save(): void {
      onDialogOK(local.value);
    }

    return {
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
    <DialogCard v-bind="{title, message, html}">
      <component :is="type" v-model="local" :service-id="serviceId" />
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
