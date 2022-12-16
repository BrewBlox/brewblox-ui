<script lang="ts">
import { useContext, useGlobals, useWidget } from '@/composables';
import { Widget } from '@/store/widgets';
import { concatById } from '@/utils/collections';
import { createDialog } from '@/utils/dialog';
import { uniqueFilter } from '@/utils/functional';
import { computed, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFlowParts, useSvgZoom, UseSvgZoomDimensions } from './composables';
import { useMetrics } from './composables/use-metrics';
import { usePreselect } from './composables/use-preselect';
import { useBuilderStore } from './store';
import { BuilderConfig, BuilderLayout, PersistentPart } from './types';
import { coord2grid, coord2translate } from './utils';

export default defineComponent({
  name: 'BuilderWidget',
  setup() {
    const builderStore = useBuilderStore();
    const router = useRouter();
    const { inDialog } = useContext.setup();
    const { dense } = useGlobals.setup();
    const { config, patchConfig } = useWidget.setup<Widget<BuilderConfig>>();
    const { preselectable, preselectedId, preselect } = usePreselect.setup();
    const zoomEnabled = ref<boolean>(inDialog.value);

    const storeLayouts = computed<BuilderLayout[]>(() => builderStore.layouts);

    const layoutId = computed<string | null>(
      () => config.value.currentLayoutId,
    );

    useMetrics.setupProvider(layoutId);
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

    return {
      coord2grid,
      coord2translate,
      startSelectLayout,
      inDialog,
      dense,
      svgRef,
      svgContentRef,
      preselectable,
      preselectedId,
      preselect,
      startEditor,
      gridDimensions,
      parts,
      layout,
      storeLayouts,
      selectLayout,
      flowParts,
      flowPartsRevision,
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

    <div class="fit">
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
        @click="preselect(null)"
      >
        <g ref="svgContentRef">
          <g
            v-for="part in flowParts"
            :key="`${flowPartsRevision}-${part.id}`"
            :class="['flowpart', part.type]"
          >
            <PartWrapper
              :id="part.id"
              :part="part"
              :coord-x="part.x"
              :coord-y="part.y"
              :interactable="!preselectable || preselectedId === part.id"
              :preselectable="preselectable"
              :deselected="preselectedId != null && preselectedId !== part.id"
              @update:part="savePart"
              @reflow="calculateFlowParts"
              @preselect="preselect(part.id)"
            />
          </g>
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
