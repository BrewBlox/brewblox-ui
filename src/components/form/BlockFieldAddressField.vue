<script setup lang="ts">
import { useField } from '@/composables';
import { useBlockSpecStore, useSparkStore } from '@/plugins/spark/store';
import {
  BlockFieldAddress,
  BlockFieldSpec,
  ComparedBlockType,
} from '@/plugins/spark/types';
import { createBlockDialog } from '@/utils/block-dialog';
import { createDialog } from '@/utils/dialog';
import { prettyAny } from '@/utils/quantity';
import { Block } from 'brewblox-proto/ts';
import { computed, PropType } from 'vue';

const props = defineProps({
  ...useField.props,
  modelValue: {
    type: Object as PropType<BlockFieldAddress>,
    required: true,
  },
  title: {
    type: String,
    default: 'Choose field',
  },
  label: {
    type: String,
    default: 'Field',
  },
  services: {
    type: null as unknown as PropType<string[] | null>,
    default: null,
  },
  compatible: {
    type: null as unknown as PropType<ComparedBlockType>,
    default: null,
  },
  blockFilter: {
    type: Function as PropType<(block: Block) => boolean>,
    default: () => true,
  },
  fieldFilter: {
    type: Function as PropType<(field: BlockFieldSpec) => boolean>,
    default: () => true,
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  configurable: {
    type: Boolean,
    default: true,
  },
  show: {
    type: Boolean,
    default: true,
  },
  showValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'update:modelValue', data: BlockFieldAddress): void;
}>();

const { activeSlots } = useField.setup();
const sparkStore = useSparkStore();
const specStore = useBlockSpecStore();

function save(addr: BlockFieldAddress): void {
  emit('update:modelValue', addr);
}

const block = computed<Block | null>(() =>
  sparkStore.blockByAddress(props.modelValue),
);

const fieldSpec = computed<BlockFieldSpec | null>(() =>
  specStore.fieldSpecByFieldAddress(props.modelValue),
);

const fieldDisplayValue = computed<string>(() =>
  prettyAny(sparkStore.fieldByAddress(props.modelValue)),
);

const broken = computed<boolean>(
  () =>
    block.value === null &&
    props.modelValue.serviceId !== null &&
    props.modelValue.id !== null,
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
    component: 'BlockFieldAddressDialog',
    componentProps: {
      modelValue: props.modelValue,
      title: props.title,
      message: props.message,
      html: props.html,
      services: props.services,
      compatible: props.compatible,
      blockFilter: props.blockFilter,
      fieldFilter: props.fieldFilter,
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
    <div
      v-if="fieldSpec"
      class="q-gutter-y-xs"
    >
      <span> {{ modelValue.id }} &raquo; {{ fieldSpec.title }} </span>
      <span
        v-if="showValue"
        class="text-secondary"
      >
        &raquo; {{ fieldDisplayValue }}
      </span>
    </div>
    <div v-else-if="readonly">No field selected</div>
    <div v-else>Click to assign</div>
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
