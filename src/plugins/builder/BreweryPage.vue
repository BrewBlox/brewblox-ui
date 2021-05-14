<script lang="ts">
import { useQuasar } from 'quasar';
import { computed, defineComponent, ref, watch } from 'vue';

import { useGlobals } from '@/composables';
import { systemStore } from '@/store/system';
import { spliceById } from '@/utils/functional';

import { useFlowParts, useSvgZoom, UseSvgZoomDimensions } from './composables';
import { builderStore } from './store';
import { FlowPart, PersistentPart } from './types';
import { coord2grid, startChangeLayoutTitle } from './utils';

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

    const pending = ref<FlowPart | null>(null);

    const startupDone = computed<boolean>(
      () => systemStore.startupDone,
    );

    const delayTouch = computed<boolean>(
      () => {
        const { builderTouchDelayed } = systemStore.config;
        return builderTouchDelayed === 'always'
          || (builderTouchDelayed === 'dense' && dense.value);
      },
    );

    const layoutId = computed<string | null>(
      () => props.routeId,
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

    const layoutTitle = computed<string>(
      () => layout.value?.title ?? 'Builder layout',
    );

    function savePart(part: PersistentPart): void {
      parts.value = spliceById(parts.value, part);
    }

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

    function editTitle(): void {
      startChangeLayoutTitle(layout.value);
    }

    watch(
      () => layoutTitle.value,
      title => document.title = `Brewblox | ${title}`,
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
        }
        catch (e) { /* ignore */ }
      },
    );

    return {
      dense,
      layoutId,
      layout,
      layoutTitle,
      editTitle,
      svgRef,
      svgContentRef,
      resetZoom,
      startupDone,
      parts,
      flowParts,
      flowPartsRevision,
      coord2grid,
      isClickable,
      pending,
      interact,
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
      <div>
        Waiting for datastore...
      </div>
    </div>
    <template v-else>
      <TitleTeleport>
        <span @click="editTitle">{{ layoutTitle }}</span>
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

      <div class="fit" @click="pending = null">
        <span v-if="parts.length === 0" class="absolute-center">
          {{ layout === null ? 'No layout selected' : 'Layout is empty' }}
        </span>
        <svg ref="svgRef" class="fit">
          <g ref="svgContentRef">
            <g
              v-for="part in flowParts"
              :key="`${flowPartsRevision}-${part.id}`"
              :transform="`translate(${coord2grid(part.x)}, ${coord2grid(part.y)})`"
              :class="{
                [part.type]: true,
                pointer: isClickable(part),
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
                @dblclick.stop
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
      </div>
    </template>
  </q-page>
</template>

<style lang="sass" scoped>
@import './grid.sass'

.inactive
  opacity: 0.1
</style>
