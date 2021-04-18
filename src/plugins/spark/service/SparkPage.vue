<script lang="ts">
import { SessionStorage } from 'quasar';
import {
  ComponentPublicInstance,
  computed,
  defineComponent,
  nextTick,
  onBeforeUpdate,
  ref,
  watch,
} from 'vue';

import { useGlobals } from '@/composables';
import { roleIcons } from '@/plugins/spark/getters';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import type {
  Block,
  BlockConfig,
  BlockType,
  PageMode,
  RelationEdge,
  RelationNode,
  SparkService,
  SparkSessionConfig,
  SparkStatus,
} from '@/plugins/spark/types';
import { createBlockWizard } from '@/plugins/wizardry';
import { featureStore, WidgetContext } from '@/store/features';
import { serviceStore } from '@/store/services';
import { Widget, widgetStore } from '@/store/widgets';
import { createBlockDialog, createDialog } from '@/utils/dialog';
import { capitalized, mutate, objectStringSorter } from '@/utils/functional';

import SparkWidget from './SparkWidget.vue';
import SparkWidgetDialog from './SparkWidgetDialog.vue';
import Troubleshooter from './Troubleshooter.vue';
import { ValidatedWidget } from './types';
import { blockSorters, defaultSessionConfig, storageKey } from './utils';

const context: WidgetContext = {
  mode: 'Basic',
  container: 'Dashboard',
  size: 'Content',
};
const allSorters = blockSorters();


