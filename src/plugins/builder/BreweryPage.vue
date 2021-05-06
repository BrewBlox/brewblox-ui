<script lang="ts">
import { useQuasar } from 'quasar';
import { computed, defineComponent, ref, watch } from 'vue';

import { useGlobals } from '@/composables';
import { systemStore } from '@/store/system';
import { spliceById } from '@/utils/functional';

import { useFlowParts } from './composables';
import { builderStore } from './store';
import { FlowPart, PartUpdater, PersistentPart } from './types';
import { squares } from './utils';

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

    const layoutTitle = computed<string>(
      () => layout.value?.title ?? 'Builder layout',
    );

    const scale = computed<number>(
      () => layout.value?.scale ?? 1,
    );

    const gridHeight = computed<number>(
      () => squares(layout.value?.height ?? 10) * scale.value,
    );

    const gridWidth = computed<number>(
      () => squares(layout.value?.width ?? 10) * scale.value,
    );

    const gridViewBox = computed<string>(
      () => [0, 0, gridWidth.value, gridHeight.value].join(' '),
    );

    function savePart(part: PersistentPart): void {
      parts.value = spliceById(parts.value, part);
    }

    const updater = computed<PartUpdater>(
      () => ({
        updatePart: savePart,
      }),
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
      startupDone,
      parts,
      gridViewBox,
      flowParts,
      flowPartsRevision,
      squares,
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
        {{ layoutTitle }}
      </TitleTeleport>
      <ButtonsTeleport>
        <q-btn
          v-if="!dense"
          unelevated
          round
          icon="mdi-tools"
          class="self-center"
          :to="`/builder/${layoutId}`"
        >
          <q-tooltip>Open builder</q-tooltip>
        </q-btn>
        <ActionMenu
          round
          class="self-center"
          label="Layout actions"
        >
          <template #menus>
            <LayoutActions :layout="layout" />
          </template>
        </ActionMenu>
      </ButtonsTeleport>

      <div class="fit" @click="pending = null">
        <span v-if="parts.length === 0" class="absolute-center">
          {{ layout === null ? 'No layout selected' : 'Layout is empty' }}
        </span>
        <svg
          ref="grid"
          :viewBox="gridViewBox"
          class="fit"
        >
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
