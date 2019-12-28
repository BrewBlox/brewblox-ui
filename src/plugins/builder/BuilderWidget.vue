<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { createDialog } from '@/helpers/dialog';

import BuilderBasic from './BuilderBasic.vue';
import BuilderFull from './BuilderFull.vue';
import { SQUARE_SIZE } from './getters';
import { builderStore } from './store';
import { BuilderConfig, BuilderLayout } from './types';

@Component({
  components: {
    Basic: BuilderBasic,
    Full: BuilderFull,
  },
})
export default class BuilderWidget extends WidgetBase {
  startEditor(): void {
    createDialog({
      parent: this,
      component: 'BuilderEditor',
      initialLayout: this.widget.config.currentLayoutId,
    });
  }

  get widgetConfig(): BuilderConfig {
    return this.widget.config;
  }

  get layout(): BuilderLayout | null {
    return builderStore.layoutById(
      this.widget.config.currentLayoutId || '');
  }

  get dense(): boolean {
    return this.$q.screen.lt.lg;
  }

  get editorDisabled(): boolean {
    const { ie, edge } = this.$q.platform.is;
    return Boolean(ie || edge) || this.dense;
  }

  public *cardClassGenerator(): Generator<string, void, undefined> {
    yield* ['column', 'no-wrap'];
    yield* this.inDialog
      ? ['widget-modal']
      : ['widget-dashboard', 'overflow-unset'];
    if (this.dense) {
      yield 'widget-dense';
    }
  }

  get builderCardStyle(): Mapped<string> {
    if (this.inDialog && this.mode === 'Basic') {
      const width = this.layout
        ? this.layout.width * SQUARE_SIZE
        : 500;
      const height = this.layout
        ? this.layout.height * SQUARE_SIZE
        : 500;
      const pickerSpace = this.widgetConfig.layoutIds.length > 1
        ? 50
        : 0;
      const toolbarSpace = 50;
      return {
        height: `${height + toolbarSpace + pickerSpace}px`, // not an exact science
        maxHeight: this.dense ? '100vh' : '90vh',
        width: `${width}px`,
        maxWidth: this.dense ? '100vw' : '95vw',
      };
    }
    return {};
  }
}
</script>

<template>
  <component :is="mode" :crud="crud" :class="cardClass" :style="builderCardStyle" :editor-disabled="editorDisabled">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ActionItem v-if="!editorDisabled" icon="mdi-pipe" label="Builder Editor" @click="startEditor" />
        </template>
      </component>
    </template>
  </component>
</template>
