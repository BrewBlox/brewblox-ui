<script lang="ts">
import { nanoid } from 'nanoid';
import { computed, defineComponent, PropType } from 'vue';
import { useRoute } from 'vue-router';

import { builderStore } from '@/plugins/builder/store';
import { BuilderConfig, BuilderLayout } from '@/plugins/builder/types';
import { dashboardStore } from '@/store/dashboards';
import { systemStore } from '@/store/system';
import { Widget, widgetStore } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { saveFile } from '@/utils/import-export';
import notify from '@/utils/notify';

import { startAddLayout } from '../utils';

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
    const route = useRoute();

    const layoutIds = computed<string[]>(
      () => builderStore.layoutIds,
    );

    const title = computed<string>(
      () => props.layout?.title ?? 'Unknown',
    );

    const label = computed<string | null>(
      () => props.noLabel ? null : title.value,
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

    const inEditor = computed<boolean>(
      () => route.path.startsWith('/builder'),
    );

    function selectLayout(id: string | null): void {
      emit('selected', id);
    }

    async function copyLayout(): Promise<void> {
      const id = await startAddLayout(props.layout);
      if (id) {
        selectLayout(id);
      }
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
      listed,
      inEditor,
      isHomePage,
      selectLayout,
      copyLayout,
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
      icon="file_copy"
      label="Copy layout"
      @click="copyLayout()"
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
