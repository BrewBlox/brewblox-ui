<script lang="ts">
import { debounce, uid } from 'quasar';
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
import { spaceCased } from '@/helpers/functional';

import BuilderCatalog from './BuilderCatalog.vue';
import { calculateNormalizedFlows } from './calculateFlows';
import { SQUARE_SIZE } from './getters';
import specs from './specs';
import { BuilderConfig, ClickEvent, FlowPart, PartUpdater, PersistentPart, Rect } from './types';

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
  // make imported values accessible in template
  SQUARE_SIZE: number = SQUARE_SIZE;
  spaceCased = spaceCased;

  $refs!: {
    grid: any;
  }

  formModalOpen: boolean = false;
  widgetGridRect: Rect | null = null;
  partState: Record<string, any> = {};
  flowParts: FlowPart[] = [];
  calculateFlowFunc: Function = () => { };

  get widgetConfig(): BuilderConfig {
    return this.widget.config;
  }

  async updateParts(parts: PersistentPart[]) {
    const asPersistent = (part: PersistentPart | FlowPart) => {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { transitions, flows, ...persistent } = part as FlowPart;
      return persistent;
    };

    // first set local value, to avoid jitters caused by the period between action and vueX refresh
    this.widgetConfig.parts = parts.map(asPersistent);
    await this.saveConfig(this.widgetConfig);
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
    return this.widgetConfig.parts
      .map(part => {
        const statePart = {
          id: uid(),
          rotate: 0,
          settings: {},
          flipped: false,
          ...part,
          state: this.partState[part.id] || {},
        };
        const [sizeX, sizeY] = specs[part.type].size(part);
        statePart.state.area = sizeX * sizeY;
        return statePart;
      })
      // sort parts to render largest first
      .sort((a, b) => b.state.area - a.state.area);
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

  mounted() {
    this.calculateFlowFunc =
      debounce(
        () => this.$nextTick(() => this.flowParts = calculateNormalizedFlows(this.parts)),
        50,
        false);
    this.calculateFlowFunc();
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
          :transform="`translate(${part.x * SQUARE_SIZE}, ${part.y * SQUARE_SIZE})`"
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

