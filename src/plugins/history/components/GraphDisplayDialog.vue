<script setup lang="ts">
import cloneDeep from 'lodash/cloneDeep';
import { computed, reactive } from 'vue';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { DEFAULT_GRAPH_AXIS, DEFAULT_GRAPH_DECIMALS } from '../const';
import { defaultLabel } from '../nodes';
import { GraphAxis, GraphConfig } from '../types';

interface Props extends UseDialogProps {
  config: GraphConfig;
  field: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
});

defineEmits<UseDialogEmits>();

const { dialogOpts, dialogRef, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup<GraphConfig>();

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

const rename = computed<string>({
  get: () => local.renames[props.field] || label.value,
  set: (v) => {
    if (v && v !== label.value) {
      local.renames[props.field] = v;
    } else {
      delete local.renames[props.field];
    }
  },
});

const axis = computed<GraphAxis>({
  get: () => local.axes[props.field] || DEFAULT_GRAPH_AXIS,
  set: (v) => {
    if (v && v !== DEFAULT_GRAPH_AXIS) {
      local.axes[props.field] = v;
    } else {
      delete local.axes[props.field];
    }
  },
});

const color = computed<string>({
  get: () => local.colors[props.field] || '',
  set: (v) => {
    if (v) {
      local.colors[props.field] = v;
    } else {
      delete local.colors[props.field];
    }
  },
});

const precision = computed<number>({
  get: () => local.precision[props.field] ?? DEFAULT_GRAPH_DECIMALS,
  set: (v) => {
    if (v != null && v !== DEFAULT_GRAPH_DECIMALS) {
      local.precision[props.field] = v;
    } else {
      delete local.precision[props.field];
    }
  },
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
          :placeholder="label"
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
