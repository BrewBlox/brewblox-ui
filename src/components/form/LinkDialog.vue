<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import { useDialog } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { Block, ComparedBlockType, Link } from '@/plugins/spark/types';
import { isCompatible } from '@/plugins/spark/utils';
import { createBlockWizard } from '@/plugins/wizardry';
import { useFeatureStore } from '@/store/features';
import { createBlockDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';
import { bloxLink } from '@/utils/link';

export default defineComponent({
  name: 'LinkDialog',
  props: {
    ...useDialog.props,
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
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogRef, dialogProps, onDialogHide, onDialogCancel, onDialogOK } =
      useDialog.setup();
    const sparkStore = useSparkStore();
    const featureStore = useFeatureStore();

    const local = ref<Link>(bloxLink(props.modelValue));

    const blockTypeFilter = computed<(block: Block) => boolean>(
      () => (block) =>
        isCompatible(
          block.type,
          props.compatible ?? props.modelValue?.type ?? null,
        ),
    );

    const linkOpts = computed<Link[]>(() =>
      sparkStore
        .blocksByService(props.serviceId)
        .filter(blockTypeFilter.value)
        .filter(props.blockFilter)
        .map((block) => bloxLink(block.id, block.type))
        .sort(makeObjectSorter('id')),
    );

    const block = computed<Block | null>(() =>
      sparkStore.blockById(props.serviceId, local.value.id),
    );

    const tooltip = computed<string | null>(() =>
      block.value ? featureStore.widgetTitle(block.value.type) : null,
    );

    const localOk = computed<boolean>(
      () => block.value !== null || props.clearable,
    );

    function update(link: Link | null): void {
      local.value =
        link !== null ? bloxLink(link) : bloxLink(null, props.modelValue.type);
    }

    function configureBlock(): void {
      createBlockDialog(block.value);
    }

    function createBlock(): void {
      createBlockWizard(
        props.serviceId,
        props.compatible ?? local.value.type,
      ).onOk(({ block }) => {
        if (block) {
          // Retain original type
          local.value = bloxLink(block.id, props.modelValue.type);
        }
      });
    }

    function save(): void {
      if (localOk.value) {
        onDialogOK(local.value);
      }
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      local,
      linkOpts,
      block,
      tooltip,
      localOk,
      update,
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
        :model-value="local"
        :options="linkOpts"
        :clearable="clearable"
        :label="label"
        option-label="id"
        option-value="id"
        item-aligned
        @update:model-value="update"
        @keyup.enter.exact.stop
      >
        <q-tooltip v-if="tooltip">
          {{ tooltip }}
        </q-tooltip>
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey"> No results </q-item-section>
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
            <q-tooltip>Edit {{ local.id }}</q-tooltip>
          </q-btn>
          <q-btn
            v-else
            flat
            round
            icon="mdi-launch"
            disable
          />

          <q-btn
            v-if="creatable"
            flat
            round
            icon="add"
            @click="createBlock"
          >
            <q-tooltip>Create new Block</q-tooltip>
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
