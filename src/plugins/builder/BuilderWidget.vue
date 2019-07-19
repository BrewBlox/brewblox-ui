<script lang="ts">
import { debounce, uid } from 'quasar';
import { Component, Watch } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';

import BuilderCatalog from './BuilderCatalog.vue';
import { calculateNormalizedFlows } from './calculateFlows';
import { SQUARE_SIZE, deprecatedTypes } from './getters';
import specs from './specs';
import { builderStore } from './store';
import { BuilderConfig, BuilderLayout, ClickEvent, FlowPart, PartUpdater, PersistentPart, Rect } from './types';

interface DragAction {
  hide: boolean;
  part: PersistentPart;
  x: number;
  y: number;
}

interface ToolAction {
  label: string;
  value: string;
  icon: string;
  cursor?: string;
  onClick?: (evt: ClickEvent, part: PersistentPart) => void;
  onPan?: (args: PanArguments, part: PersistentPart) => void;
}


@Component({
  components: {
    BuilderCatalog,
  },
})
export default class BuilderWidget extends WidgetBase {
  $refs!: {
    grid: any;
  }

  formModalOpen: boolean = false;
  widgetGridRect: Rect | null = null;
  partState: Record<string, any> = {};
  flowParts: FlowPart[] = [];
  calculateFlowFunc: Function = () => { };

  get widgetConfig(): BuilderConfig {
    return {
      currentLayoutId: null,
      layoutIds: [],
      ...this.widget.config as Partial<BuilderConfig>,
    };
  }

  get layouts(): BuilderLayout[] {
    return this.widgetConfig.layoutIds
      .map(builderStore.layoutById);
  }

  get currentLayout(): BuilderLayout | null {
    return this.layouts
      .find(s => s && s.id === this.widgetConfig.currentLayoutId) || null;
  }

  async updateParts(parts: PersistentPart[]) {
    const asPersistent = (part: PersistentPart | FlowPart) => {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { transitions, flows, ...persistent } = part as FlowPart;
      return persistent;
    };

    if (!this.currentLayout) {
      return;
    }

    // first set local value, to avoid jitters caused by the period between action and vueX refresh
    this.currentLayout.parts = parts.map(asPersistent);
    await builderStore.saveLayout(this.currentLayout);
    this.calculateFlowFunc();
  }

  async updatePart(part: PersistentPart) {
    await this.updateParts(this.parts.map(p => (p.id === part.id ? part : p)));
  }

  async removePart(part: PersistentPart) {
    await this.updateParts(this.parts.filter(p => p.id !== part.id));
  }

  gridRect(): Rect {
    const { x, y, left, right, top, bottom } = this.$refs.grid.getBoundingClientRect();
    return { x, y, left, right, top, bottom };
  }

  get parts(): PersistentPart[] {
    if (!this.currentLayout) {
      return [];
    }
    const sizes: Record<string, number> = {};
    return this.currentLayout.parts
      .map(part => {
        const actual: PersistentPart = {
          id: uid(),
          rotate: 0,
          settings: {},
          flipped: false,
          ...part,
          type: deprecatedTypes[part.type] || part.type,
        };
        const [sizeX, sizeY] = specs[actual.type].size(actual);
        sizes[part.id] = sizeX * sizeY;
        return actual;
      })
      // sort parts to render largest first
      .sort((a, b) => sizes[b.id] - sizes[a.id]);
  }

  get updater(): PartUpdater {
    return {
      updatePart: this.updatePart,
    };
  }

  isClickable(part) {
    return !!specs[part.type].interactHandler;
  }

  interact(part: FlowPart) {
    const handler = specs[part.type].interactHandler;
    handler && handler(part, this.updater);
  }

  squares(val: number): number {
    return SQUARE_SIZE * val;
  }

  async migrate() {
    const oldParts: PersistentPart[] = (this.widgetConfig as any).parts;
    if (oldParts) {
      const id = uid();
      await builderStore.createLayout({
        id,
        title: `${this.widget.title} layout`,
        parts: oldParts,
      });
      this.widgetConfig.layoutIds.push(id);
      this.widgetConfig.currentLayoutId = id;
      this.$delete(this.widgetConfig, 'parts');
      this.saveConfig(this.widgetConfig);
      this.calculateFlowFunc();
    }
  }

  mounted() {
    this.calculateFlowFunc =
      debounce(
        () => this.$nextTick(() => this.flowParts = calculateNormalizedFlows(this.parts)),
        50,
        false);
    this.calculateFlowFunc();
    this.migrate();
  }

  @Watch('widgetConfig', { deep: true })
  watchLayout(newCfg: BuilderConfig, oldCfg: BuilderConfig) {
    if (!oldCfg || newCfg.currentLayoutId !== oldCfg.currentLayoutId) {
      this.calculateFlowFunc();
    }
  }
}
</script>

<template>
  <q-card dark class="text-white column">
    <q-dialog v-model="formModalOpen" no-backdrop-dismiss maximized>
      <BuilderForm
        v-if="formModalOpen"
        :crud="crud"
        :widget-grid-rect="widgetGridRect"
        :parts="parts"
        :flow-parts="flowParts"
        @parts="updateParts"
        @part="updatePart"
        @dirty="calculateFlowFunc"
        @remove="removePart"
        @close="formModalOpen = false"
      />
    </q-dialog>

    <WidgetToolbar :title="widget.title" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown
          flat
          split
          icon="mdi-pencil"
          @click="widgetGridRect = gridRect(); formModalOpen = true"
        >
          <q-list dark bordered>
            <ExportAction :crud="crud" />
            <WidgetActions :crud="crud" />
          </q-list>
        </q-btn-dropdown>
      </q-item-section>
    </WidgetToolbar>

    <div class="col">
      <svg v-if="!formModalOpen" ref="grid" class="grid-base">
        <g
          v-for="part in flowParts"
          :transform="`translate(${squares(part.x)}, ${squares(part.y)})`"
          :key="part.id"
          :class="{ clickable: isClickable(part), [part.type]: true }"
          @click="interact(part)"
        >
          <PartWrapper :part="part" @update:part="updatePart" @dirty="calculateFlowFunc" />
        </g>
      </svg>
    </div>
  </q-card>
</template>

<style lang="stylus" scoped>
@import './grid.styl';
</style>

