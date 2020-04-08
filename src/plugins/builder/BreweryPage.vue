<script lang="ts">
import { debounce, uid } from 'quasar';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { spliceById } from '@/helpers/functional';
import notify from '@/helpers/notify';

import { calculateNormalizedFlows } from './calculateFlows';
import { deprecatedTypes } from './getters';
import { asPersistentPart, asStatePart, squares } from './helpers';
import { builderStore } from './store';
import { BuilderLayout, FlowPart, PartUpdater, PersistentPart } from './types';


@Component
export default class BuilderPage extends Vue {
  squares = squares;

  drawerOpen = !this.$dense;
  // layoutId: string | null = null;

  debouncedCalculate: Function = () => { };
  flowParts: FlowPart[] = [];

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
    this.debouncedCalculate = debounce(this.calculate, 200, false);
    this.debouncedCalculate();
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

  get gridHeight(): number {
    return squares(this.layout?.height ?? 10);
  }

  get gridWidth(): number {
    return squares(this.layout?.width ?? 10);
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
    await builderStore.saveLayout(this.layout);
    this.debouncedCalculate();
  }

  async savePart(part: PersistentPart): Promise<void> {
    await this.saveParts(spliceById(this.parts, part));
  }

  get parts(): PersistentPart[] {
    if (!this.layout) {
      return [];
    }
    const sizes: Mapped<number> = {};
    return this.layout.parts
      .map(part => {
        const actual: PersistentPart = {
          id: uid(),
          rotate: 0,
          settings: {},
          flipped: false,
          ...part,
          type: deprecatedTypes[part.type] ?? part.type,
        };
        const [sizeX, sizeY] = builderStore.spec(actual).size(actual);
        sizes[part.id] = sizeX * sizeY;
        return actual;
      })
      // Sort parts to render largest first
      // This improves clickability of overlapping parts
      .sort((a, b) => sizes[b.id] - sizes[a.id]);
  }

  get updater(): PartUpdater {
    return {
      updatePart: this.savePart,
    };
  }

  isClickable(part): boolean {
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
}
</script>

<template>
  <q-layout
    view="hHh Lpr fFf"
  >
    <LayoutHeader @menu="drawerOpen = !drawerOpen">
      <template #title>
        Builder Page
      </template>
    </LayoutHeader>
    <LayoutFooter />

    <q-drawer v-model="drawerOpen" content-class="column" elevated>
      <SidebarNavigator active-section="brewery" />

      <q-scroll-area
        class="col"
        :thumb-style="{opacity: 0.5, background: 'silver'}"
      >
        <q-item class="q-pb-none">
          <q-item-section class="text-bold">
            Layouts
          </q-item-section>
        </q-item>
        <ActionItem
          v-for="lay in layouts"
          :key="lay.id"
          :label="lay.title"
          :active="lay.id === layout.id"
          class="ellipsis"
          style="min-height: 0"
          :inset-level="0.2"
          @click="selectLayout(lay.id)"
        />
      </q-scroll-area>
    </q-drawer>

    <q-page-container @dblclick="startEditor">
      <q-page class="row no-wrap justify-center q-pa-md">
        <div class="fit">
          <span v-if="parts.length === 0" class="absolute-center">
            {{ layout === null ? 'No layout selected' : 'Layout is empty' }}
          </span>
          <svg ref="grid" :viewBox="gridViewBox" class="fit q-pa-md">
            <g
              v-for="part in flowParts"
              :key="part.id"
              :transform="`translate(${squares(part.x)}, ${squares(part.y)})`"
              :class="{ pointer: isClickable(part), [part.type]: true }"
              @click="interact(part)"
              @dblclick.stop="edit(part)"
            >
              <PartWrapper :part="part" @update:part="savePart" @dirty="debouncedCalculate" />
            </g>
          </svg>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="sass" scoped>
@import './grid.sass'
</style>
