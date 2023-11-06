<script setup lang="ts">
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { computed, ref } from 'vue';

interface Props extends UseDialogProps {
  modelValue: any[];
  selectOptions: SelectOption[];
  ok?: string;
  cancel?: string | boolean;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  ok: 'OK',
  cancel: true,
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup<any[]>();
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
    v-bind="dialogOpts"
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
