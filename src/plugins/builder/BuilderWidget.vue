<script lang="ts">
import { nanoid } from 'nanoid';
import { computed, defineComponent, onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useContext, useGlobals, useWidget } from '@/composables';
import { useSystemStore } from '@/store/system';
import { Widget } from '@/store/widgets';
import { concatById } from '@/utils/collections';
import { createDialog } from '@/utils/dialog';
import { uniqueFilter } from '@/utils/functional';
import { isAbsoluteUrl } from '@/utils/url';

import { useFlowParts, useSvgZoom, UseSvgZoomDimensions } from './composables';
import { DEFAULT_LAYOUT_HEIGHT, DEFAULT_LAYOUT_WIDTH } from './const';
import { useBuilderStore } from './store';
import {
  BuilderConfig,
  BuilderLayout,
  FlowPart,
  PersistentPart,
} from './types';
import { coord2grid } from './utils';

export default defineComponent({
  name: 'BuilderWidget',
  setup() {
    const systemStore = useSystemStore();
    const builderStore = useBuilderStore();
    const router = useRouter();
    const { inDialog } = useContext.setup();
    const { dense } = useGlobals.setup();
    const { widget, config, saveConfig } =
      useWidget.setup<Widget<BuilderConfig>>();

    const pending = ref<FlowPart | null>(null);
    const zoomEnabled = ref<boolean>(inDialog.value);

    const storeLayouts = computed<BuilderLayout[]>(() => builderStore.layouts);

    const layoutId = computed<string | null>(
      () => config.value.currentLayoutId,
    );

    const { layout, parts, flowParts, flowPartsRevision, calculateFlowParts } =
      useFlowParts.setup(layoutId);

    const gridDimensions = computed<UseSvgZoomDimensions>(() => ({
      width: coord2grid(layout.value?.width || 10),
      height: coord2grid(layout.value?.height || 10),
    }));

    const { svgRef, svgContentRef, resetZoom } = useSvgZoom.setup(
      gridDimensions,
      {
        dragEnabled: zoomEnabled,
        wheelEnabled: zoomEnabled,
      },
    );

    function navigate(url: string): void {
      if (isAbsoluteUrl(url)) {
        window.open(url, '_blank');
      } else {
        router.push(url);
      }
    }

    function startSelectLayout(): void {
      createDialog({
        component: 'SelectedLayoutDialog',
        componentProps: {
          modelValue: config.value.currentLayoutId,
        },
      }).onOk((id) => {
        config.value.currentLayoutId = id;
        saveConfig();
      });
    }

    function selectLayout(id: string | null): void {
      if (id) {
        config.value.layoutIds = [...config.value.layoutIds, id].filter(
          uniqueFilter,
        );
      }
      config.value.currentLayoutId = id;
      saveConfig(config.value);
    }

    function startEditor(): void {
      if (!dense.value) {
        router.push(`/builder/${layout.value?.id ?? ''}`);
      }
    }

    function savePart(part: PersistentPart): void {
      parts.value = concatById(parts.value, part);
    }

    const delayTouch = computed<boolean>(() => {
      const { builderTouchDelayed } = systemStore.config;
      return (
        builderTouchDelayed === 'always' ||
        (builderTouchDelayed === 'dense' && dense.value)
      );
    });

    function interact(part: FlowPart | null): void {
      if (!part) {
        return;
      }
      const handler = builderStore.spec(part).interactHandler;
      if (!handler) {
        return;
      }
      if (pending.value && pending.value.id === part.id) {
        handler(part, { savePart, navigate });
        pending.value = null;
      } else if (delayTouch.value) {
        pending.value = part;
      } else {
        handler(part, { savePart, navigate });
      }
    }

    async function migrate(): Promise<void> {
      const oldParts: PersistentPart[] = (config.value as any).parts;
      if (oldParts) {
        const id = nanoid();
        await builderStore.createLayout({
          id,
          title: `${widget.value.title} layout`,
          width: DEFAULT_LAYOUT_WIDTH,
          height: DEFAULT_LAYOUT_HEIGHT,
          parts: oldParts,
          order: builderStore.layouts.length + 1,
        });
        config.value.layoutIds.push(id);
        config.value.currentLayoutId = id;
        config.value['parts'] = undefined;
        saveConfig();
      }
    }

    onBeforeMount(() => migrate());

    return {
      coord2grid,
      startSelectLayout,
      inDialog,
      dense,
      svgRef,
      svgContentRef,
      startEditor,
      gridDimensions,
      parts,
      layout,
      storeLayouts,
      selectLayout,
      flowParts,
      flowPartsRevision,
      pending,
      interact,
      savePart,
      calculateFlowParts,
      resetZoom,
      zoomEnabled,
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
          <ActionItem
            icon="mdi-stretch-to-page-outline"
            label="Reset zoom"
            @click="resetZoom"
          />
        </template>
      </WidgetToolbar>
    </template>

    <div class="fit" @click="pending = null">
      <span v-if="parts.length === 0" class="absolute-center q-gutter-y-sm">
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
      <svg ref="svgRef" class="fit">
        <g ref="svgContentRef">
          <g
            v-for="part in flowParts"
            :key="`${flowPartsRevision}-${part.id}`"
            :transform="`translate(${coord2grid(part.x)}, ${coord2grid(
              part.y,
            )})`"
            :class="{
              [part.type]: true,
              pointer: part.canInteract,
              inactive: !!pending,
            }"
            @click.stop="interact(part)"
            @dblclick.stop
          >
            <PartWrapper
              :part="part"
              @update:part="savePart"
              @dirty="calculateFlowParts"
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
              :transform="`translate(${coord2grid(pending.x)}, ${coord2grid(
                pending.y,
              )})`"
              class="pointer"
              @click.stop="interact(pending)"
            >
              <PartWrapper
                :part="pending"
                @update:part="savePart"
                @dirty="calculateFlowParts"
              />
            </g>
          </template>
        </g>
      </svg>
      <q-toggle
        v-if="!inDialog"
        v-model="zoomEnabled"
        class="absolute-top-right q-ma-sm"
        icon="mdi-arrow-all"
        left-label
      />
    </div>
  </Card>
</template>

<style lang="sass" scoped>
@import './grid.sass'

.inactive
  opacity: 0.1
</style>
