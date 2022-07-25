<script lang="ts">
import { useSparkStore } from '@/plugins/spark/store';
import { BlockConfig } from '@/plugins/spark/types';
import {
  discoverBlocks,
  makeBlockIdRules,
} from '@/plugins/spark/utils/configuration';
import { tryCreateWidget } from '@/plugins/wizardry';
import { useWidgetWizard } from '@/plugins/wizardry/composables';
import { createBlockDialog } from '@/utils/block-dialog';
import { createDialog } from '@/utils/dialog';
import { Block } from 'brewblox-proto/ts';
import { computed, defineComponent, ref, watch } from 'vue';

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
  emits: [...useWidgetWizard.emits],
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
    const sparkStore = useSparkStore();

    setDialogTitle(`${featureTitle} wizard`);

    const serviceId = ref<string>(
      props.activeServiceId || sparkStore.serviceIds[0],
    );
    const dashboardId = ref<string | null>(null);
    const selectedBlock = ref<Block | null>(null);
    const busy = ref(false);

    watch(
      () => serviceId.value,
      (newV, oldV) => {
        if (newV !== oldV) {
          selectedBlock.value = null;
        }
      },
    );

    const serviceOpts = computed<SelectOption<string>[]>(() =>
      sparkStore.serviceIds.map((id) => ({
        label: id,
        value: id,
      })),
    );

    const blockOpts = computed<Block[]>(() =>
      sparkStore
        .blocksByService(serviceId.value)
        .filter((v) => v.type === props.featureId),
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
      }).onOk(async (newId: string) => {
        await sparkStore.renameBlock(serviceId, blockId, newId);
        if (selectedBlock.value?.id === blockId) {
          selectedBlock.value = sparkStore.blockById(serviceId, newId);
        }
      });
    }

    async function discover(): Promise<void> {
      busy.value = true;
      await discoverBlocks(props.activeServiceId).finally(
        () => (busy.value = false),
      );
    }

    async function finish(): Promise<void> {
      if (!selectedBlock.value) {
        return;
      }

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
      } else if (props.optionalWidget) {
        onDone({ block: selectedBlock.value });
      }
    }

    return {
      onBack,
      onClose,
      featureTitle,
      dashboardId,
      serviceId,
      selectedBlock,
      busy,
      serviceOpts,
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
  <WizardBody>
    <div class="widget-body column">
      <DashboardSelect
        v-model="dashboardId"
        :default-value="activeDashboardId"
        :label="optionalWidget ? 'Show on dashboard (optional)' : 'Dashboard'"
        :clearable="optionalWidget"
      />

      <q-select
        v-if="serviceOpts.length > 1"
        v-model="serviceId"
        :options="serviceOpts"
        label="Service"
        emit-value
        map-options
      />

      <CardWarning v-if="serviceOpts.length === 0">
        <template #message> There are no Spark services available </template>
      </CardWarning>
      <div
        v-else
        class="q-pa-sm q-mt-md"
      >
        {{ featureTitle }} blocks are linked to hardware, and must be
        discovered. <br />
        If a block is not shown below, please ensure it is plugged in, and click
        Discover.
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
  </WizardBody>
</template>
