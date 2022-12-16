<script lang="ts">
import { useGlobals } from '@/composables';
import { startupDone } from '@/user-settings';
import { concatById } from '@/utils/collections';
import { useQuasar } from 'quasar';
import { computed, defineComponent, watch } from 'vue';
import { useFlowParts, useSvgZoom, UseSvgZoomDimensions } from './composables';
import { useMetrics } from './composables/use-metrics';
import { usePreselect } from './composables/use-preselect';
import { PersistentPart } from './types';
import { coord2grid, coord2translate, startChangeLayoutTitle } from './utils';

export default defineComponent({
  name: 'BreweryPage',
  props: {
    routeId: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { dense } = useGlobals.setup();
    const { localStorage } = useQuasar();
    const { preselectable, preselectedId, preselect } = usePreselect.setup();

    const layoutId = computed<string | null>(() => props.routeId);

    useMetrics.setupProvider(layoutId);
    const { layout, parts, flowParts, flowPartsRevision, calculateFlowParts } =
      useFlowParts.setup(layoutId);

    const gridDimensions = computed<UseSvgZoomDimensions>(() => ({
      width: coord2grid(layout.value?.width || 10),
      height: coord2grid(layout.value?.height || 10),
    }));

    const { svgRef, svgContentRef, resetZoom } =
      useSvgZoom.setup(gridDimensions);

    const layoutTitle = computed<string>(
      () => layout.value?.title ?? 'Builder layout',
    );

    function savePart(part: PersistentPart): void {
      parts.value = concatById(parts.value, part);
    }

    function editTitle(): void {
      startChangeLayoutTitle(layout.value);
    }

    watch(
      () => layoutTitle.value,
      (title) => (document.title = `Brewblox | ${title}`),
      { immediate: true },
    );

    watch(
      () => layoutId.value,
      (newV, oldV) => {
        if (newV !== oldV) {
          flowParts.value = [];
        }
        try {
          localStorage.set('brewery-page', layoutId.value);
        } catch (e) {
          /* ignore */
        }
      },
    );

    return {
      coord2grid,
      dense,
      layoutId,
      layout,
      layoutTitle,
      editTitle,
      svgRef,
      svgContentRef,
      resetZoom,
      coord2translate,
      preselectable,
      preselectedId,
      preselect,
      startupDone,
      parts,
      flowParts,
      flowPartsRevision,
      savePart,
      calculateFlowParts,
    };
  },
});
</script>

<template>
  <q-page class="page-height">
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
            <LayoutActions :layout="layout" />
          </template>
          <template #actions>
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
          v-if="parts.length === 0"
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
              v-for="part in flowParts"
              :key="`${flowPartsRevision}-${part.id}`"
              :class="['flowpart', part.type]"
            >
              <PartWrapper
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
      </div>
    </template>
  </q-page>
</template>
