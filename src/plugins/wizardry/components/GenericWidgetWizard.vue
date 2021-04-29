<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, ref } from 'vue';

import { tryCreateWidget } from '@/plugins/wizardry';
import { featureStore } from '@/store/features';
import { Widget, widgetStore } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';

import { useWidgetWizard } from '../composables';

export default defineComponent({
  name: 'GenericWidgetWizard',
  props: {
    ...useWidgetWizard.props,
    activeDashboardId: {
      type: String,
      default: null,
    },
  },
  emits: [
    ...useWidgetWizard.emits,
  ],
  setup(props) {
    const {
      onBack,
      onDone,
      defaultWidgetSize,
      widgetId,
      featureTitle,
    } = useWidgetWizard.setup(props.featureId);

    const defaultConfig = featureStore.widgetById(props.featureId)?.generateConfig?.() ?? {};
    const activeWidget = ref<Widget | null>(null);
    const dashboardId = ref<string | null>(null);
    const widgetTitle = ref<string>(featureTitle);

    const canCreate = computed<boolean>(
      () => Boolean(dashboardId.value),
    );

    async function ensureVolatile(): Promise<void> {
      await widgetStore.setVolatileWidget({
        id: widgetId,
        title: widgetTitle.value,
        feature: props.featureId,
        order: 0,
        dashboard: dashboardId.value ?? '',
        config: activeWidget.value?.config ?? defaultConfig,
        ...defaultWidgetSize,
      });
      activeWidget.value = widgetStore.widgetById(widgetId);
    }

    onBeforeUnmount(() => {
      if (activeWidget.value) {
        widgetStore.removeVolatileWidget(activeWidget.value);
      }
    });

    function showKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: widgetTitle.value,
        },
      })
        .onOk(v => widgetTitle.value = v);
    }

    async function showWidget(): Promise<void> {
      await ensureVolatile();
      createDialog({
        component: 'WidgetDialog',
        componentProps: {
          widgetId,
        },
      });
    }

    async function createWidget(): Promise<void> {
      await ensureVolatile();
      if (canCreate.value && activeWidget.value) {
        const widget = await tryCreateWidget(activeWidget.value);
        onDone({ widget });
      }
    }

    return {
      onBack,
      dashboardId,
      widgetTitle,
      showKeyboard,
      showWidget,
      canCreate,
      createWidget,
    };
  },
});
</script>

<template>
  <ActionCardBody>
    <div class="widget-body column">
      <DashboardSelect
        v-model="dashboardId"
        :default-value="activeDashboardId"
      />

      <q-input
        v-model="widgetTitle"
        label="Widget name"
      >
        <template #append>
          <KeyboardButton @click="showKeyboard" />
        </template>
      </q-input>
    </div>

    <template #actions>
      <q-btn unelevated label="Back" @click="onBack" />
      <q-space />
      <q-btn
        unelevated
        label="Configure"
        @click="showWidget"
      />
      <q-btn
        :disable="!canCreate"
        unelevated
        label="Create"
        color="primary"
        @click="createWidget"
      />
    </template>
  </ActionCardBody>
</template>
