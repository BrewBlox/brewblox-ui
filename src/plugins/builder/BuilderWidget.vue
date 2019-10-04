<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
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
      root: this.$root,
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

  get builderCardClass(): string[] {
    return [...this.cardClass, 'column'];
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
        maxHeight: '90vh',
        width: `${width}px`,
        maxWidth: '95vw',
      };
    }
    return {};
  }
}
</script>

<template>
  <component :is="mode" :crud="crud" :class="builderCardClass" :style="builderCardStyle">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ActionItem icon="mdi-pipe" label="Builder Editor" @click="startEditor" />
          <ExportAction :crud="crud" />
          <WidgetActions :crud="crud" />
        </template>
      </component>
    </template>
  </component>
</template>
