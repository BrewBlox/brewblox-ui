<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
import { createDialog } from '@/helpers/dialog';
import { widgetGridSize } from '@/helpers/grid';

import BuilderBasic from './BuilderBasic.vue';
import BuilderFull from './BuilderFull.vue';

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

  get builderCardClass(): string[] {
    return [...this.cardClass, 'column'];
  }

  get builderCardStyle(): Mapped<string> {
    const sized = widgetGridSize(this.widget);
    return this.inDialog && this.mode === 'Basic'
      ? { height: '90vh', width: `${sized.cols}px`, maxWidth: '95vw' }
      : {};
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
