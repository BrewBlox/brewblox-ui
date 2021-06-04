<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import { useDialog } from '@/composables';

export default defineComponent({
  name: 'CheckboxDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: Array,
      default: () => [],
    },
    selectOptions: {
      type: Array as PropType<SelectOption[]>,
      required: true,
    },
    ok: {
      type: String,
      default: 'OK',
    },
    cancel: {
      type: [String, Boolean],
      default: true,
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
    const local = ref<any[]>([...props.modelValue]);

    const cancelLabel = computed<string>(
      () => typeof props.cancel === 'string'
        ? props.cancel
        : 'Cancel',
    );

    function save(): void {
      onDialogOK(local.value);
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      local,
      cancelLabel,
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
      <div class="q-gutter-sm column">
        <q-checkbox
          v-for="(opt, idx) in selectOptions"
          :key="'opt-'+idx"
          v-model="local"
          :val="opt.value"
          :label="opt.label"
        />
      </div>
      <template #actions>
        <q-btn
          v-if="cancel"
          flat
          :label="cancelLabel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          :label="ok"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
