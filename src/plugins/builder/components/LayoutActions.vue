<script lang="ts">
import { nanoid } from 'nanoid';
import { computed, defineComponent, PropType } from 'vue';

import { defaultLayoutHeight, defaultLayoutWidth } from '@/plugins/builder/const';
import { builderStore } from '@/plugins/builder/store';
import { BuilderConfig, BuilderLayout } from '@/plugins/builder/types';
import { dashboardStore } from '@/store/dashboards';
import { systemStore } from '@/store/system';
import { Widget, widgetStore } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { deepCopy } from '@/utils/functional';
import { saveFile } from '@/utils/import-export';
import notify from '@/utils/notify';

export default defineComponent({
  name: 'LayoutActions',
  props: {
    layout: {
      type: Object as PropType<BuilderLayout | null>,
      default: null,
    },
    noLabel: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'selected',
  ],
  setup(props, { emit }) {
    const layoutIds = computed<string[]>(
      () => builderStore.layoutIds,
    );

    const title = computed<string>(
      () => props.layout?.title ?? 'Unknown',
    );

    const label = computed<string | null>(
      () => props.noLabel ? null : title.value,
    );

    const scale = computed<number>(
      () => props.layout?.scale || 1,
    );

    const listed = computed<boolean>({
      get: () => props.layout?.listed ?? true,
      set: v => {
        if (props.layout) {
          builderStore.saveLayout({ ...props.layout, listed: v });
        }
      },
    });

    const isHomePage = computed<boolean>({
      get: () => systemStore.config.homePage === `/brewery/${props.layout?.id}`,
      set: v => {
        const homePage = v && props.layout ? `/brewery/${props.layout.id}` : null;
        systemStore.saveConfig({ homePage });
      },
    });

    function selectLayout(id: string | null): void {
      emit('selected', id);
    }

    function editScale(): void {
      createDialog({
        component: 'InputDialog',
        componentProps: {
          title: 'Set zoom level',
          suffix: '%',
          modelValue: (1 / scale.value) * 100,
          rules: [
            v => v === null || v > 0 || 'Value must be > 0',
          ],
        },
      })
        .onOk(v => {
          if (props.layout) {
            const scale = 100 / (v ?? 100);
            builderStore.saveLayout({ ...props.layout, scale });
          }
        });
    }

    function startAddLayout(copy: boolean): void {
      createDialog({
        component: 'InputDialog',
        componentProps: {
          title: 'Add Layout',
          message: 'Create a new Brewery Builder layout',
          modelValue: 'Brewery Layout',
        },
      })
        .onOk(async title => {
          const id = nanoid();
          await builderStore.createLayout({
            id,
            title,
            width: copy && props.layout ? props.layout.width : defaultLayoutWidth,
            height: copy && props.layout ? props.layout.height : defaultLayoutHeight,
            parts: copy && props.layout ? deepCopy(props.layout.parts) : [],
          });
          selectLayout(id);
        });
    }

    function exportLayout(): void {
      if (!props.layout) {
        return;
      }
      const { id, ...exported } = props.layout;
      void id;
      saveFile(exported, `brewblox-${props.layout.title}-layout.json`);
    }

    function renameLayout(): void {
      if (!props.layout) {
        return;
      }
      createDialog({
        component: 'InputDialog',
        componentProps: {
          title: 'Change Layout title',
          message: `Choose a new name for ${props.layout.title}`,
          modelValue: props.layout.title,
        },
      })
        .onOk(title => {
          if (props.layout) {
            builderStore.saveLayout({ ...props.layout, title });
          }
        });
    }

    function clearParts(): void {
      createDialog({
        component: 'ConfirmDialog',
        componentProps: {
          title: 'Remove parts',
          message: 'Are you sure you wish to remove all parts?',
          noBackdropDismiss: true,
        },
      })
        .onOk(() => {
          if (props.layout) {
            builderStore.saveLayout({ ...props.layout, parts: [] });
          }
        });
    }

    function removeLayout(): void {
      if (!props.layout) {
        return;
      }
      createDialog({
        component: 'ConfirmDialog',
        componentProps: {
          title: 'Remove layout',
          message: `Are you sure you wish to remove ${props.layout.title}?`,
          noBackdropDismiss: true,
        },
      })
        .onOk(async () => {
          if (props.layout) {
            await builderStore.removeLayout(props.layout)
              .catch(() => { });
          }
          const [id] = layoutIds.value;
          selectLayout(id || null);
        });
    }

    function createLayoutWidget(): void {
      if (!props.layout) { return; }

      const selectOptions = dashboardStore.dashboards
        .map(dashboard => ({
          label: dashboard.title,
          value: dashboard.id,
        }));

      createDialog({
        component: 'SelectDialog',
        componentProps: {
          title: 'Make widget',
          message: `On which dashboard do you want to create a widget for <b>${props.layout.title}</b>?`,
          listSelect: selectOptions.length < 10,
          html: true,
          selectOptions,
        },
      })
        .onOk(async (dashboard: string) => {
          const layout = props.layout!;
          const widget: Widget<BuilderConfig> = {
            id: nanoid(),
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
          await widgetStore.appendWidget(widget);
          notify.done(`Created <b>${layout.title}</b> widget on <b>${dashboardStore.dashboardTitle(dashboard)}</b>`);
        });
    }

    return {
      label,
      scale,
      listed,
      isHomePage,
      selectLayout,
      editScale,
      startAddLayout,
      renameLayout,
      createLayoutWidget,
      exportLayout,
      clearParts,
      removeLayout,
    };
  },
});
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
