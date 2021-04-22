<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { useField } from '@/composables';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockField, BlockFieldAddress, ComparedBlockType } from '@/plugins/spark/types';
import { prettyAny } from '@/plugins/spark/utils';
import { createBlockDialog, createDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'BlockFieldAddressField',
  props: {
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
      type: Array as PropType<string[] | null>,
      default: null,
    },
    compatible: {
      type: [String, Array] as PropType<ComparedBlockType>,
      default: null,
    },
    blockFilter: {
      type: Function as PropType<(block: Block) => boolean>,
      default: () => true,
    },
    fieldFilter: {
      type: Function as PropType<(field: BlockField) => boolean>,
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
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {
    const { activeSlots } = useField.setup();

    function save(addr: BlockFieldAddress): void {
      emit('update:modelValue', addr);
    }

    const block = computed<Block | null>(
      () => sparkStore.blockByAddress(props.modelValue),
    );

    const fieldSpec = computed<BlockField | null>(
      () => sparkStore.fieldSpec(props.modelValue),
    );

    const fieldDisplayValue = computed<string>(
      () => prettyAny(sparkStore.fieldByAddress(props.modelValue)),
    );

    const broken = computed<boolean>(
      () => block.value === null
        && props.modelValue.serviceId !== null
        && props.modelValue.id !== null,
    );

    const canEdit = computed<boolean>(
      () => block.value !== null
        && props.configurable
        && props.show,
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
          label: props.label,
          services: props.services,
          compatible: props.compatible,
          blockFilter: props.blockFilter,
          fieldFilter: props.fieldFilter,
          ...props.dialogProps,
        },
      })
        .onOk(save);
    }


    return {
      activeSlots,
      save,
      fieldSpec,
      block,
      fieldDisplayValue,
      broken,
      canEdit,
      editBlock,
      openDialog,
    };
  },
});
</script>

<template>
  <LabeledField v-bind="{...$attrs, ...$props}" @click="openDialog">
    <div v-if="fieldSpec" class="q-gutter-y-xs">
      <span>
        {{ modelValue.id }} &raquo; {{ fieldSpec.title }}
      </span>
      <span
        v-if="showValue"
        class="text-secondary"
      >
        &raquo; {{ fieldDisplayValue }}
      </span>
    </div>
    <div v-else-if="readonly">
      No field selected
    </div>
    <div v-else>
      Click to assign
    </div>
    <q-item-label v-if="broken" caption class="text-negative q-mt-xs">
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

    <template v-for="slot in activeSlots" #[slot] :name="slot">
      <slot :name="slot" />
    </template>
  </LabeledField>
</template>
