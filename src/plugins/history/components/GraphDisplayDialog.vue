<script setup lang="ts">
import { defaultLabel } from '../nodes';
import { GraphAxis, GraphConfig } from '../types';
import { UseDialogEmits, UseDialogProps, useDialog } from '@/composables';
import cloneDeep from 'lodash/cloneDeep';
import { computed, reactive } from 'vue';

interface Props extends UseDialogProps {
  config: GraphConfig;
  field: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
});

defineEmits<UseDialogEmits>();

const { dialogOpts, dialogRef, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup();

const local = reactive(cloneDeep(props.config));
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
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{ title, message, html }">
      <div class="column q-gutter-xs">
        <TextField
          v-model="rename"
          title="Label"
          label="Label"
        />
        <NumberField
          v-model="precision"
          :decimals="0"
          :rules="[(v) => v >= 0 || 'Must be 0 or more']"
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
        <LabeledField
          label="Y-axis"
          class="depth-1"
        >
          <q-btn-toggle
            v-model="axis"
            :options="axisOpts"
            flat
            class="depth-1"
          />
        </LabeledField>
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
