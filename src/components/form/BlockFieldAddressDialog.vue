<script setup lang="ts">
import { UseDialogEmits, UseDialogProps, useDialog } from '@/composables';
import { useBlockSpecStore, useSparkStore } from '@/plugins/spark/store';
import {
  BlockFieldAddress,
  BlockFieldSpec,
  BlockSpec,
  ComparedBlockType,
} from '@/plugins/spark/types';
import { isCompatible } from '@/plugins/spark/utils/info';
import { createBlockDialog } from '@/utils/block-dialog';
import { createDialog } from '@/utils/dialog';
import { Block, BlockOrIntfType } from 'brewblox-proto/ts';
import { computed, onBeforeMount, ref } from 'vue';

interface Props extends UseDialogProps {
  modelValue: BlockFieldAddress;
  services?: string[] | null;
  compatible?: ComparedBlockType;
  blockFilter?: (block: Block) => boolean;
  fieldFilter?: (field: BlockFieldSpec) => boolean;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  modelValue: () => ({
    serviceId: null,
    id: null,
    type: null,
    field: null,
  }),
  services: null,
  compatible: null,
  blockFilter: () => true,
  fieldFilter: () => true,
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup<BlockFieldAddress>();
const sparkStore = useSparkStore();
const specStore = useBlockSpecStore();

const fieldId = ref<string | null>(props.modelValue.field);

const _blockId = ref<string | null>(props.modelValue.id);
const blockId = computed<string | null>({
  get: () => _blockId.value,
  set: (id) => {
    if (id !== _blockId.value) {
      _blockId.value = id;
      fieldId.value = null;
    }
  },
});

const _serviceId = ref<string | null>(props.modelValue.serviceId);
const serviceId = computed<string | null>({
  get: () => _serviceId.value,
  set: (id) => {
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

const validTypes = computed<BlockOrIntfType[]>(() =>
  specStore.blockSpecs
    .filter((spec) => isCompatible(spec.type, props.compatible))
    .filter((spec) =>
      specStore.fieldSpecs.some(
        (f) => f.type === spec.type && props.fieldFilter(f),
      ),
    )
    .map((v) => v.type),
);

const blockIdOpts = computed<string[]>(
  () =>
    sparkStore
      .blocksByService(serviceId.value)
      .filter((block) => props.blockFilter(block))
      .filter((block) => validTypes.value.includes(block.type))
      .map((block) => block.id)
      .sort() ?? [],
);

const block = computed<Block | null>(() =>
  sparkStore.blockById(serviceId.value, blockId.value),
);

const blockSpec = computed<BlockSpec | null>(() =>
  block.value ? specStore.blockSpecByAddress(block.value) : null,
);

const fieldIdOpts = computed<SelectOption<string>[]>(
  () =>
    specStore
      .fieldSpecsByType(block.value?.type)
      .filter((f) => props.fieldFilter(f))
      .map((f) => ({ label: f.title, value: f.key })) ?? [],
);

const field = computed<BlockFieldSpec | null>(
  () =>
    specStore.fieldSpecs.find(
      (f) => f.type === block.value?.type && f.key === fieldId.value,
    ) ?? null,
);

const localAddress = computed<BlockFieldAddress | null>(() => {
  if (!fieldId.value || !blockSpec.value || !field.value) {
    return null;
  }
  return {
    serviceId: serviceId.value,
    id: blockId.value,
    field: fieldId.value,
    type: blockSpec.value.type,
  };
});

function configureBlock(): void {
  createBlockDialog(block.value);
}

function createBlock(): void {
  createDialog({
    component: 'BlockWizardDialog',
    componentProps: {
      serviceId: serviceId.value,
      compatible: validTypes.value,
    },
  }).onOk((block: Maybe<Block>) => {
    if (block) {
      serviceId.value = block.serviceId;
      blockId.value = block.id;
      fieldId.value = null;
    }
  });
}

function save(): void {
  if (localAddress.value != null) {
    onDialogOK(localAddress.value);
  }
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
          :disable="localAddress == null"
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
