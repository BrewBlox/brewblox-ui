<script setup lang="ts">
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { parseColor } from '@/utils/colors';
import { ref } from 'vue';

interface Props extends UseDialogProps {
  modelValue: string;
  clearable?: boolean;
  presets?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  clearable: false,
  presets: () => [],
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup<string>();
const local = ref<string>(parseColor(props.modelValue) ?? '#ffffff');

function save(): void {
  onDialogOK(local.value);
}

function clear(): void {
  onDialogOK('');
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
      <div
        v-if="presets.length"
        class="row q-gutter-x-md q-pb-sm"
      >
        <q-btn
          v-for="(preset, idx) in presets"
          :key="'preset-color-' + idx"
          :style="`background-color: ${preset}`"
          :color="preset"
          round
          icon="format_color_fill"
          class="self-center"
          @click="local = preset"
        />
      </div>
      <q-color
        v-model="local"
        format-model="hex"
      />
      <template #actions>
        <q-btn
          color="primary"
          flat
          label="Cancel"
          @click="onDialogCancel"
        />
        <q-btn
          v-if="clearable"
          color="primary"
          flat
          label="Clear"
          @click="clear"
        />
        <q-btn
          color="primary"
          flat
          label="OK"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
