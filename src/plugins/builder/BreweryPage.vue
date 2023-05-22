<script setup lang="ts">
import { startupDone } from '@/user-settings';
import { useQuasar } from 'quasar';
import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useFlowParts, useSvgZoom, UseSvgZoomDimensions } from './composables';
import { useMetrics } from './composables/use-metrics';
import { usePreselect } from './composables/use-preselect';
import { BuilderPart } from './types';
import {
  coord2grid,
  startChangeLayoutTitle,
  startCreateLayout,
  startImportLayout,
} from './utils';

const props = defineProps({
  routeId: {
    type: String,
    default: '',
  },
});

const router = useRouter();
const { localStorage } = useQuasar();
const { preselectable, preselectedId, preselect } = usePreselect.setup();

const layoutId = computed<string | null>(() => props.routeId);

useMetrics.setupProvider(layoutId);
const { layout, orderedParts, updateParts, reflow } =
  useFlowParts.setup(layoutId);

const gridDimensions = computed<UseSvgZoomDimensions>(() => ({
  width: coord2grid(layout.value?.width || 10),
  height: coord2grid(layout.value?.height || 10),
}));

const { svgRef, svgContentRef, resetZoom } = useSvgZoom.setup(gridDimensions);

const layoutTitle = computed<string>(
  () => layout.value?.title ?? 'Builder layout',
);

function selectLayout(id: string): void {
  router.push(`/brewery/${id}`).catch(() => {});
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

function editTitle(): void {
  startChangeLayoutTitle(layout.value);
}

async function importLayout(): Promise<void> {
  startImportLayout((id) => selectLayout(id));
}

watch(
  () => layoutTitle.value,
  (title) => (document.title = `Brewblox | ${title}`),
  { immediate: true },
);

watch(
  () => layoutId.value,
  () => {
    try {
      localStorage.set('brewery-page', layoutId.value);
    } catch (e) {
      /* ignore */
    }
  },
);
</script>

<template>
  <q-page
    class="page-height"
    @contextmenu.prevent
  >
    <div
      v-if="!startupDone"
      class="text-h5 darkened absolute-center column items-center q-gutter-md"
    >
      <q-spinner size="30px" />
      <div>Waiting for datastore...</div>
    </div>
    <template v-else>
      <TitleTeleport>
        <span
          class="cursor-pointer"
          @click="editTitle"
        >
          {{ layoutTitle }}
        </span>
      </TitleTeleport>
      <ButtonsTeleport>
        <q-btn
          unelevated
          round
          icon="mdi-tools"
          class="self-center"
          :to="`/builder/${layoutId}`"
        >
          <q-tooltip>Open editor</q-tooltip>
        </q-btn>
        <ActionMenu
          round
          class="self-center"
          label="Layout actions"
        >
          <template #menus>
            <LayoutActionsMenu :layout="layout" />
          </template>
          <template #actions>
            <ActionItem
              label="New layout"
              icon="add"
              @click="startCreateLayout($router)"
            />
            <ActionItem
              icon="mdi-file-import"
              label="Import Layout"
              @click="importLayout"
            />
            <ActionItem
              label="Reset zoom"
              icon="mdi-stretch-to-page-outline"
              @click="resetZoom"
            />
          </template>
        </ActionMenu>
      </ButtonsTeleport>

      <div class="fit">
        <span
          v-if="orderedParts.length === 0"
          class="absolute-center"
        >
          {{ layout == null ? 'No layout selected' : 'Layout is empty' }}
        </span>
        <svg
          ref="svgRef"
          class="fit"
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
      </div>
    </template>
  </q-page>
</template>
