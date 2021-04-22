<script lang="ts">
import { debounce, uid } from 'quasar';
import { computed, defineComponent } from 'vue';

import { systemStore } from '@/store/system';
import { createDialog } from '@/utils/dialog';
import { spliceById, uniqueFilter } from '@/utils/functional';

import { calculateNormalizedFlows } from './calculateFlows';
import { defaultLayoutHeight, defaultLayoutWidth } from './const';
import { builderStore } from './store';
import { BuilderConfig, BuilderLayout, FlowPart, PartUpdater, PersistentPart } from './types';
import { asPersistentPart, asStatePart, squares, vivifyParts } from './utils';

@Component
export default class BuilderWidget extends WidgetBase<BuilderConfig> {
  squares = squares;

  flowParts: FlowPart[] = [];
  debouncedCalculate: Function = () => { };

  pending: FlowPart | null = null;

  @Watch('layout')
  watchLayout(): void {
    this.debouncedCalculate();
  }

  created(): void {
    this.migrate();
    this.debouncedCalculate = debounce(this.calculate, 200, false);
    this.debouncedCalculate();
  }

  get allLayouts(): BuilderLayout[] {
    return builderStore.layouts;
  }

  get layoutIds(): string[] {
    return this.config.layoutIds ?? [];
  }

  get layouts(): BuilderLayout[] {
    return this.layoutIds
      .map(id => builderStore.layoutById(id))
      .filter(v => v !== null) as BuilderLayout[];
  }

  get layout(): BuilderLayout | null {
    return builderStore.layoutById(this.config.currentLayoutId);
  }

  startSelectLayout(): void {
    createDialog({
      component: 'SelectedLayoutDialog',
      value: this.config.currentLayoutId,
    })
      .onOk(id => {
        this.config.currentLayoutId = id;
        this.saveConfig();
      });
  }

  selectLayout(id: string | null): void {
    if (id) {
      this.config.layoutIds = [...this.config.layoutIds, id].filter(uniqueFilter);
    }
    this.config.currentLayoutId = id;
    this.saveConfig(this.config);
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
    return this.layout !== null
      ? vivifyParts(this.layout.parts)
      : [];
  }

  get updater(): PartUpdater {
    return {
      updatePart: this.savePart,
    };
  }

  get delayTouch(): boolean {
    const { builderTouchDelayed } = systemStore.config;
    return builderTouchDelayed === 'always'
      || (builderTouchDelayed === 'dense' && this.$dense);
  }

  isClickable(part: FlowPart): boolean {
    return builderStore.spec(part).interactHandler !== undefined;
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

  async calculate(): Promise<void> {
    await this.$nextTick();
    this.flowParts = calculateNormalizedFlows(this.parts.map(asStatePart));
  }

  async migrate(): Promise<void> {
    const oldParts: PersistentPart[] = (this.config as any).parts;
    if (oldParts) {
      const id = uid();
      await builderStore.createLayout({
        id,
        title: `${this.widget.title} layout`,
        width: defaultLayoutWidth,
        height: defaultLayoutHeight,
        parts: oldParts,
      });
      this.config.layoutIds.push(id);
      this.config.currentLayoutId = id;
      this.$delete(this.config, 'parts');
      this.saveConfig(this.config);
    }
  }
}
</script>

<template>
  <CardWrapper no-scroll v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud">
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
            v-if="!$dense"
            icon="mdi-tools"
            label="Edit layout"
            @click="startEditor"
          />
        </template>
      </component>
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
            v-if="allLayouts.length > 0"
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
      <svg
        ref="grid"
        :viewBox="gridViewBox"
        class="fit q-pa-md"
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
            v-touch-repeat:100.stop="args => handleRepeat(args, part)"
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
  </CardWrapper>
</template>

<style lang="sass" scoped>
@import './grid.sass'

.inactive
  opacity: 0.1
</style>
