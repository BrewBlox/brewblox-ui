<script lang="ts">
import { computed, defineComponent, PropType, reactive } from 'vue';

import { useDialog } from '@/composables';
import { deepCopy } from '@/utils/objects';

import { defaultLabel } from '../nodes';
import { GraphAxis, GraphConfig } from '../types';

export default defineComponent({
  name: 'GraphDisplayDialog',
  props: {
    ...useDialog.props,
    config: {
      type: Object as PropType<GraphConfig>,
      required: true,
    },
    field: {
      type: String,
      required: true,
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogProps, dialogRef, onDialogHide, onDialogCancel, onDialogOK } =
      useDialog.setup();

    const local = reactive(deepCopy(props.config));
    const axisOpts: SelectOption<GraphAxis>[] = [
      {
        value: 'y',
        label: 'Y1',
      },
      {
        value: 'y2',
        label: 'Y2',
      },
    ];

    const label = computed<string>(() => defaultLabel(props.field));

    const rename = computed<string | null>({
      get: () => local.renames[props.field] ?? label.value,
      set: (v) => {
        if (v) {
          local.renames[props.field] = v;
        } else {
          delete local.renames[props.field];
        }
      },
    });

    const axis = computed<GraphAxis>({
      get: () => local.axes[props.field] || 'y',
      set: (v) => (local.axes[props.field] = v),
    });

    const color = computed<string>({
      get: () => local.colors[props.field] || '',
      set: (v) => (local.colors[props.field] = v),
    });

    const precision = computed<number>({
      get: () => local.precision[props.field] ?? 2,
      set: (v) => (local.precision[props.field] = v),
    });

    function save(): void {
      onDialogOK(local);
    }

    return {
      defaultLabel,
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      rename,
      axis,
      axisOpts,
      color,
      precision,
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
      <div class="column q-gutter-xs">
        <InputField v-model="rename" title="Label" label="Label" />
        <InputField
          v-model="precision"
          :decimals="0"
          :rules="[(v) => v >= 0 || 'Must be 0 or more']"
          type="number"
          title="Decimals in label"
          label="Decimals in label"
        />
        <ColorField
          v-model="color"
          title="Line color"
          label="Line color"
          null-text="automatic"
          clearable
        />
        <LabeledField label="Y-axis" class="depth-1">
          <q-btn-toggle
            v-model="axis"
            :options="axisOpts"
            flat
            class="depth-1"
          />
        </LabeledField>
      </div>

      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
