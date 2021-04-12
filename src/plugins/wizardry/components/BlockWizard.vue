<script lang="ts">
import { nanoid } from 'nanoid';
import { DialogChainObject } from 'quasar';
import { computed, defineComponent, PropType, ref } from 'vue';

import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import type { Block, BlockCrud, BlockSpec, ComparedBlockType } from '@/plugins/spark/types';
import { blockIdRules, isCompatible } from '@/plugins/spark/utils';
import { tryCreateBlock, tryCreateWidget } from '@/plugins/wizardry';
import { Widget } from '@/store/dashboards';
import { featureStore } from '@/store/features';
import { createDialog } from '@/utils/dialog';
import { nullFilter, objectStringSorter, ruleValidator, suggestId } from '@/utils/functional';

import { useWizard } from '../composables';

interface BlockWizardOption extends SelectOption {
  spec: BlockSpec;
}

export default defineComponent({
  name: 'BlockWizard',
  props: {
    ...useWizard.props,
    activeServiceId: {
      type: String,
      default: null,
    },
    compatible: {
      type: [String, Array] as PropType<ComparedBlockType>,
      default: null,
    },
    filter: {
      type: Function as PropType<(feature: string) => boolean>,
      default: () => () => true,
    },
  },
  emits: [
    ...useWizard.emits,
  ],
  setup(props) {
    const {
      onBack,
      onClose,
      onDone,
      setDialogTitle,
    } = useWizard.setup();

    const selected = ref<BlockWizardOption | null>(null);
    const lastGeneratedId = ref<string>('');
    const serviceId = ref<string | null>(
      props.activeServiceId
      ?? sparkStore.serviceIds[0]
      ?? null,
    );
    const dashboardId = ref<string | null>(null);
    const blockId = ref<string | null>(null);
    const searchFilter = ref<string>('');

    const selectedBlock = ref<Block | null>(null);
    const activeDialog = ref<DialogChainObject | null>(null);
    const discoveryActive = ref<boolean>(false);

    const serviceOpts = computed<string[]>(
      () => sparkStore.serviceIds,
    );

    const wizardOpts = computed<BlockWizardOption[]>(
      () => sparkStore
        .specs
        .filter(spec =>
          !spec.systemObject
          && isCompatible(spec.id, props.compatible)
          && props.filter(spec.id))
        .map(spec => {
          const feature = featureStore.widgetById(spec.id);
          return feature
            ? { spec, value: spec.id, label: feature.title }
            : null;
        })
        .filter(nullFilter)
        .sort(objectStringSorter('label')),
    );

    const sparkModule = computed<SparkServiceModule | null>(
      () => sparkStore.moduleById(serviceId.value),
    );

    const activeBlockIdRules = computed<InputRule[]>(
      () => serviceId.value
        ? blockIdRules(serviceId.value)
        : [() => 'No service selected'],
    );

    const validator = computed<(v: any) => boolean>(
      () => ruleValidator(activeBlockIdRules.value),
    );

    const createReady = computed<boolean>(
      () => selected.value !== null
        && sparkModule.value !== null
        && validator.value(blockId.value),
    );

    const discoveredType = computed<boolean>(
      () => selected.value?.spec.discovered === true,
    );

    const searchedOpts = computed<SelectOption[]>(
      () => {
        if (!searchFilter.value) {
          return wizardOpts.value;
        }
        const needle = searchFilter.value.toLowerCase();
        return wizardOpts.value
          .filter(opt => opt.label.toLowerCase().match(needle));
      },
    );

    function showSearchKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          value: searchFilter.value,
        },
      })
        .onOk(v => searchFilter.value = v);
    }

    function showNameKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          value: blockId.value,
          rules: activeBlockIdRules.value,
        },
      })
        .onOk(v => blockId.value = v);
    }

    function selectOpt(opt: BlockWizardOption | null): void {
      selectedBlock.value = null;

      selected.value = opt;
      if (opt === null) {
        return;
      }
      else if (!blockId.value || blockId.value === lastGeneratedId.value) {
        blockId.value = suggestId(opt.label, validator.value);
        lastGeneratedId.value = blockId.value;
      }
    }

    function ensureLocals(serviceId: string): { block: Block; widget: Widget } {
      if (selectedBlock.value?.serviceId !== serviceId) {
        selectedBlock.value = null;
      }

      const featureId = selected.value!.value;
      const newBlockId = blockId.value!;

      const newBlock: Block = selectedBlock.value ?? {
        id: newBlockId,
        serviceId,
        type: featureId,
        groups: [0],
        data: sparkStore.spec({ type: featureId }).generate(),
      };
      const widget: Widget = {
        id: nanoid(),
        title: newBlockId,
        feature: featureId,
        dashboard: dashboardId.value ?? '',
        order: 0,
        config: {
          serviceId,
          blockId: newBlockId,
        },
        ...featureStore.widgetSize(featureId),
      };

      selectedBlock.value = newBlock;
      selectedBlock.value.id = newBlockId;

      return { block: newBlock, widget };
    }

    function closeDialog(): void {
      if (activeDialog.value) {
        activeDialog.value.hide();
        activeDialog.value = null;
      }
    }

    function configureBlock(): void {
      if (!createReady.value || !serviceId.value || !sparkModule.value) {
        return;
      }
      const { block, widget } = ensureLocals(serviceId.value);
      const crud: BlockCrud = {
        block,
        widget,
        isStoreWidget: false,
        saveWidget: () => { },
        isStoreBlock: false,
        saveBlock: v => { selectedBlock.value = v; },
        closeDialog,
      };
      activeDialog.value = createDialog({
        component: 'WidgetDialog',
        componentProps: {
          getCrud: () => crud,
          mode: 'Full',
        },
      });
    }

    function reset(): void {
      discoveryActive.value = false;
      setDialogTitle('Block wizard');
    }

    async function createBlock(): Promise<void> {
      if (!createReady.value || !serviceId.value || !sparkModule.value) {
        return;
      }
      const { block, widget } = ensureLocals(serviceId.value);

      const createdBlock = await tryCreateBlock(block);

      if (!createdBlock) {
        return close();
      }

      const createdWidget = dashboardId.value
        ? await tryCreateWidget(widget)
        : null;

      return onDone({ block: createdBlock, widget: createdWidget });
    }

    return {
      onBack,
      onClose,
      onDone,
      setDialogTitle,
      selected,
      serviceId,
      dashboardId,
      blockId,
      searchFilter,
      selectedBlock,
      discoveryActive,
      serviceOpts,
      wizardOpts,
      activeBlockIdRules,
      validator,
      createReady,
      discoveredType,
      searchedOpts,
      showSearchKeyboard,
      showNameKeyboard,
      selectOpt,
      configureBlock,
      reset,
      createBlock,
    };
  },
});
</script>

