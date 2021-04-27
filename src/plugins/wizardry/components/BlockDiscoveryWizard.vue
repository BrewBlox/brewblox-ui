<script lang="ts">

import { computed, defineComponent, ref, watch } from 'vue';

import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import type { Block, BlockConfig } from '@/plugins/spark/types';
import { discoverBlocks, makeBlockIdRules } from '@/plugins/spark/utils';
import { tryCreateWidget } from '@/plugins/wizardry';
import { useWidgetWizard } from '@/plugins/wizardry/composables';
import { createBlockDialog, createDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'BlockDiscoveryWizard',
  props: {
    ...useWidgetWizard.props,
    activeServiceId: {
      type: String,
      default: null,
    },
    optionalWidget: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    ...useWidgetWizard.emits,
  ],
  setup(props) {
    const {
      onBack,
      onClose,
      onDone,
      setDialogTitle,
      widgetId,
      featureTitle,
      defaultWidgetSize,
    } = useWidgetWizard.setup(props.featureId);

    setDialogTitle(`${featureTitle} wizard`);

    const dashboardId = ref<string | null>(null);
    const sparkModule = ref<SparkServiceModule | null>(
      sparkStore.moduleById(props.activeServiceId)
      ?? sparkStore.modules[0]
      ?? null,
    );
    const selectedBlock = ref<Block | null>(null);
    const busy = ref(false);

    watch(
      () => sparkModule.value,
      (newV, oldV) => {
        if (newV?.id !== oldV?.id) {
          selectedBlock.value = null;
        }
      },
    );

    const moduleOpts = computed<SelectOption<SparkServiceModule>[]>(
      () => sparkStore.modules
        .map(module => ({
          label: module.id,
          value: module,
        })),
    );

    const blockOpts = computed<Block[]>(
      () => sparkModule.value
        ?.blocks
        .filter(v => v.type === props.featureId)
        ?? [],
    );

    function confirmBlock(block: Block | null): void {
      selectedBlock.value = block;
      finish();
    }

    function startChangeBlockId(block: Block): void {
      const blockId = block.id;
      const serviceId = block.serviceId;
      createDialog({
        component: 'InputDialog',
        componentProps: {
          title: 'Change block name',
          message: `Choose a new name for '${blockId}'`,
          rules: makeBlockIdRules(serviceId),
          clearable: false,
          modelValue: blockId,
        },
      })
        .onOk(async (newId: string) => {
          await sparkModule.value?.renameBlock([blockId, newId]);
          if (selectedBlock.value?.id === blockId) {
            selectedBlock.value = sparkModule.value?.blockById(newId) ?? null;
          }
        });
    }

    async function discover(): Promise<void> {
      busy.value = true;
      await discoverBlocks(props.activeServiceId)
        .finally(() => busy.value = false);
    }

    async function finish(): Promise<void> {
      if (!selectedBlock.value) { return; }

      if (dashboardId.value) {
        const widget = await tryCreateWidget<BlockConfig>({
          id: widgetId,
          title: selectedBlock.value.id,
          feature: props.featureId,
          dashboard: dashboardId.value,
          order: 0,
          config: {
            serviceId: selectedBlock.value.serviceId,
            blockId: selectedBlock.value.id,
          },
          ...defaultWidgetSize,
        });
        onDone({ widget, block: selectedBlock.value });
      }
      else if (props.optionalWidget) {
        onDone({ block: selectedBlock.value });
      }
    }

    return {
      onBack,
      onClose,
      featureTitle,
      dashboardId,
      sparkModule,
      selectedBlock,
      busy,
      moduleOpts,
      blockOpts,
      confirmBlock,
      createBlockDialog,
      startChangeBlockId,
      discover,
      finish,
    };
  },
});
</script>

<template>
  <ActionCardBody>
    <div class="widget-body column">
      <DashboardSelect
        v-model="dashboardId"
        :default-value="activeDashboardId"
        :label="optionalWidget
          ? 'Show on dashboard (optional)'
          : 'Dashboard'"
        :clearable="optionalWidget"
      />

      <q-select
        v-if="moduleOpts.length > 1"
        v-model="sparkModule"
        :options="moduleOpts"
        label="Service"
        emit-value
        map-options
      />

      <CardWarning v-if="moduleOpts.length === 0">
        <template #message>
          There are no Spark services available
        </template>
      </CardWarning>
      <div v-else class="q-pa-sm q-mt-md">
        {{ featureTitle }} blocks are linked to hardware, and must be discovered. <br>
        If a block is not shown below, please ensure it is plugged in, and click Discover.
      </div>

      <ListSelect
        v-model="selectedBlock"
        :options="blockOpts"
        option-value="id"
        option-label="id"
        dense
        @confirm="confirmBlock"
      >
        <template #body="{ opt }">
          <div class="row">
            <div class="col-grow self-center">
              {{ opt.id }}
            </div>
            <q-btn
              flat
              icon="edit"
              @click.stop="startChangeBlockId(opt)"
            >
              <q-tooltip>Rename block</q-tooltip>
            </q-btn>
            <q-btn
              flat
              icon="mdi-launch"
              @click.stop="createBlockDialog(opt)"
            >
              <q-tooltip>Edit block</q-tooltip>
            </q-btn>
          </div>
        </template>
      </ListSelect>
    </div>

    <template #actions>
      <q-btn
        flat
        label="Back"
        @click="onBack"
      />
      <q-space />
      <q-btn
        :loading="busy"
        flat
        label="Discover"
        @click="discover"
      />
      <q-btn
        v-if="optionalWidget"
        :disable="!selectedBlock"
        unelevated
        label="Done"
        color="primary"
        @click="finish"
      />
      <q-btn
        v-else
        :disable="!selectedBlock || !dashboardId"
        unelevated
        label="Create widget"
        color="primary"
        @click="finish"
      />
    </template>
  </ActionCardBody>
</template>
