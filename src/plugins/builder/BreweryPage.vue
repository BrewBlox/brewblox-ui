<script lang="ts">
import { debounce, useQuasar } from 'quasar';
import { computed, defineComponent, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useGlobals } from '@/composables';
import { systemStore } from '@/store/system';
import { spliceById } from '@/utils/functional';

import { calculateNormalizedFlows } from './calculateFlows';
import { builderStore } from './store';
import { BuilderLayout, FlowPart, PartUpdater, PersistentPart } from './types';
import { asPersistentPart, asStatePart, squares, vivifyParts } from './utils';

export default defineComponent({
  name: 'BreweryPage',
  setup() {
    const { dense } = useGlobals.setup();
    const { localStorage } = useQuasar();
    const router = useRouter();

    const pending = ref<FlowPart | null>(null);
    const flowParts = ref<FlowPart[]>([]);

    const saveLayout = debounce(
      layout => builderStore.saveLayout(layout),
      200,
      false,
    );

    const calculate = debounce(
      async () => {
        await nextTick();
        flowParts.value = calculateNormalizedFlows(parts.value.map(asStatePart));
      },
      200,
      false,
    );

    const started = computed<boolean>(
      () => systemStore.started,
    );

    const delayTouch = computed<boolean>(
      () => {
        const { builderTouchDelayed } = systemStore.config;
        return builderTouchDelayed === 'always'
          || (builderTouchDelayed === 'dense' && dense.value);
      },
    );

    const layoutId = computed<string | null>(
      () => {
        const route = router.currentRoute.value;
        const paramId = route.path.startsWith('/brewery')
          ? route.params.id as string ?? null
          : null;
        return paramId ?? localStorage.getItem('brewery-page');
      },
    );

    const layout = computed<BuilderLayout | null>(
      () => builderStore.layoutById(layoutId.value ?? builderStore.layoutIds[0]),
    );

    const layoutTitle = computed<string>(
      () => layout.value?.title ?? 'Builder layout',
    );

    watch(
      () => layoutTitle.value,
      title => document.title = `Brewblox | ${title}`,
      { immediate: true },
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

    async function saveParts(parts: PersistentPart[]): Promise<void> {
      if (!layout.value) {
        return;
      }
      // first set local value, to avoid jitters caused by the period between action and vueX refresh
      layout.value.parts = parts.map(asPersistentPart);
      saveLayout(layout.value);
      calculate();
    }

    async function savePart(part: PersistentPart): Promise<void> {
      await saveParts(spliceById(parts.value, part));
    }

    const parts = computed<PersistentPart[]>(
      () => layout.value !== null
        ? vivifyParts(layout.value.parts)
        : [],
    );

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
      () => layout.value,
      () => calculate(),
      { immediate: true },
    );

    watch(
      () => layoutId.value,
      () => {
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
      started,
      parts,
      gridViewBox,
      flowParts,
      squares,
      isClickable,
      pending,
      interact,
      savePart,
      calculate,
    };
  },
});
</script>

<template>
  <q-page class="page-height">
    <div
      v-if="!started"
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
            :key="part.id"
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
              @dirty="calculate"
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
                @dirty="calculate"
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
