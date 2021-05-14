<script lang="ts">
import { nanoid } from 'nanoid';
import { computed, defineComponent, onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useGlobals, useWidget } from '@/composables';
import { systemStore } from '@/store/system';
import { Widget } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { spliceById, uniqueFilter } from '@/utils/functional';

import { useFlowParts, useSvgZoom, UseSvgZoomDimensions } from './composables';
import { defaultLayoutHeight, defaultLayoutWidth } from './const';
import { builderStore } from './store';
import { BuilderConfig, BuilderLayout, FlowPart, PersistentPart } from './types';
import { coord2grid } from './utils';

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

    const pending = ref<FlowPart | null>(null);
    const blocked = ref<boolean>(dense.value);

    const storeLayouts = computed<BuilderLayout[]>(
      () => builderStore.layouts,
    );

    const layoutId = computed<string | null>(
      () => config.value.currentLayoutId,
    );

    const {
      layout,
      parts,
      flowParts,
      flowPartsRevision,
      calculateFlowParts,
    } = useFlowParts.setup(layoutId);

    const gridDimensions = computed<UseSvgZoomDimensions>(
      () => ({
        width: coord2grid(layout.value?.width || 10),
        height: coord2grid(layout.value?.height || 10),
      }),
    );

    const {
      svgRef,
      svgContentRef,
      resetZoom,
    } = useSvgZoom.setup(gridDimensions);

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

    function startEditor(): void {
      if (!dense.value) {
        router.push(`/builder/${layout.value?.id ?? ''}`);
      }
    }

    function savePart(part: PersistentPart): void {
      parts.value = spliceById(parts.value, part);
    }

    const delayTouch = computed<boolean>(
      () => {
        const { builderTouchDelayed } = systemStore.config;
        return builderTouchDelayed === 'always'
          || (builderTouchDelayed === 'dense' && dense.value);
      },
    );

    function interact(part: FlowPart | null): void {
      if (!part) {
        return;
      }
      const handler = builderStore.spec(part).interactHandler;
      if (!handler) {
        return;
      }
      if (pending.value && pending.value.id === part.id) {
        handler(part, { savePart });
        pending.value = null;
      }
      else if (delayTouch.value) {
        pending.value = part;
      }
      else {
        handler(part, { savePart });
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

    onBeforeMount(() => migrate());

    return {
      coord2grid,
      startSelectLayout,
      dense,
      blocked,
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
      <svg ref="svgRef" class="fit">
        <g ref="svgContentRef">
          <g
            v-for="part in flowParts"
            :key="`${flowPartsRevision}-${part.id}`"
            :transform="`translate(${coord2grid(part.x)}, ${coord2grid(part.y)})`"
            :class="{
              [part.type]: true,
              pointer: part.canInteract,
              inactive: !!pending
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
              :transform="`translate(${coord2grid(pending.x)}, ${coord2grid(pending.y)})`"
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
      <div
        v-if="dense && blocked"
        class="absolute-top-left fit bg-dark"
        style="opacity: 0.4"
        @touchstart.stop
        @touchend.stop
        @touchmove.stop
      />
      <q-btn
        v-if="dense"
        class="absolute-top-right q-ma-sm"
        round
        unelevated
        :color="blocked ? 'secondary' : 'negative'"
        :icon="blocked ? 'mdi-gesture-swipe-vertical' : 'mdi-gesture-swipe-vertical'"
        @click="blocked = !blocked"
      />
    </div>
  </Card>
</template>

<style lang="sass" scoped>
@import './grid.sass'

.inactive
  opacity: 0.1
</style>
