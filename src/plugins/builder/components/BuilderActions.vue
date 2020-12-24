<script lang="ts">
import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { deepCopy } from '@/helpers/functional';
import { loadFile } from '@/helpers/import-export';

import { defaultLayoutHeight, defaultLayoutWidth } from '../getters';
import { builderStore } from '../store';
import { BuilderLayout } from '../types';


@Component
export default class BuilderActions extends Vue {

  @Prop({ type: Object, default: null })
  public readonly layout!: BuilderLayout | null;

  selectLayout(id: string | null): void {
    this.$emit('selected', id);
  }

  startAddLayout(copy: boolean): void {
    createDialog({
      component: 'InputDialog',
      title: 'Add Layout',
      message: 'Create a new Brewery Builder layout',
      value: 'Brewery Layout',
    })
      .onOk(async title => {
        const id = uid();
        await builderStore.createLayout({
          id,
          title,
          width: copy && this.layout ? this.layout.width : defaultLayoutWidth,
          height: copy && this.layout ? this.layout.height : defaultLayoutHeight,
          parts: copy && this.layout ? deepCopy(this.layout.parts) : [],
        });
        this.selectLayout(id);
      });
  }

  async importLayout(): Promise<void> {
    loadFile<BuilderLayout>(async layout => {
      const id = uid();
      await builderStore.createLayout({ ...layout, id });
      this.selectLayout(id);
    });
  }
}
</script>


<template>
  <ActionMenu v-bind="{...$attrs}">
    <template #actions>
      <slot name="actions" />
      <ActionItem
        icon="add"
        label="New Layout"
        @click="startAddLayout(false)"
      />
      <ActionItem
        icon="mdi-file-import"
        label="Import Layout"
        @click="importLayout"
      />
    </template>
    <template #menus>
      <LayoutActions
        :layout="layout"
        @selected="selectLayout"
      />
      <slot name="menus" />
    </template>
    <slot />
  </ActionMenu>
</template>
