<script setup lang="ts">
import { useContext, useGlobals, useWidget } from '@/composables';
import { Widget } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { uniqueFilter } from '@/utils/functional';
import { nanoid } from 'nanoid';
import { computed, provide, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFlowParts, useSvgZoom, UseSvgZoomDimensions } from './composables';
import { useMetrics } from './composables/use-metrics';
import { usePreselect } from './composables/use-preselect';
import { useBuilderStore } from './store';
import { PortalIdKey } from './symbols';
import { BuilderConfig, BuilderLayout, BuilderPart } from './types';
import { coord2grid } from './utils';

const builderStore = useBuilderStore();
const router = useRouter();
const { inDialog } = useContext.setup();
const { dense } = useGlobals.setup();
const { config, patchConfig } = useWidget.setup<Widget<BuilderConfig>>();
const { preselectable, preselectedId, preselect } = usePreselect.setup();
const zoomEnabled = ref<boolean>(inDialog.value);

const storeLayouts = computed<BuilderLayout[]>(() => builderStore.layouts);

const layoutId = computed<string | null>(() => config.value.currentLayoutId);

const portalId = nanoid();
provide(PortalIdKey, portalId);

useMetrics.setupProvider(layoutId);
const { layout, orderedParts, updateParts, reflow } =
  useFlowParts.setup(layoutId);

const gridDimensions = computed<UseSvgZoomDimensions>(() => ({
  width: coord2grid(layout.value?.width || 10),
  height: coord2grid(layout.value?.height || 10),
}));

const { svgRef, svgContentRef, resetZoom } = useSvgZoom.setup(gridDimensions, {
  dragEnabled: zoomEnabled,
  wheelEnabled: zoomEnabled,
});

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

function patchPart(id: string, patch: Partial<BuilderPart>): void {
  updateParts((draft) => {
    const part = draft[id];
    draft[id] = { ...part, ...patch, id };
  });
}

function patchPartSettings(
  id: string,
  patch: Partial<BuilderPart['settings']>,
): void {
  updateParts((draft) => {
    const part = draft[id];
    part.settings = { ...part.settings, ...patch };
  });
}
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

    <svg
      ref="svgRef"
      class="absolute fit"
      @click="preselect(null)"
    >
      <g ref="svgContentRef">
        <g
          v-for="part in orderedParts"
          :key="part.id"
          :class="['flowpart', part.type]"
        >
          <PartWrapper
            :part="part"
            :interactable="!preselectable || preselectedId === part.id"
            :preselectable="preselectable"
            :dimmed="preselectedId != null && preselectedId !== part.id"
            @patch:part="(patch) => patchPart(part.id, patch)"
            @patch:settings="(patch) => patchPartSettings(part.id, patch)"
            @reflow="reflow"
            @preselect="preselect(part.id)"
          />
        </g>
      </g>
    </svg>
    <div
      class="absolute fit"
      style="pointer-events: none; overflow: hidden"
    >
      <portal-target :name="portalId" />
    </div>
    <q-toggle
      v-if="!inDialog"
      v-model="zoomEnabled"
      class="absolute-top-right q-ma-sm"
      icon="mdi-arrow-all"
      left-label
    />

    <span
      v-if="orderedParts.length === 0"
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
  </Card>
</template>
