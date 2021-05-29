<script lang="ts">
import mapValues from 'lodash/mapValues';
import { computed, defineComponent, PropType, ref } from 'vue';

import { useDialog } from '@/composables';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockAddress, BlockFieldSpec, BlockType, SparkService } from '@/plugins/spark/types';
import { makeBlockGraphConfig } from '@/plugins/spark/utils';
import { createBlockDialog } from '@/utils/dialog';

import { GraphConfig } from '../types';

export default defineComponent({
  name: 'SelectBlockGraphDialog',
  props: {
    ...useDialog.props,
    address: {
      type: Object as PropType<BlockAddress | null>,
      default: null,
    },
    title: {
      type: String,
      default: 'Add block to graph',
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

    const services = computed<SparkService[]>(
      () => sparkStore.modules.map(m => m.service),
    );

    const block = ref<Block | null>(sparkStore.blockByAddress(props.address));
    const service = ref<SparkService | null>(
      services.value.find(svc => svc.id === props.address?.serviceId)
      ?? null,
    );
    const selectedFields = ref<BlockFieldSpec[]>([]);

    const graphedTypes: BlockType[] =
      sparkStore
        .fieldSpecs
        .filter(f => f.graphed)
        .map(s => s.type);

    const blocks = computed<Block[]>(
      () => sparkStore
        .serviceBlocks(service.value?.id)
        .filter(block => graphedTypes.includes(block.type)),
    );

    const fields = computed<BlockFieldSpec[]>(
      () => sparkStore
        .fieldSpecsByType(block.value?.type)
        .filter(f => f.graphed),
    );

    function selectService(v: SparkService | null): void {
      if (v?.id !== service.value?.id) {
        selectBlock(null);
      }
      service.value = v;
    }

    function selectBlock(v: Block | null): void {
      if (v?.id !== block.value?.id) {
        selectedFields.value = [];
      }
      block.value = v;
    }

    function save(): void {
      if (!block.value || !selectedFields.value.length) {
        return;
      }
      const blockId = block.value.id;
      const cfg = makeBlockGraphConfig(
        block.value,
        {},
        v => selectedFields.value.some(f => f.key === v.key));
      const sanitized: GraphConfig = {
        ...cfg,
        layout: {},
        params: {},
        renames: mapValues(cfg.renames, v => `[${blockId}] ${v}`),
      };
      onDialogOK(sanitized);
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      services,
      block,
      service,
      selectedFields,
      graphedTypes,
      blocks,
      fields,
      selectService,
      selectBlock,
      createBlockDialog,
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
      <div class="q-pa-sm q-gutter-md">
        <div
          v-if="services.length === 0"
          class="text-italic fade-2"
        >
          No Spark services found
        </div>
        <ListSelect
          :model-value="service"
          :options="services"
          option-value="id"
          option-label="title"
          @update:model-value="selectService"
          @confirm="selectService"
        />
        <q-select
          :model-value="block"
          :disable="!service"
          :options="blocks"
          label="Block"
          option-label="id"
          option-value="id"
          @update:model-value="selectBlock"
          @keyup.enter.exact.stop
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
          <template #after>
            <q-btn
              :disable="!block"
              flat
              dense
              icon="mdi-launch"
              class="self-end"
              @click.stop="createBlockDialog(block)"
            >
              <q-tooltip>Show block</q-tooltip>
            </q-btn>
          </template>
        </q-select>
        <ListMultiSelect
          v-model="selectedFields"
          :options="fields"
          option-value="key"
          option-label="title"
        />
      </div>
      <template #actions>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          :disable="!block || !selectedFields.length"
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
