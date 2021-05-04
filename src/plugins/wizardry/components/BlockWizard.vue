<script lang="ts">
import isMatch from 'lodash/isMatch';
import { nanoid } from 'nanoid';
import { DialogChainObject } from 'quasar';
import { computed, defineComponent, onBeforeUnmount, PropType, ref } from 'vue';

import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { Block, BlockConfig, BlockSpec, ComparedBlockType } from '@/plugins/spark/types';
import { isCompatible, makeBlockIdRules } from '@/plugins/spark/utils';
import { tryCreateBlock, tryCreateWidget } from '@/plugins/wizardry';
import { featureStore } from '@/store/features';
import { Widget, widgetStore } from '@/store/widgets';
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
      default: () => true,
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
    const widgetId = nanoid();
    const dashboardId = ref<string | null>(null);
    const blockId = ref<string | null>(null);
    const searchFilter = ref<string>('');

    const activeBlock = ref<Block | null>(null);
    const activeWidget = ref<Widget<BlockConfig> | null>(null);
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
        ? makeBlockIdRules(serviceId.value)
        : [() => 'No service selected'],
    );

    const validator = computed<(v: any) => boolean>(
      () => ruleValidator(activeBlockIdRules.value),
    );

    const createReady = computed<boolean>(
      () => selected.value !== null
        && sparkModule.value !== null
        && (activeBlock.value !== null || validator.value(blockId.value)),
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
          modelValue: searchFilter.value,
        },
      })
        .onOk(v => searchFilter.value = v);
    }

    function showNameKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: blockId.value,
          rules: activeBlockIdRules.value,
        },
      })
        .onOk(v => blockId.value = v);
    }

    function ensureVolatile(): void {
      if (activeBlock.value
        && !isMatch(activeBlock.value, {
          id: blockId.value,
          serviceId: serviceId.value,
          type: selected.value?.value,
        })) {
        sparkStore.removeVolatileBlock(activeBlock.value);
        activeBlock.value = null;
      }

      if (!activeBlock.value
        && selected.value
        && blockId.value
        && serviceId.value
        && createReady.value) {
        sparkStore.setVolatileBlock({
          id: blockId.value,
          serviceId: serviceId.value,
          type: selected.value.value,
          groups: [0],
          data: sparkStore.spec({ type: selected.value.value }).generate(),
        });
        activeBlock.value = sparkStore.blockById(serviceId.value, blockId.value);
      }

      if (activeBlock.value) {
        const block = activeBlock.value;
        widgetStore.setVolatileWidget({
          id: widgetId,
          title: block.id,
          feature: block.type,
          dashboard: dashboardId.value ?? '',
          order: 0,
          config: {
            ...(activeWidget.value?.config ?? {}),
            serviceId: block.serviceId,
            blockId: block.id,
          },
          ...featureStore.widgetSize(block.type),
          volatile: true,
        });
        activeWidget.value = widgetStore.widgetById(widgetId);
      }
    }

    function selectOpt(opt: BlockWizardOption | null): void {
      selected.value = opt;
      if (opt === null) {
        return;
      }
      else if (!blockId.value || blockId.value === lastGeneratedId.value) {
        blockId.value = suggestId(opt.label, validator.value);
        lastGeneratedId.value = blockId.value;
      }
    }

    function configureBlock(): void {
      if (!createReady.value || !serviceId.value || !sparkModule.value) {
        return;
      }
      ensureVolatile();
      if (activeBlock.value && activeWidget.value) {
        activeDialog.value = createDialog({
          component: 'WidgetDialog',
          componentProps: {
            widgetId,
            mode: 'Full',
          },
        });
      }
    }

    function reset(): void {
      discoveryActive.value = false;
      setDialogTitle('Block wizard');
    }

    async function createBlock(): Promise<void> {
      if (!createReady.value || !serviceId.value || !sparkModule.value) {
        return;
      }
      ensureVolatile();

      if (!activeBlock.value || !activeWidget.value) {
        return;
      }

      const persistentBlock = { ...activeBlock.value, meta: undefined };
      const createdBlock = await tryCreateBlock(persistentBlock);

      if (!createdBlock) {
        return close();
      }

      const persistentWidget = { ...activeWidget.value, volatile: undefined };
      const createdWidget = dashboardId.value
        ? await tryCreateWidget(persistentWidget)
        : null;

      onDone({ block: createdBlock, widget: createdWidget });
    }

    onBeforeUnmount(() => {
      if (activeBlock.value) {
        sparkStore.removeVolatileBlock(activeBlock.value);
      }
      if (activeWidget.value) {
        widgetStore.removeVolatileWidget(activeWidget.value);
      }
    });

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

  <WizardBody v-else>
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
        :model-value="selected"
        :options="searchedOpts"
        option-value="value"
        option-label="label"
        @update:model-value="selectOpt"
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
  </WizardBody>
</template>
