<script lang="ts">
import { nanoid } from 'nanoid';
import { debounce } from 'quasar';
import { computed, defineComponent, nextTick, onBeforeMount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useGlobals, useWidget } from '@/composables';
import { systemStore } from '@/store/system';
import { Widget } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { spliceById, uniqueFilter } from '@/utils/functional';

import { calculateNormalizedFlows } from './calculateFlows';
import { defaultLayoutHeight, defaultLayoutWidth } from './const';
import { builderStore } from './store';
import { BuilderConfig, BuilderLayout, FlowPart, PartUpdater, PersistentPart } from './types';
import { asPersistentPart, asStatePart, squares, vivifyParts } from './utils';

export default defineComponent({
  name: 'BuilderWidget',
  setup() {
    const router = useRouter();
    const { dense } = useGlobals.setup();
    const {
      widget,
      config,
      saveConfig,
    } = useWidget.setup<Widget<BuilderConfig>>();

    const flowParts = ref<FlowPart[]>([]);
    const pending = ref<FlowPart | null>(null);

    const calculate = debounce(
      async () => {
        await nextTick();
        flowParts.value = calculateNormalizedFlows(parts.value.map(asStatePart));
      },
      200,
      false,
    );

    const storeLayouts = computed<BuilderLayout[]>(
      () => builderStore.layouts,
    );

    const layout = computed<BuilderLayout | null>(
      () => builderStore.layoutById(config.value.currentLayoutId),
    );

    function startSelectLayout(): void {
      createDialog({
        component: 'SelectedLayoutDialog',
        componentProps: {
          modelValue: config.value.currentLayoutId,
        },
      })
        .onOk(id => {
          config.value.currentLayoutId = id;
          saveConfig();
        });
    }

    function selectLayout(id: string | null): void {
      if (id) {
        config.value.layoutIds = [...config.value.layoutIds, id].filter(uniqueFilter);
      }
      config.value.currentLayoutId = id;
      saveConfig(config.value);
    }

    const gridViewBox = computed<string>(
      () => {
        const gridHeight = squares(layout.value?.height ?? 10);
        const gridWidth = squares(layout.value?.width ?? 10);
        return [0, 0, gridWidth, gridHeight].join(' ');
      },
    );

    function startEditor(): void {
      if (!dense.value) {
        router.push(`/builder/${layout.value?.id ?? ''}`);
      }
    }

    async function saveParts(parts: PersistentPart[]): Promise<void> {
      if (!layout.value) {
        return;
      }

      // first set local value, to avoid jitters caused by the period between action and vueX refresh
      layout.value.parts = parts.map(asPersistentPart);
      await builderStore.saveLayout(layout.value);
      await calculate();
    }

    async function savePart(part: PersistentPart): Promise<void> {
      await saveParts(spliceById(parts.value, part));
    }

    const parts = computed<PersistentPart[]>(
      () => layout.value !== null
        ? vivifyParts(layout.value.parts)
        : [],
    );

    const updater = computed<PartUpdater>(
      () => ({
        updatePart: savePart,
      }),
    );

    const delayTouch = computed<boolean>(
      () => {
        const { builderTouchDelayed } = systemStore.config;
        return builderTouchDelayed === 'always'
          || (builderTouchDelayed === 'dense' && dense.value);
      },
    );


    function isClickable(part: FlowPart): boolean {
      return builderStore.spec(part).interactHandler !== undefined;
    }

    function interact(part: FlowPart | null): void {
      if (!part) {
        return;
      }
      const handler = builderStore.spec(part).interactHandler;
      if (!handler) {
        return;
      }
      if (pending.value && pending.value.id === part.id) {
        handler(part, updater.value);
        pending.value = null;
      }
      else if (delayTouch.value) {
        pending.value = part;
      }
      else {
        handler(part, updater.value);
      }
    }

    async function migrate(): Promise<void> {
      const oldParts: PersistentPart[] = (config.value as any).parts;
      if (oldParts) {
        const id = nanoid();
        await builderStore.createLayout({
          id,
          title: `${widget.value.title} layout`,
          width: defaultLayoutWidth,
          height: defaultLayoutHeight,
          parts: oldParts,
        });
        config.value.layoutIds.push(id);
        config.value.currentLayoutId = id;
        config.value['parts'] = undefined;
        saveConfig();
      }
    }

    watch(
      () => layout.value,
      () => calculate(),
      { immediate: true },
    );

    onBeforeMount(() => migrate());

    return {
      squares,
      startSelectLayout,
      dense,
      startEditor,
      parts,
      layout,
      storeLayouts,
      selectLayout,
      gridViewBox,
      flowParts,
      isClickable,
      pending,
      interact,
      savePart,
      calculate,
    };
  },
});
</script>

<template>
  <Card no-scroll>
    <template #toolbar>
      <WidgetToolbar>
        <q-btn
          flat
          dense
          round
          icon="mdi-format-list-bulleted"
          @click="startSelectLayout"
        >
          <q-tooltip>Select layout</q-tooltip>
        </q-btn>
        <template #actions>
          <ActionItem
            v-if="!dense"
            icon="mdi-tools"
            label="Edit layout"
            @click="startEditor"
          />
        </template>
      </WidgetToolbar>
    </template>

    <div class="fit" @click="pending = null">
      <span
        v-if="parts.length === 0"
        class="absolute-center q-gutter-y-sm"
      >
        <div class="text-center">
          {{ layout === null ? 'No layout selected' : 'Layout is empty' }}
        </div>
        <div class="row q-gutter-x-sm justify-center">
          <q-btn
            v-if="storeLayouts.length > 0"
            fab-mini
            color="secondary"
            icon="mdi-format-list-bulleted"
            @click="startSelectLayout"
          >
            <q-tooltip>Select layout</q-tooltip>
          </q-btn>
          <BuilderActions
            fab-mini
            :flat="false"
            :layout="layout"
            color="secondary"
            @selected="selectLayout"
          >
            <q-tooltip>Actions</q-tooltip>
          </BuilderActions>
          <q-btn
            v-if="layout !== null"
            fab-mini
            color="secondary"
            icon="mdi-tools"
            @click="startEditor"
          >
            <q-tooltip>Edit layout</q-tooltip>
          </q-btn>
        </div>
      </span>
      <svg
        :viewBox="gridViewBox"
        class="fit q-pa-md"
      >
        <g
          v-for="part in flowParts"
          :key="part.id"
          :transform="`translate(${squares(part.x)}, ${squares(part.y)})`"
          :class="{
            [part.type]: true,
            pointer: isClickable(part),
            inactive: !!pending
          }"
          @click.stop="interact(part)"
        >
          <PartWrapper
            :part="part"
            @update:part="savePart"
            @dirty="calculate"
          />
        </g>
        <template v-if="pending">
          <rect
            width="100%"
            height="100%"
            fill="black"
            opacity="0"
            @click.stop="pending = null"
          />
          <g
            :transform="`translate(${squares(pending.x)}, ${squares(pending.y)})`"
            class="pointer"
            @click.stop="interact(pending)"
          >
            <PartWrapper
              :part="pending"
              @update:part="savePart"
              @dirty="calculate"
            />
          </g>
        </template>
      </svg>
    </div>
  </Card>
</template>

<style lang="sass" scoped>
@import './grid.sass'

.inactive
  opacity: 0.1
</style>
