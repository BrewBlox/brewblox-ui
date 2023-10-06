<script setup lang="ts">
import { useDialog } from '@/composables';
import { computed, PropType, ref } from 'vue';

const props = defineProps({
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
});

defineEmits({ ...useDialog.emitsObject });

const { dialogRef, dialogProps, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup();
const local = ref<any[]>([...props.modelValue]);

const cancelLabel = computed<string>(() =>
  typeof props.cancel === 'string' ? props.cancel : 'Cancel',
);

function save(): void {
  onDialogOK(local.value);
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{ title, message, html }">
      <div class="q-gutter-sm column">
        <q-checkbox
          v-for="(opt, idx) in selectOptions"
          :key="'opt-' + idx"
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
