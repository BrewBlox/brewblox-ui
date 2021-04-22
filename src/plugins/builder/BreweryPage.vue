<script lang="ts">
import { debounce } from 'quasar';
import { computed, defineComponent } from 'vue';

import { systemStore } from '@/store/system';
import { spliceById } from '@/utils/functional';
import notify from '@/utils/notify';

import { calculateNormalizedFlows } from './calculateFlows';
import { builderStore } from './store';
import { BuilderLayout, FlowPart, PartUpdater, PersistentPart } from './types';
import { asPersistentPart, asStatePart, squares, vivifyParts } from './utils';

@Component
export default class BreweryPage extends Vue {
  squares = squares;

  localDrawer: boolean | null = null;
  pending: FlowPart | null = null;

  flowParts: FlowPart[] = [];
  debouncedCalculate: Function = () => { };
  debouncedSaveLayout: Function = (layout: BuilderLayout) => { void layout; }

  @Watch('layout')
  watchLayout(): void {
    this.debouncedCalculate();
  }

  @Watch('layoutId', { immediate: true })
  watchLayoutId(): void {
    try {
      this.$q.localStorage.set('brewery-page', this.layoutId);
    } catch (e) {
      notify.warn(`Failed to access localStorage: '${e.message}'`, { shown: false });
    }
  }

  created(): void {
    this.debouncedSaveLayout = debounce(builderStore.saveLayout, 200, false);
    this.debouncedCalculate = debounce(this.calculate, 200, false);
    this.debouncedCalculate();
  }

  get loaded(): boolean {
    return systemStore.loaded;
  }

  get drawerOpen(): boolean {
    return Boolean(
      this.localDrawer
      ?? this.$q.localStorage.getItem('drawer')
      ?? !this.$dense);
  }

  set drawerOpen(v: boolean) {
    this.localDrawer = v;
    this.$q.localStorage.set('drawer', v);
  }

  get delayTouch(): boolean {
    const { builderTouchDelayed } = systemStore.config;
    return builderTouchDelayed === 'always'
      || (builderTouchDelayed === 'dense' && this.$dense);
  }

  get layouts(): BuilderLayout[] {
    return builderStore.layouts;
  }

  get layoutId(): string | null {
    return this.$route.params.id ?? this.$q.localStorage.getItem('brewery-page');
  }

  get layout(): BuilderLayout | null {
    return builderStore.layoutById(this.layoutId ?? builderStore.layoutIds[0]);
  }

  get scale(): number {
    return this.layout?.scale ?? 1;
  }

  get gridHeight(): number {
    return squares(this.layout?.height ?? 10) * this.scale;
  }

  get gridWidth(): number {
    return squares(this.layout?.width ?? 10) * this.scale;
  }

  startEditor(): void {
    if (!this.$dense) {
      this.$router.push(`/builder/${this.layout?.id ?? ''}`);
    }
  }

  selectLayout(id: string | null): void {
    this.$router.replace(`/brewery/${id ?? ''}`);
  }

  get gridViewBox(): string {
    return [0, 0, this.gridWidth, this.gridHeight]
      .join(' ');
  }

  async saveParts(parts: PersistentPart[]): Promise<void> {
    if (!this.layout) {
      return;
    }

    // first set local value, to avoid jitters caused by the period between action and vueX refresh
    this.layout.parts = parts.map(asPersistentPart);
    this.debouncedSaveLayout(this.layout);
    this.debouncedCalculate();
  }

  async savePart(part: PersistentPart): Promise<void> {
    await this.saveParts(spliceById(this.parts, part));
  }

  get parts(): PersistentPart[] {
    return this.layout !== null
      ? vivifyParts(this.layout.parts)
      : [];
  }

  get updater(): PartUpdater {
    return {
      updatePart: this.savePart,
    };
  }

  isClickable(part: FlowPart): boolean {
    return !!builderStore.spec(part).interactHandler;
  }

  interact(part: FlowPart): void {
    const handler = builderStore.spec(part).interactHandler;
    if (!handler) {
      return;
    }
    if (this.pending && this.pending.id === part.id) {
      handler(part, this.updater);
      this.pending = null;
    }
    else if (this.delayTouch) {
      this.pending = part;
    }
    else {
      handler(part, this.updater);
    }
  }

  edit(part: FlowPart): void {
    if (!this.isClickable(part)) {
      this.startEditor();
    }
  }

  async calculate(): Promise<void> {
    await this.$nextTick();
    this.flowParts = calculateNormalizedFlows(this.parts.map(asStatePart));
  }
}
</script>

<template>
  <q-page class="page-height">
    <portal to="toolbar-buttons">
      <q-btn
        v-if="!$dense"
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
    </portal>

    <div
      v-if="!loaded"
      class="text-h5 darkened absolute-center column items-center q-gutter-md"
    >
      <q-spinner size="30px" />
      <div>
        Waiting for datastore...
      </div>
    </div>
    <div v-else class="fit" @click="pending = null">
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
            @dirty="debouncedCalculate"
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
              @dirty="debouncedCalculate"
            />
          </g>
        </template>
      </svg>
    </div>
  </q-page>
</template>

<style lang="sass" scoped>
@import './grid.sass'

.inactive
  opacity: 0.1
</style>
