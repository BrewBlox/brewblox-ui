<script lang="ts">
import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { loadFile, saveFile } from '@/helpers/import-export';
import notify from '@/helpers/notify';
import { deepCopy } from '@/helpers/units/parseObject';
import { dashboardStore } from '@/store/dashboards';

import { defaultLayoutHeight, defaultLayoutWidth } from '../getters';
import { builderStore } from '../store';
import { BuilderItem, BuilderLayout, PersistentPart } from '../types';


@Component
export default class LayoutActions extends Vue {

  @Prop({ type: Object, default: null })
  public readonly layout!: BuilderLayout | null;

  @Prop({ type: Function, required: true })
  public readonly saveParts!: (parts: PersistentPart[]) => Promise<void>;

  @Prop({ type: Function, required: true })
  public readonly selectLayout!: (id: string | null) => void;

  get layoutIds(): string[] {
    return builderStore.layoutIds;
  }

  startAddLayout(copy: boolean): void {
    createDialog({
      title: 'Add Layout',
      message: 'Create a new Brewery Builder layout',
      cancel: true,
      prompt: {
        model: 'Brewery Layout',
        type: 'text',
      },
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

  exportLayout(): void {
    if (!this.layout) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, _rev, ...exported } = this.layout;
    saveFile(exported, `brewblox-${this.layout.title}-layout.json`);
  }

  renameLayout(): void {
    if (!this.layout) {
      return;
    }
    createDialog({
      title: 'Change Layout title',
      message: `Choose a new name for ${this.layout.title}`,
      cancel: true,
      prompt: {
        model: this.layout.title,
        type: 'text',
      },
    })
      .onOk(async title => {
        if (this.layout) {
          builderStore.saveLayout({ ...this.layout, title });
        }
      });
  }

  clearParts(): void {
    createDialog({
      title: 'Remove parts',
      message: 'Are you sure you wish to remove all parts?',
      noBackdropDismiss: true,
      cancel: true,
    })
      .onOk(() => this.saveParts([]));
  }

  removeLayout(): void {
    if (!this.layout) {
      return;
    }
    createDialog({
      title: 'Remove layout',
      message: `Are you sure you wish to remove ${this.layout.title}?`,
      noBackdropDismiss: true,
      cancel: true,
    })
      .onOk(async () => {
        if (this.layout) {
          await builderStore.removeLayout(this.layout)
            .catch(() => { });
        }
        const [id] = this.layoutIds;
        this.selectLayout(id || null);
      });
  }

  createLayoutWidget(): void {
    if (!this.layout) { return; }

    createDialog({
      parent: this,
      title: 'Copy widget',
      message: `On which dashboard do you want to create a widget for ${this.layout.title}?`,
      style: 'overflow-y: scroll',
      options: {
        type: 'radio',
        model: undefined,
        items: dashboardStore.dashboardValues
          .map(dashboard => ({ label: dashboard.title, value: dashboard.id })),
      },
      cancel: true,
    })
      .onOk(async (dashboard: string) => {
        const layout = this.layout!;
        const widget: BuilderItem = {
          id: uid(),
          title: layout.title,
          order: 0,
          dashboard,
          feature: 'Builder',
          cols: Math.max(2, Math.ceil(layout.width * (50 / 120))),
          rows: Math.max(2, Math.ceil(layout.height * (50 / 120))),
          config: {
            currentLayoutId: layout.id,
            layoutIds: [layout.id],
          },
        };
        await dashboardStore.appendWidget(widget);
        notify.done(`Created ${layout.title} widget on ${dashboardStore.dashboardById(dashboard).title}`);
      });
  }

}
</script>


<template>
  <ActionMenu v-bind="$attrs">
    <template #actions>
      <ActionItem label="New Layout" icon="add" @click="startAddLayout(false)" />
      <template v-if="!!layout">
        <ActionItem icon="file_copy" label="Copy Layout" @click="startAddLayout(true)" />
        <ActionItem icon="mdi-file-import" label="Import Layout" @click="importLayout" />
        <ActionItem icon="edit" label="Rename Layout" @click="renameLayout" />
        <ActionItem icon="dashboard" label="Show Layout on dashboard" @click="createLayoutWidget" />
        <ActionItem icon="mdi-file-export" label="Export Layout" @click="exportLayout" />
        <ActionItem icon="delete" label="Delete all parts" @click="clearParts" />
        <ActionItem icon="delete" label="Delete Layout" @click="removeLayout" />
      </template>
    </template>
  </ActionMenu>
</template>
