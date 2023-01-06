<script lang="ts">
import { useDialog } from '@/composables';
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  name: 'ColorDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: String,
      required: true,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    presets: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogRef, dialogProps, onDialogHide, onDialogCancel, onDialogOK } =
      useDialog.setup();
    const local = ref<string>(props.modelValue);

    function save(): void {
      onDialogOK(local.value);
    }

    function clear(): void {
      onDialogOK('');
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      local,
      save,
      clear,
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
