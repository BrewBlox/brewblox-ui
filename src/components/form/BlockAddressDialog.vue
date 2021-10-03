<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import { useDialog } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import type {
  Block,
  BlockAddress,
  ComparedBlockType,
} from '@/plugins/spark/types';
import { isCompatible } from '@/plugins/spark/utils';
import { createBlockWizard } from '@/plugins/wizardry';
import { featureStore } from '@/store/features';
import { createBlockDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';

const asAddr = (v: Block | BlockAddress | null): BlockAddress => ({
  id: v?.id ?? null,
  serviceId: v?.serviceId ?? null,
  type: v?.type ?? null,
});

export default defineComponent({
  name: 'BlockAddressDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: Object as PropType<BlockAddress>,
      default: () => asAddr(null),
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
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogRef, dialogProps, onDialogCancel, onDialogHide, onDialogOK } =
      useDialog.setup();
    const sparkStore = useSparkStore();
    const local = ref<BlockAddress | null>(null);

    const serviceIds = computed<string[]>(() => sparkStore.serviceIds);

    const serviceId = computed<string>({
      get: () => {
        const { serviceId } = local.value ?? props.modelValue;
        return serviceId && serviceIds.value.includes(serviceId)
          ? serviceId
          : serviceIds.value[0] ?? '';
      },
      set: (serviceId) => {
        if (local.value?.serviceId !== serviceId) {
          local.value = {
            serviceId,
            id: null,
            type: props.modelValue.type,
          };
        }
      },
    });

    const typeFilter = computed<(type: string) => boolean>(() => {
      const intf = props.compatible ?? props.modelValue.type;
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
      local.value
        ? sparkStore.blockById(serviceId.value, local.value.id)
        : null,
    );

    const tooltip = computed<string | null>(() =>
      block.value ? featureStore.widgetTitle(block.value.type) : null,
    );

    const localOk = computed<boolean>(
      () => block.value !== null || props.clearable,
    );

    function configureBlock(): void {
      createBlockDialog(local.value);
    }

    function createBlock(): void {
      createBlockWizard(
        serviceId.value,
        props.compatible ?? props.modelValue.type,
      ).onOk(({ block }) => {
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
            type: props.modelValue.type,
          },
        );
      }
    }

    return {
      dialogRef,
      dialogProps,
      onDialogCancel,
      onDialogHide,
      local,
      serviceIds,
      serviceId,
      typeFilter,
      addressOpts,
      block,
      tooltip,
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
        :error="local && local.id && !block"
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
            <q-item-section class="text-grey">
              No results
            </q-item-section>
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
          <q-btn v-else flat round disable icon="mdi-launch" />

          <q-btn v-if="creatable" flat round icon="add" @click="createBlock">
            <q-tooltip>Create new block</q-tooltip>
          </q-btn>
        </template>
      </q-select>
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
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
