<script lang="ts">
import { computed, defineComponent, onBeforeMount, PropType, ref } from 'vue';

import { useDialog } from '@/composables';
import { sparkStore } from '@/plugins/spark/store';
import {
  Block,
  BlockFieldAddress,
  BlockFieldSpec,
  BlockOrIntfType,
  BlockSpec,
  ComparedBlockType,
} from '@/plugins/spark/types';
import { isCompatible } from '@/plugins/spark/utils';
import { createBlockWizard } from '@/plugins/wizardry';
import { createBlockDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'BlockFieldAddressDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: Object as PropType<BlockFieldAddress>,
      default: () => ({
        serviceId: null,
        id: null,
        type: null,
        field: null,
      }),
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
      type: Function as PropType<(field: BlockFieldSpec) => boolean>,
      default: () => true,
    },
  },
  emits: [
    ...useDialog.emits,
  ],
  setup(props) {
    const {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      onDialogOK,
    } = useDialog.setup();

    const fieldId = ref<string | null>(props.modelValue.field);

    const _blockId = ref<string | null>(props.modelValue.id);
    const blockId = computed<string | null>({
      get: () => _blockId.value,
      set: id => {
        if (id !== _blockId.value) {
          _blockId.value = id;
          fieldId.value = null;
        }
      },
    });

    const _serviceId = ref<string | null>(props.modelValue.serviceId);
    const serviceId = computed<string | null>({
      get: () => _serviceId.value,
      set: id => {
        if (id !== _serviceId.value) {
          _serviceId.value = id;
          blockId.value = null;
          fieldId.value = null;
        }
      },
    });

    const serviceIdOpts = computed<string[]>(
      () => props.services ?? sparkStore.serviceIds,
    );

    onBeforeMount(() => {
      if (!props.modelValue.serviceId && serviceIdOpts.value.length === 1) {
        serviceId.value = serviceIdOpts.value[0];
      }
    });

    const validTypes = computed<BlockOrIntfType[]>(
      () => sparkStore
        .blockSpecs
        .filter(v => isCompatible(v.id, props.compatible))
        .filter(v => v.fieldSpecs.some(f => props.fieldFilter(f)))
        .map(v => v.id),
    );

    const blockIdOpts = computed<string[]>(
      () => sparkStore.moduleById(serviceId.value)
        ?.blocks
        .filter(block => props.blockFilter(block))
        .filter(block => validTypes.value.includes(block.type))
        .map(block => block.id)
        .sort()
        ?? [],
    );

    const block = computed<Block | null>(
      () => sparkStore.blockById(serviceId.value, blockId.value),
    );

    const blockSpec = computed<BlockSpec | null>(
      () => block.value
        ? sparkStore.blockSpecByAddress(block.value)
        : null,
    );

    const fieldIdOpts = computed<SelectOption<string>[]>(
      () => blockSpec.value
        ?.fieldSpecs
        .filter(f => props.fieldFilter(f))
        .map(f => ({ label: f.title, value: f.key }))
        ?? [],
    );

    const field = computed<BlockFieldSpec | null>(
      () => blockSpec.value && fieldId.value
        ? blockSpec.value.fieldSpecs.find(f => f.key === fieldId.value) ?? null
        : null,
    );

    const localAddress = computed<BlockFieldAddress | null>(
      () => {
        if (!fieldId.value || !blockSpec.value || !field.value) {
          return null;
        }
        return {
          serviceId: serviceId.value,
          id: blockId.value,
          field: fieldId.value,
          type: blockSpec.value.id,
        };
      },
    );

    const localOk = computed<boolean>(
      () => localAddress.value !== null,
    );

    function configureBlock(): void {
      createBlockDialog(block.value);
    }

    function createBlock(): void {
      createBlockWizard(serviceId.value, validTypes.value)
        .onOk(({ block }) => {
          if (block) {
            serviceId.value = block.serviceId;
            blockId.value = block.id;
            fieldId.value = null;
          }
        });
    }

    function save(): void {
      if (localOk.value) {
        onDialogOK(localAddress.value);
      }
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      fieldId,
      blockId,
      serviceId,
      serviceIdOpts,
      validTypes,
      blockIdOpts,
      block,
      fieldIdOpts,
      field,
      localAddress,
      localOk,
      configureBlock,
      createBlock,
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
    <DialogCard v-bind="{title, message, html}">
      <q-select
        v-if="serviceIdOpts.length > 1"
        v-model="serviceId"
        :options="serviceIdOpts"
        label="Service"
        item-aligned
        @keyup.enter.exact.stop
      />
      <q-select
        v-model="blockId"
        :options="blockIdOpts"
        :disable="!serviceId"
        label="Block"
        item-aligned
        @keyup.enter.exact.stop
      >
        <template #after>
          <q-btn
            v-if="block"
            flat
            round
            icon="mdi-launch"
            @click="configureBlock"
          >
            <q-tooltip>Show {{ blockId }}</q-tooltip>
          </q-btn>
          <q-btn
            v-else
            flat
            round
            disable
            icon="mdi-launch"
          />

          <q-btn
            flat
            round
            icon="add"
            @click="createBlock"
          >
            <q-tooltip>Create new block</q-tooltip>
          </q-btn>
        </template>
      </q-select>

      <q-select
        v-model="fieldId"
        :options="fieldIdOpts"
        :disable="!blockId"
        label="Field"
        item-aligned
        map-options
        emit-value
        @keyup.enter.exact.stop
      />

      <template #actions>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          :disable="!localOk"
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
