<script setup lang="ts">
import { UseDialogEmits, UseDialogProps, useDialog } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import type { BlockAddress, ComparedBlockType } from '@/plugins/spark/types';
import { isCompatible } from '@/plugins/spark/utils/info';
import { useFeatureStore } from '@/store/features';
import { createBlockDialog } from '@/utils/block-dialog';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';
import { Block } from 'brewblox-proto/ts';
import { computed, ref } from 'vue';

interface Props extends UseDialogProps {
  modelValue: BlockAddress | null;
  label?: string;
  anyService?: boolean;
  compatible?: ComparedBlockType;
  blockFilter?: (block: Block) => boolean;
  clearable?: boolean;
  creatable?: boolean;
  configurable?: boolean;
  showCreated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  label: 'Block',
  anyService: false,
  compatible: null,
  blockFilter: () => true,
  clearable: true,
  creatable: true,
  configurable: true,
  showCreated: true,
});

defineEmits<UseDialogEmits>();

const asAddr = (v: Block | BlockAddress | null): BlockAddress => ({
  id: v?.id ?? null,
  serviceId: v?.serviceId ?? null,
  type: v?.type ?? null,
});

const { dialogRef, dialogOpts, onDialogCancel, onDialogHide, onDialogOK } =
  useDialog.setup<BlockAddress>();
const sparkStore = useSparkStore();
const featureStore = useFeatureStore();

const modelValueAddr = computed<BlockAddress>(
  () => props.modelValue ?? asAddr(null),
);

const local = ref<BlockAddress | null>(modelValueAddr.value);

const serviceIds = computed<string[]>(() => sparkStore.serviceIds);

const serviceId = computed<string>({
  get: () => {
    const { serviceId } = local.value ?? modelValueAddr.value;
    return serviceId && serviceIds.value.includes(serviceId)
      ? serviceId
      : serviceIds.value[0] ?? '';
  },
  set: (serviceId) => {
    if (local.value?.serviceId !== serviceId) {
      local.value = {
        serviceId,
        id: null,
        type: modelValueAddr.value.type,
      };
    }
  },
});

const typeFilter = computed<(type: string) => boolean>(() => {
  const intf = props.compatible ?? modelValueAddr.value.type;
  return (type) => isCompatible(type, intf);
});

const addressOpts = computed<BlockAddress[]>(() =>
  sparkStore
    .blocksByService(serviceId.value)
    .filter((block) => typeFilter.value(block.type))
    .filter(props.blockFilter)
    .map(asAddr)
    .sort(makeObjectSorter('id')),
);

const block = computed<Block | null>(() =>
  local.value ? sparkStore.blockById(serviceId.value, local.value.id) : null,
);

const tooltip = computed<string | null>(() =>
  block.value ? featureStore.widgetTitle(block.value.type) : null,
);

const localOk = computed<boolean>(() => block.value != null || props.clearable);

function configureBlock(): void {
  createBlockDialog(local.value);
}

function createBlock(): void {
  createDialog({
    component: 'BlockWizardDialog',
    componentProps: {
      serviceId: serviceId.value,
      compatible: props.compatible ?? modelValueAddr.value.type,
      showCreated: props.showCreated,
    },
  }).onOk((block: Maybe<Block>) => {
    if (block) {
      local.value = asAddr(block);
    }
  });
}

function save(): void {
  if (localOk.value) {
    onDialogOK(
      local.value ?? {
        id: null,
        serviceId: serviceId.value,
        type: modelValueAddr.value.type,
      },
    );
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
        v-if="anyService && serviceIds.length > 1"
        v-model="serviceId"
        :options="serviceIds"
        label="Service"
        item-aligned
        @keyup.enter.exact.stop
      />
      <q-select
        v-model="local"
        :options="addressOpts"
        :clearable="clearable"
        :label="label"
        :error="Boolean(local && local.id && !block)"
        error-message="Block not found"
        autofocus
        item-aligned
        option-label="id"
        option-value="id"
        @keyup.enter.exact.stop
      >
        <q-tooltip v-if="tooltip">
          {{ tooltip }}
        </q-tooltip>
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey">No results</q-item-section>
          </q-item>
        </template>
        <template #after>
          <q-btn
            v-if="configurable && block"
            flat
            round
            icon="mdi-launch"
            @click="configureBlock"
          >
            <q-tooltip>Show {{ block.id }}</q-tooltip>
          </q-btn>
          <q-btn
            v-else
            flat
            round
            disable
            icon="mdi-launch"
          />

          <q-btn
            v-if="creatable"
            flat
            round
            icon="add"
            @click="createBlock"
          >
            <q-tooltip>Create new block</q-tooltip>
          </q-btn>
        </template>
      </q-select>
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