export default defineComponent({
  name: 'SparkPage',
  components: {
    SparkWidget,
    SparkWidgetDialog,
    Troubleshooter,
  },
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { dense } = useGlobals.setup();
    const blockFilter = ref<string | null>(null);
    const sessionCfg = ref<SparkSessionConfig>(defaultSessionConfig());
    let itemRefs: Mapped<Element> = {};

    onBeforeUpdate(() => {
      itemRefs = {};
    });

    function setItemRef(el: ComponentPublicInstance | null, key: string): void {
      if (el) {
        itemRefs[key] = el.$el;
      }
    }

    const service = computed<SparkService | null>(
      () => serviceStore.serviceById(props.serviceId),
    );

    const title = computed<string>(
      () => service.value?.title ?? 'Spark service',
    );

    watch(
      () => title.value,
      (title) => {
        document.title = `Brewblox | ${title}`;
      },
    );

    const sparkModule = computed<SparkServiceModule | null>(
      () => sparkStore.moduleById(props.serviceId),
    );

    function loadSessionConfig(): void {
      try {
        sessionCfg.value = SessionStorage.getItem(storageKey(props.serviceId)) ?? defaultSessionConfig();
      }
      catch (e) {
        sessionCfg.value = defaultSessionConfig();
      }
    }

    function saveSessionConfig(): void {
      try {
        SessionStorage.set(storageKey(props.serviceId), sessionCfg.value);
      }
      catch (e) {
        // ignore
      }
    }

    watch(
      () => props.serviceId,
      (newV, oldV) => newV !== oldV && loadSessionConfig(),
      { immediate: true },
    );

    const isAvailable = computed<boolean>(
      () => service.value !== null
        && sparkModule.value !== null,
    );

    const isReady = computed<boolean>(
      () => isAvailable.value
        && sparkModule.value?.lastBlocks != null,
    );

    const status = computed<SparkStatus | null>(
      () => sparkModule.value?.status ?? null,
    );

    const statusNok = computed<boolean>(
      () => isAvailable.value
        && status.value !== null
        && (!status.value.isSynchronized || !!status.value.isUpdating),
    );

    const pageMode = computed<PageMode>({
      get: () => sessionCfg.value.pageMode ?? 'Relations',
      set: pageMode => {
        sessionCfg.value = { ...sessionCfg.value, pageMode };
        saveSessionConfig();
      },
    });

    const sorting = computed<string>({
      get: () => sessionCfg.value.sorting ?? 'unsorted',
      set: sorting => {
        sessionCfg.value = { ...sessionCfg.value, sorting };
        saveSessionConfig();
      },
    });

    const sorter = computed<(a: ValidatedWidget, b: ValidatedWidget) => number>(
      () => allSorters[sorting.value] ?? (() => 0),
    );

    const expandedBlocks = computed<Mapped<boolean>>({
      get: () => sessionCfg.value.expandedBlocks ?? {},
      set: expanded => {
        const expandedBlocks: Mapped<boolean> =
          [...sparkModule.value!.blockIds, '_service']
            .reduce((acc, id) => mutate<Mapped<boolean>>(acc, id, expanded[id] ?? false), {});
        sessionCfg.value = { ...sessionCfg.value, expandedBlocks };
        saveSessionConfig();
      },
    });

    const serviceExpanded = computed<boolean>({
      get: () => expandedBlocks.value['_service'] ?? false,
      set: v => expandedBlocks.value = { ...expandedBlocks.value, ['_service']: v },
    });

    const serviceShown = computed<boolean>(
      () => !blockFilter.value
        || Boolean(props.serviceId.match(RegExp(blockFilter.value, 'i'))),
    );

    function scrollTo(key: string): void {
      const el = itemRefs[key];
      if (el) {
        el.scrollIntoView();
      }
    }

    function showSearchKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: blockFilter.value,
        },
      })
        .onOk(v => blockFilter.value = v);
    }

    function selectService(): void {
      if (dense.value && isReady.value) {
        createDialog({
          component: 'SparkWidgetDialog',
          componentProps: {
            serviceId: props.serviceId,
          },
        });
      }
      else {
        serviceExpanded.value = true;
        scrollTo(props.serviceId);
      }
    }

    function updateExpandedBlock(id: string, val: boolean): void {
      expandedBlocks.value = { ...expandedBlocks.value, [id]: val };
      if (val) {
        nextTick(() => scrollTo(volatileKey(id)));
      }
    }

    function volatileKey(blockId: string): string {
      return `${props.serviceId}/${blockId}`;
    }

    function ensureWidget(block: Block): Widget<BlockConfig> {
      const key = volatileKey(block.id);
      const existing = widgetStore.widgetById(key);

      if (existing !== null
        && existing.config.blockId === block.id
        && existing.feature === block.type) {
        return existing;
      }
      else {
        const generated: Widget<BlockConfig> = {
          id: key,
          title: block.id,
          feature: block.type,
          order: 0,
          dashboard: '',
          config: {
            serviceId: props.serviceId,
            blockId: block.id,
          },
          ...featureStore.widgetSize(block.type),
          volatile: true,
        };
        widgetStore.setVolatileWidget(generated);
        return generated;
      }
    }

    function validateBlock(block: Block): ValidatedWidget {
      const { id } = block;
      const key = volatileKey(id);
      const widget = ensureWidget(block);

      const { component, error } = featureStore.widgetComponent(widget);
      const role = featureStore.widgetRole(widget.feature);
      const title = featureStore.widgetTitle(widget.feature);
      return {
        id,
        key,
        component,
        widget,
        error,
        role,
        title,
        icon: roleIcons[role] ?? '',
        expanded: expandedBlocks.value[id] ?? false,
      };
    }

    const validTypes = computed<BlockType[]>(
      () => sparkStore.specs.map(s => s.id),
    );

    const validatedItems = computed<ValidatedWidget[]>(
      () => sparkModule
        .value
        ?.blocks
        .filter(block => validTypes.value.includes(block.type))
        .map(validateBlock)
        ?? [],
    );

    const filteredItems = computed<ValidatedWidget[]>(
      () => {
        const filter = blockFilter.value
          ? RegExp(blockFilter.value, 'i')
          : null;
        return validatedItems
          .value
          .filter(val => !filter
            || val.id.match(filter)
            || val.title.match(filter))
          .sort(sorter.value);
      },
    );

    const expandedItems = computed<ValidatedWidget[]>(
      () => filteredItems.value.filter(item => item.expanded),
    );

    function expandAll(): void {
      expandedBlocks.value = [...sparkModule.value!.blockIds, '_service']
        .reduce((acc, id) => mutate<Mapped<boolean>>(acc, id, true), {});
    }

    function expandNone(): void {
      expandedBlocks.value = {};
    }

    function startDialog(component: string, args?: AnyDict): void {
      const componentProps = args ?? {
        serviceId: props.serviceId,
      };
      createDialog({
        component,
        componentProps,
      });
    }

    function startCreateBlock(): void {
      createBlockWizard(props.serviceId)
        .onOk(({ block }) => {
          if (block) {
            updateExpandedBlock(block.id, true);
          }
        });
    }

    const nodes = computed<RelationNode[]>(
      () => validatedItems.value
        .map(v => ({ id: v.id, type: v.title }))
        .sort(objectStringSorter('type')),
    );

    const edges = computed<RelationEdge[]>(
      () => sparkModule.value?.relations ?? [],
    );

    function controllerReboot(): void {
      sparkModule.value?.controllerReboot();
    }

    function serviceReboot(): void {
      sparkModule.value?.serviceReboot();
    }

    function onBlockClick(val: ValidatedWidget): void {
      if (dense.value) {
        createBlockDialog({
          serviceId: props.serviceId,
          id: val.id,
          type: null,
        },
          { mode: 'Basic' });
      }
      else if (val.expanded) {
        scrollTo(val.key);
      }
      else {
        updateExpandedBlock(val.id, true);
      }
    }

    return {
      context,
      allSorters,
      capitalized,
      dense,
      blockFilter,
      setItemRef,
      title,
      isAvailable,
      isReady,
      status,
      statusNok,
      pageMode,
      sorting,
      serviceShown,
      serviceExpanded,
      showSearchKeyboard,
      selectService,
      updateExpandedBlock,
      filteredItems,
      expandedItems,
      expandAll,
      expandNone,
      startDialog,
      startCreateBlock,
      nodes,
      edges,
      controllerReboot,
      serviceReboot,
      onBlockClick,
    };
  },
});
</script>

