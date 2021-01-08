<script lang="ts">
import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { deepCopy } from '@/helpers/functional';
import { saveFile } from '@/helpers/import-export';
import notify from '@/helpers/notify';
import { dashboardStore, Widget } from '@/store/dashboards';
import { systemStore } from '@/store/system';

import { defaultLayoutHeight, defaultLayoutWidth } from '../getters';
import { builderStore } from '../store';
import { BuilderConfig, BuilderLayout } from '../types';


@Component
export default class LayoutActions extends Vue {

  @Prop({ type: Object, default: null })
  public readonly layout!: BuilderLayout | null;

  @Prop({ type: Boolean, default: false })
  public readonly noLabel!: boolean;

  get layoutIds(): string[] {
    return builderStore.layoutIds;
  }

  get title(): string {
    return this.layout?.title ?? 'Unknown';
  }

  get label(): string | null {
    return this.noLabel ? null : this.title;
  }

  get scale(): number {
    return this.layout?.scale ?? 1;
  }

  get listed(): boolean {
    return this.layout?.listed ?? true;
  }

  set listed(v: boolean) {
    if (this.layout) {
      builderStore.saveLayout({ ...this.layout, listed: v });
    }
  }

  get isHomePage(): boolean {
    return systemStore.config.homePage === `/brewery/${this.layout?.id}`;
  }

  set isHomePage(v: boolean) {
    const homePage = v && this.layout ? `/brewery/${this.layout.id}` : null;
    systemStore.saveConfig({ homePage });
  }

  selectLayout(id: string | null): void {
    this.$emit('selected', id);
  }

  editScale(): void {
    createDialog({
      component: 'InputDialog',
      title: 'Set zoom level',
      suffix: '%',
      value: (1 / this.scale) * 100,
      rules: [
        v => v === null || v > 0 || 'Value must be > 0',
      ],
    })
      .onOk(v => {
        if (this.layout) {
          const scale = 100 / (v ?? 100);
          builderStore.saveLayout({ ...this.layout, scale });
        }
      });
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

  exportLayout(): void {
    if (!this.layout) {
      return;
    }
    const { id, ...exported } = this.layout;
    void id;
    saveFile(exported, `brewblox-${this.layout.title}-layout.json`);
  }

  renameLayout(): void {
    if (!this.layout) {
      return;
    }
    createDialog({
      component: 'InputDialog',
      title: 'Change Layout title',
      message: `Choose a new name for ${this.layout.title}`,
      value: this.layout.title,
    })
      .onOk(async title => {
        if (this.layout) {
          builderStore.saveLayout({ ...this.layout, title });
        }
      });
  }

  clearParts(): void {
    createDialog({
      component: 'ConfirmDialog',
      title: 'Remove parts',
      message: 'Are you sure you wish to remove all parts?',
      noBackdropDismiss: true,
    })
      .onOk(() => {
        if (this.layout) {
          builderStore.saveLayout({ ...this.layout, parts: [] });
        }
      });
  }

  removeLayout(): void {
    if (!this.layout) {
      return;
    }
    createDialog({
      component: 'ConfirmDialog',
      title: 'Remove layout',
      message: `Are you sure you wish to remove ${this.layout.title}?`,
      noBackdropDismiss: true,
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

    const selectOptions = dashboardStore.dashboards
      .map(dashboard => ({
        label: dashboard.title,
        value: dashboard.id,
      }));

    createDialog({
      component: 'SelectDialog',
      title: 'Make widget',
      message: `On which dashboard do you want to create a widget for <b>${this.layout.title}</b>?`,
      listSelect: selectOptions.length < 10,
      html: true,
      selectOptions,
    })
      .onOk(async (dashboard: string) => {
        const layout = this.layout!;
        const widget: Widget<BuilderConfig> = {
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
        notify.done(`Created <b>${layout.title}</b> widget on <b>${dashboardStore.dashboardTitle(dashboard)}</b>`);
      });
  }
}
</script>


<template>
  <ActionSubmenu v-if="!!layout" v-bind="{label, ...$attrs}">
    <slot />
    <ToggleAction
      v-model="isHomePage"
      icon="home"
      :label="isHomePage ? 'Is home page' : 'Make home page'"
    />
    <ToggleAction
      v-model="listed"
      label="Show in sidebar"
    />
    <ActionItem
      icon="mdi-magnify-plus-outline"
      :label="`Zoom: ${(1 / scale) * 100}%`"
      @click="editScale"
    />
    <ActionItem
      icon="file_copy"
      label="Copy layout"
      @click="startAddLayout(true)"
    />
    <ActionItem
      icon="edit"
      label="Rename layout"
      @click="renameLayout"
    />
    <ActionItem
      icon="dashboard"
      label="Show layout on dashboard"
      @click="createLayoutWidget"
    />
    <ActionItem
      icon="mdi-file-export"
      label="Export layout"
      @click="exportLayout"
    />
    <ActionItem
      icon="delete"
      label="Remove all parts"
      @click="clearParts"
    />
    <ActionItem
      icon="delete"
      label="Remove layout"
      @click="removeLayout"
    />
  </ActionSubmenu>
</template>
