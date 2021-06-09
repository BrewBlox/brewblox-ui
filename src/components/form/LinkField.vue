<script lang="ts">
import truncate from 'lodash/truncate';
import { computed, defineComponent, PropType } from 'vue';

import { useField } from '@/composables';
import { sparkStore } from '@/plugins/spark/store';
import type { Block, ComparedBlockType } from '@/plugins/spark/types';
import { bloxLink, Link } from '@/utils/bloxfield';
import { createBlockDialog, createDialog } from '@/utils/dialog';


export default defineComponent({
  name: 'LinkField',
  props: {
    ...useField.props,
    modelValue: {
      type: Object as PropType<Link>,
      default: () => bloxLink(null),
    },
    serviceId: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: 'Link',
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
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {
    const { activeSlots } = useField.setup();

    function save(val: Link): void {
      emit('update:modelValue', val);
    }

    const displayValue = computed<string>(
      () => truncate(props.modelValue.id ?? 'click to assign'),
    );

    const block = computed<Block | null>(
      () => sparkStore.blockById(props.serviceId, props.modelValue.id),
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
      })
        .onOk(save);
    }

    return {
      activeSlots,
      displayValue,
      canEdit,
      editBlock,
      openDialog,
    };
  },
});
</script>

<template>
  <LabeledField v-bind="{...$attrs, ...$props}" @click="openDialog">
    <slot name="value">
      {{ displayValue }}
    </slot>
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
    </template>
    <template v-for="slot in activeSlots" #[slot] :name="slot">
      <slot :name="slot" />
    </template>
  </LabeledField>
</template>