<template>
  <q-page class="page-height">
    <teleport to="#toolbar-title">
      {{ title }}
    </teleport>
    <teleport to="#toolbar-buttons">
      <q-btn-group rounded outline class="q-pa-xs self-center">
        <q-btn
          :unelevated="pageMode === 'List'"
          :outline="pageMode !== 'List'"
          color="primary"
          icon="mdi-format-list-checkbox"
          @click="pageMode = 'List'"
        >
          <q-tooltip>Show blocks as list</q-tooltip>
        </q-btn>
        <q-btn
          rounded
          :unelevated="pageMode === 'Relations'"
          :outline="pageMode !== 'Relations'"
          color="primary"
          icon="mdi-vector-line"
          @click="pageMode = 'Relations'"
        >
          <q-tooltip>Show blocks as diagram</q-tooltip>
        </q-btn>
      </q-btn-group>
      <ActionMenu
        :disable="!isReady || statusNok"
        round
        size="12px"
        class="self-center"
      >
        <q-tooltip>
          Service actions
        </q-tooltip>
        <template #menus>
          <SparkActions :service-id="serviceId" />
        </template>
      </ActionMenu>
    </teleport>

    <!-- Troubleshooter -->
    <div
      v-if="statusNok"
      class="q-pa-lg row"
    >
      <Troubleshooter
        :service-id="serviceId"
      />
    </div>

    <!-- Relations graph display -->
    <div
      v-else-if="pageMode === 'Relations'"
      class="fit"
      style="overflow: auto"
      @dblclick="startCreateBlock"
    >
      <RelationsDiagram
        :service-id="serviceId"
        :nodes="nodes"
        :edges="edges"
      />
    </div>

    <!-- Block list display -->
    <div
      v-else-if="pageMode === 'List'"
      class="fit q-pa-lg row no-wrap justify-start"
      @dblclick="startCreateBlock"
    >
      <q-scroll-area
        visible
        class="content-column rounded-borders bg-dark"
      >
        <q-list class="q-pr-md" @dblclick.stop.prevent>
          <!-- Selection controls -->
          <q-item class="q-mb-md">
            <q-item-section>
              <q-input v-model="blockFilter" placeholder="Search blocks" clearable>
                <template #append>
                  <KeyboardButton @click="showSearchKeyboard" />
                  <q-icon name="search" />
                </template>
              </q-input>
            </q-item-section>
            <q-item-section class="col-auto">
              <q-btn icon="mdi-sort" flat>
                <q-tooltip>Sort blocks</q-tooltip>
                <q-menu>
                  <q-list>
                    <ActionItem
                      v-for="(func, name) in allSorters"
                      :key="name"
                      :active="sorting === name"
                      :label="capitalized(name)"
                      @click="sorting = name"
                    />
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>
            <q-item-section v-if="!dense" class="col-auto">
              <q-btn flat round icon="mdi-checkbox-multiple-blank-outline" @click="expandNone">
                <q-tooltip>Unselect all</q-tooltip>
              </q-btn>
            </q-item-section>
            <q-item-section v-if="!dense" class="col-auto">
              <q-btn flat round icon="mdi-checkbox-multiple-marked" @click="expandAll">
                <q-tooltip>Select all</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
          <!-- Service -->
          <q-item v-if="serviceShown" class="text-white widget-index">
            <q-item-section v-if="!dense" side class="q-px-sm">
              <ToggleButton v-model="serviceExpanded" />
            </q-item-section>
            <q-item-section>
              <q-item class="non-selectable" clickable @click="selectService">
                <q-item-section avatar>
                  <q-icon name="mdi-information-variant" />
                  <q-tooltip>Device Info</q-tooltip>
                </q-item-section>
                <q-item-section>
                  <q-item-label caption class="text-italic">
                    Device info
                  </q-item-label>
                  <div style="font-size: larger">
                    {{ serviceId }}
                  </div>
                </q-item-section>
              </q-item>
            </q-item-section>
          </q-item>
          <!-- Blocks -->
          <q-item
            v-for="val in filteredItems"
            :key="`filtered-${val.key}`"
            class="non-selectable text-white widget-index"
          >
            <q-item-section v-if="!dense" side class="q-px-sm">
              <ToggleButton
                :model-value="val.expanded"
                @update:model-value="v => updateExpandedBlock(val.id, v)"
              />
            </q-item-section>
            <q-item-section>
              <q-item
                clickable
                @click="onBlockClick(val)"
              >
                <q-item-section avatar>
                  <q-icon :name="val.icon" />
                  <q-tooltip>{{ val.role }}</q-tooltip>
                </q-item-section>
                <q-item-section>
                  <q-item-label caption class="text-italic darkish">
                    {{ val.title }}
                  </q-item-label>
                  <div style="font-size: larger">
                    {{ val.id }}
                  </div>
                </q-item-section>
              </q-item>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <!-- Widget List -->
      <q-scroll-area
        v-if="!dense"
        visible
        class="content-column"
      >
        <q-list class="q-ml-lg q-pr-none" @dblclick.stop.prevent>
          <!-- Service -->
          <q-item
            v-if="serviceShown && serviceExpanded"
            :ref="el => setItemRef(el, serviceId)"
          >
            <q-item-section>
              <WidgetProvider :context="context" widget-id="">
                <SparkWidget v-if="isReady" :service-id="serviceId" />
              </WidgetProvider>
            </q-item-section>
          </q-item>
          <!-- Blocks -->
          <q-item
            v-for="val in expandedItems"
            :ref="el => setItemRef(el, val.key)"
            :key="`expanded-${val.key}`"
            class="q-pt-none q-pb-md"
          >
            <q-item-section>
              <WidgetProvider :context="context" :widget-id="val.key">
                <component
                  :is="val.component"
                  :error="val.error"
                />
              </WidgetProvider>
            </q-item-section>
          </q-item>
          <!-- Blank space to always be able to show a widget at the top -->
          <q-item class="page-height" @dblclick="startCreateBlock" />
        </q-list>
      </q-scroll-area>
    </div>
  </q-page>
</template>

<style lang="sass" scoped>
.widget-index
  padding: 0

.page-height
  height: calc(100vh - 40px - 30px - 50px)

.content-column
  width: 550px
  max-width: 100vw
  height: 100%

.selected-mode
  background-color: $secondary
</style>
