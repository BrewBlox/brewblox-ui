<script setup lang="ts">
import { Block, Link } from 'brewblox-proto/ts';
import truncate from 'lodash/truncate';
import { computed } from 'vue';
import { useField, UseFieldProps } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import type { ComparedBlockType } from '@/plugins/spark/types';
import { createBlockDialog } from '@/utils/block-dialog';
import { createDialog } from '@/utils/dialog';

interface Props extends UseFieldProps {
  modelValue: Link;
  serviceId: string;
  compatible?: ComparedBlockType;
  blockFilter?: (block: Block) => boolean;
  clearable?: boolean;
  creatable?: boolean;
  configurable?: boolean;
  show?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  ...useField.defaultProps,
  label: 'Link',
  compatible: null,
  blockFilter: () => true,
  clearable: true,
  creatable: true,
  configurable: true,
  show: true,
});

const emit = defineEmits<{
  'update:modelValue': [payload: Link];
}>();

const { activeSlots } = useField.setup();
const sparkStore = useSparkStore();

function save(val: Link): void {
  emit('update:modelValue', val);
}

const displayValue = computed<string>(() =>
  truncate(props.modelValue.id ?? 'click to assign'),
);

const block = computed<Block | null>(() =>
  sparkStore.blockById(props.serviceId, props.modelValue.id),
);

const canEdit = computed<boolean>(
  () => block.value !== null && props.configurable && props.show,
);

function editBlock(): void {
  createBlockDialog(block.value);
}

function openDialog(): void {
  if (props.readonly) {
    return;
  }

  createDialog({
    component: 'LinkDialog',
    componentProps: {
      modelValue: props.modelValue,
      title: props.title,
      message: props.message,
      html: props.html,
      label: props.label,
      serviceId: props.serviceId,
      compatible: props.compatible,
      blockFilter: props.blockFilter,
      clearable: props.clearable,
      creatable: props.creatable,
      configurable: props.configurable,
      ...props.dialogProps,
    },
  }).onOk(save);
}
</script>

<template>
  <LabeledField
    v-bind="{ ...$attrs, ...$props }"
    @click="openDialog"
  >
    <slot name="value">
      {{ displayValue }}
    </slot>
    <template #append>
      <!-- dummy to fix https://github.com/quasarframework/quasar/issues/16589 -->
      <q-btn v-show="false" />
      <q-btn
        v-if="canEdit"
        flat
        round
        icon="mdi-launch"
        @click.stop="editBlock"
      >
        <q-tooltip>Show {{ modelValue.id }}</q-tooltip>
      </q-btn>
    </template>
    <template
      v-for="slot in activeSlots"
      #[slot]
    >
      <slot :name="slot" />
    </template>
  </LabeledField>
</template>