<template>
  <BlockDiscoveryWizard
    v-if="discoveryActive && selected"
    :feature-id="selected.value"
    :active-dashboard-id="dashboardId"
    :active-service-id="serviceId"
    optional-widget
    @title="setDialogTitle"
    @back="reset"
    @close="onClose"
    @done="onDone"
  />

  <ActionCardBody v-else>
    <div class="widget-body column">
      <q-select
        v-model="serviceId"
        :options="serviceOpts"
        label="Service"
        @keyup.enter.exact.stop
      />

      <DashboardSelect
        v-model="dashboardId"
        label="Show on dashboard (optional)"
        clearable
      />

      <q-input
        v-model="searchFilter"
        placeholder="Search"
        clearable
        autofocus
        class="q-mb-md"
      >
        <template #append>
          <KeyboardButton @click="showSearchKeyboard" />
          <q-icon name="search" />
        </template>
      </q-input>

      <ListSelect
        :value="selected"
        :options="searchedOpts"
        option-value="value"
        option-label="label"
        @input="selectOpt"
        @confirm="v => { selectOpt(v); createBlock(); }"
      />
    </div>

    <template #actions>
      <q-input
        v-model="blockId"
        :disable="discoveredType"
        :rules="activeBlockIdRules"
        label="Block name"
        clearable
        class="col-12"
      >
        <template #append>
          <KeyboardButton @click="showNameKeyboard" />
          <q-icon name="mdi-information">
            <q-tooltip>
              The name of the Spark Controller block.
              <br>Multiple widgets can display the same block.
              <br>Rules:
              <ul>
                <li>The name must not be empty.</li>
                <li>The name must be unique.</li>
                <li>The name must begin with a letter.</li>
                <li>The name may only contain alphanumeric characters, space, and _-()|.</li>
                <li>The name must be less than 200 characters.</li>
              </ul>
            </q-tooltip>
          </q-icon>
        </template>
      </q-input>
      <q-btn flat label="Back" @click="onBack" />
      <q-space />
      <template v-if="discoveredType">
        <q-btn
          unelevated
          label="Discover"
          color="primary"
          @click="discoveryActive = true"
        />
      </template>
      <template v-else>
        <q-btn
          :disable="!createReady"
          flat
          label="Configure"
          @click="configureBlock"
        />
        <q-btn
          :disable="!createReady"
          unelevated
          label="Create"
          color="primary"
          @click="createBlock"
        />
      </template>
    </template>
  </ActionCardBody>
</template>
