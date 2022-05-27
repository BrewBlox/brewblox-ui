<script lang="ts">
import truncate from 'lodash/truncate';
import { computed, defineComponent, PropType } from 'vue';

import { useField } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import type { Block, ComparedBlockType } from '@/plugins/spark/types';
import type { BlockAddress } from '@/plugins/spark/types';
import { createBlockDialog, createDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'BlockAddressField',
  props: {
    ...useField.props,
    modelValue: {
      type: Object as PropType<BlockAddress>,
      required: true,
    },
    title: {
      type: String,
      default: 'Choose block',
    },
    label: {
      type: String,
      default: 'Block',
    },
    anyService: {
      type: Boolean,
      default: false,
    },
    compatible: {
      type: [String, Array] as PropType<ComparedBlockType>,
      default: null,
    },
    blockFilter: {
      type: Function as PropType<(block: Block) => boolean>,
      default: () => true,
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    creatable: {
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
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
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
          ...props.dialogProps,
        },
      }).onOk(save);
    }

    return {
      activeSlots,
      displayValue,
      broken,
      canEdit,
      editBlock,
      openDialog,
    };
  },
});
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
