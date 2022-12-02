<script lang="ts">
import { useContext, useGlobals, useWidget } from '@/composables';
import { Widget } from '@/store/widgets';
import { userUISettings } from '@/user-settings';
import { concatById } from '@/utils/collections';
import { createDialog } from '@/utils/dialog';
import { uniqueFilter } from '@/utils/functional';
import { computed, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFlowParts, useSvgZoom, UseSvgZoomDimensions } from './composables';
import { useMetrics } from './composables/use-metrics';
import { useBuilderStore } from './store';
import {
  BuilderConfig,
  BuilderLayout,
  FlowPart,
  PersistentPart,
} from './types';
import { coord2grid, coord2translate } from './utils';

export default defineComponent({
  name: 'BuilderWidget',
  setup() {
    const builderStore = useBuilderStore();
    const router = useRouter();
    const { inDialog } = useContext.setup();
    const { dense } = useGlobals.setup();
    const { config, patchConfig } = useWidget.setup<Widget<BuilderConfig>>();

    const pending = ref<FlowPart | null>(null);
    const zoomEnabled = ref<boolean>(inDialog.value);

    const storeLayouts = computed<BuilderLayout[]>(() => builderStore.layouts);

    const layoutId = computed<string | null>(
      () => config.value.currentLayoutId,
    );

    useMetrics.setup(layoutId);
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

    function startSelectLayout(): void {
      createDialog({
        component: 'SelectedLayoutDialog',
        componentProps: {
          modelValue: config.value.currentLayoutId,
        },
      }).onOk((id) => {
        patchConfig({ currentLayoutId: id });
      });
    }

    function selectLayout(id: string | null): void {
      if (id) {
        config.value.layoutIds = [...config.value.layoutIds, id].filter(
          uniqueFilter,
        );
      }
      patchConfig({ currentLayoutId: id });
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
      const delayed = userUISettings.value.builderTouchDelayed;
      return delayed === 'always' || (delayed === 'dense' && dense.value);
    });

    return {
      coord2grid,
      coord2translate,
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
      delayTouch,
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

    <div
      class="fit"
      @click="pending = null"
    >
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
        ref="svgRef"
        class="fit"
      >
        <g ref="svgContentRef">
          <g
            v-for="part in flowParts"
            :key="`${flowPartsRevision}-${part.id}`"
            :transform="coord2translate(part.x, part.y)"
            :class="{
              [part.type]: true,
              inactive: pending != null,
            }"
          >
            <PartWrapper
              :part="part"
              :interactable="!delayTouch"
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
            <g :transform="coord2translate(pending.x, pending.y)">
              <PartWrapper
                :part="pending"
                interactable
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
