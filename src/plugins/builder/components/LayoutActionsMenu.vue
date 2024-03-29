<script setup lang="ts">
import { nanoid } from 'nanoid';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBuilderStore } from '@/plugins/builder/store';
import { BuilderConfig, BuilderLayout } from '@/plugins/builder/types';
import {
  startChangeLayoutTitle,
  startCreateLayout,
  startRemoveLayout,
} from '@/plugins/builder/utils';
import { useDashboardStore } from '@/store/dashboards';
import { useSystemStore } from '@/store/system';
import { useWidgetStore, Widget } from '@/store/widgets';
import { userUISettings } from '@/user-settings';
import { createDialog } from '@/utils/dialog';
import { saveFile } from '@/utils/import-export';
import { notify } from '@/utils/notify';

interface Props {
  layout?: BuilderLayout | null;
  noLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  layout: null,
  noLabel: false,
});

const systemStore = useSystemStore();
const dashboardStore = useDashboardStore();
const widgetStore = useWidgetStore();
const builderStore = useBuilderStore();
const router = useRouter();

const title = computed<string>(() => props.layout?.title ?? 'Unknown');

const label = computed<string | null>(() =>
  props.noLabel ? null : title.value,
);

const isHomePage = computed<boolean>({
  get: () => userUISettings.value.homePage === `/brewery/${props.layout?.id}`,
  set: (v) => {
    const homePage = v && props.layout ? `/brewery/${props.layout.id}` : null;
    systemStore.patchUserUISettings({ homePage });
  },
});

async function copyLayout(): Promise<void> {
  await startCreateLayout(router, props.layout);
}

function exportLayout(): void {
  if (!props.layout) {
    return;
  }
  const { id, ...exported } = props.layout;
  void id;
  saveFile(exported, `brewblox-${props.layout.title}-layout.json`);
}

function clearParts(): void {
  createDialog({
    component: 'ConfirmDialog',
    componentProps: {
      title: 'Remove parts',
      message: 'Are you sure you wish to remove all parts?',
    },
    noBackdropDismiss: true,
  }).onOk(() => {
    if (props.layout) {
      builderStore.saveLayout({ ...props.layout, parts: [] });
    }
  });
}

function createLayoutWidget(): void {
  if (!props.layout) {
    return;
  }

  const selectOptions = dashboardStore.dashboards.map((dashboard) => ({
    label: dashboard.title,
    value: dashboard.id,
  }));

  createDialog({
    component: 'SelectDialog',
    componentProps: {
      title: 'Make widget',
      message:
        'On which dashboard do you want to create a widget' +
        `for <b>${props.layout.title}</b>?`,
      listSelect: selectOptions.length < 10,
      html: true,
      modelValue: null,
      selectOptions,
    },
  }).onOk(async (dashboard: string) => {
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
    const dashTitle = dashboardStore.dashboardTitle(dashboard);
    notify.done(`Created <b>${layout.title}</b> widget on <b>${dashTitle}</b>`);
  });
}
</script>

<template>
  <ActionSubmenu
    v-if="!!layout"
    v-bind="{ label, ...$attrs }"
  >
    <slot />
    <ToggleAction
      v-model="isHomePage"
      icon="home"
      :label="isHomePage ? 'Is home page' : 'Make home page'"
    />
    <ActionItem
      icon="file_copy"
      label="Copy layout"
      @click="copyLayout()"
    />
    <ActionItem
      icon="edit"
      label="Change layout name"
      @click="startChangeLayoutTitle(layout)"
    />
    <ActionItem
      icon="dashboard"
      label="Create widget for layout"
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
      @click="startRemoveLayout(layout, $router)"
    />
  </ActionSubmenu>
</template>
