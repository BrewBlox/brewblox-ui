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
import { squares } from './utils';

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
        width: squares(layout.value?.width ?? 10),
        height: squares(layout.value?.height ?? 10),
      }),
    );

    const zoomEnabled = computed<boolean>(
      () => !dense.value,
    );

    const {
      svgRef,
      svgContentRef,
      resetZoom,
    } = useSvgZoom.setup(gridDimensions, {
      wheelEnabled: zoomEnabled,
      dragEnabled: zoomEnabled,
    });

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
      squares,
      startSelectLayout,
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
      isClickable,
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
              :transform="`translate(${squares(pending.x)}, ${squares(pending.y)})`"
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
    </div>
  </Card>
</template>

<style lang="sass" scoped>
@import './grid.sass'

.inactive
  opacity: 0.1
</style>
