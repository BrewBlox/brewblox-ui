<script setup lang="ts">
import { UseFieldProps, useField } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import type { BlockAddress, ComparedBlockType } from '@/plugins/spark/types';
import { createBlockDialog } from '@/utils/block-dialog';
import { createDialog } from '@/utils/dialog';
import { Block } from 'brewblox-proto/ts';
import truncate from 'lodash/truncate';
import { computed } from 'vue';

interface Props extends UseFieldProps {
  modelValue: BlockAddress;
  anyService?: boolean;
  compatible?: ComparedBlockType;
  blockFilter?: (block: Block) => boolean;
  clearable?: boolean;
  creatable?: boolean;
  configurable?: boolean;
  show?: boolean;
  showCreated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  ...useField.defaultProps,
  title: 'Choose block',
  label: 'Block',
  anyService: false,
  compatible: null,
  blockFilter: () => true,
  clearable: true,
  creatable: true,
  configurable: true,
  show: true,
  showCreated: true,
});

const emit = defineEmits<{
  'update:modelValue': [payload: BlockAddress];
}>();

const { activeSlots } = useField.setup();
const sparkStore = useSparkStore();

function save(val: BlockAddress): void {
  emit('update:modelValue', val);
}

const displayValue = computed<string>(() =>
  truncate(props.modelValue.id ?? 'click to assign'),
);

const block = computed<Block | null>(() =>
  sparkStore.blockByAddress(props.modelValue),
);

const canEdit = computed<boolean>(
  () => block.value !== null && props.configurable && props.show,
);

const broken = computed<boolean>(
  () =>
    block.value === null &&
    props.modelValue.serviceId !== null &&
    props.modelValue.id !== null,
);

function editBlock(): void {
  createBlockDialog(block.value);
}

function openDialog(): void {
  if (props.readonly) {
    return;
  }

  createDialog({
    component: 'BlockAddressDialog',
    componentProps: {
      modelValue: props.modelValue,
      title: props.title,
      message: props.message,
      html: props.html,
      label: props.label,
      anyService: props.anyService,
      clearable: props.clearable,
      creatable: props.creatable,
      configurable: props.configurable,
      compatible: props.compatible,
      blockFilter: props.blockFilter,
      showCreated: props.showCreated,
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
    {{ displayValue }}
    <q-item-label
      v-if="broken"
      caption
      class="text-negative q-mt-xs"
    >
      Block {{ modelValue.id }} not found
    </q-item-label>
    <template #append>
      <q-btn
        v-if="canEdit"
        flat
        round
        icon="mdi-launch"
        @click.stop="editBlock"
      >
        <q-tooltip>Show {{ modelValue.id }}</q-tooltip>
      </q-btn>
      <q-icon
        v-if="broken"
        name="error"
        color="negative"
      />
    </template>

    <template
      v-for="slot in activeSlots"
      #[slot]
    >
      <slot :name="slot" />
    </template>
  </LabeledField>
</template>
