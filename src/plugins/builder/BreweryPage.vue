<script lang="ts">
import { debounce, Notify } from 'quasar';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { spliceById } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { systemStore } from '@/store/system';

import { calculateNormalizedFlows } from './calculateFlows';
import { asPersistentPart, asStatePart, squares, vivifyParts } from './helpers';
import { builderStore } from './store';
import { BuilderLayout, FlowPart, PartUpdater, PersistentPart } from './types';


@Component
export default class BreweryPage extends Vue {
  squares = squares;

  localDrawer: boolean | null = null;

  flowParts: FlowPart[] = [];
  debouncedCalculate: Function = () => { };
  debouncedSaveLayout: Function = (layout: BuilderLayout) => { void layout; }

  touchMax = 10;
  touchMessage: Function = () => { }

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
    builderStore.spec(part).interactHandler?.(part, this.updater);
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

  handleRepeat(args, part: FlowPart): void {
    if (!this.isClickable(part)) {
      return;
    }

    if (!this.delayTouch && args.repeatCount === 1) {
      this.interact(part);
    }

    if (this.delayTouch) {
      if (args.repeatCount === 1) {
        const title = builderStore.spec(part).title;
        this.touchMessage({ timeout: 1 }); // Clear previous
        this.touchMessage = Notify.create({
          position: 'top',
          group: false,
          timeout: 500,
          message: `Hold to interact with '${title}'`,
          spinner: true,
        });
      }
      if (args.repeatCount < this.touchMax) {
        this.touchMessage({ timeout: 500 }); // Postpone timeout
      }
      if (args.repeatCount === this.touchMax) {
        this.interact(part);
        this.touchMessage({
          icon: 'done',
          color: 'positive',
          timeout: 100,
          message: 'Done!',
          spinner: false,
        });
      }
    }
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
    <div v-else class="fit">
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
          :class="{ pointer: isClickable(part), [part.type]: true }"
          @touchstart.prevent
          @click="interact(part)"
        >
          <PartWrapper
            v-touch-repeat:100.stop="args => handleRepeat(args, part)"
            :part="part"
            @update:part="savePart"
            @dirty="debouncedCalculate"
          />
        </g>
      </svg>
    </div>
  </q-page>
</template>

<style lang="sass" scoped>
@import './grid.sass'
</style>
