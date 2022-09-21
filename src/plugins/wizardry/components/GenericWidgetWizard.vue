<script lang="ts">
import { tryCreateWidget } from '@/plugins/wizardry';
import { useFeatureStore } from '@/store/features';
import { useWidgetStore } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { computed, defineComponent, onBeforeUnmount, ref } from 'vue';
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
  emits: [...useWidgetWizard.emits],
  setup(props) {
    const widgetStore = useWidgetStore();
    const featureStore = useFeatureStore();
    const { onBack, onDone, defaultWidgetSize, widgetId, featureTitle } =
      useWidgetWizard.setup(props.featureId);

    const defaultConfig =
      featureStore.widgetById(props.featureId)?.generateConfig?.() ?? {};
    const dashboardId = ref<string | null>(null);
    const widgetTitle = ref<string>(featureTitle);

    const canCreate = computed<boolean>(() => Boolean(dashboardId.value));

    async function ensureVolatile(): Promise<void> {
      if (!widgetStore.widgetById(widgetId)) {
        widgetStore.setVolatileWidget({
          id: widgetId,
          title: widgetTitle.value,
          feature: props.featureId,
          order: 0,
          dashboard: dashboardId.value ?? '',
          config: defaultConfig,
          ...defaultWidgetSize,
        });
      }
    }

    onBeforeUnmount(() => {
      const widget = widgetStore.widgetById(widgetId);
      if (widget) {
        widgetStore.removeVolatileWidget(widget);
      }
    });

    function showKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: widgetTitle.value,
        },
      }).onOk((v) => (widgetTitle.value = v));
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
      if (!canCreate.value) {
        return;
      }
      await ensureVolatile();
      const volatileWidget = widgetStore.widgetById(widgetId);
      if (volatileWidget) {
        const widget = await tryCreateWidget({
          ...volatileWidget,
          volatile: undefined,
        });
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
  <WizardBody>
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
      <q-btn
        unelevated
        label="Back"
        @click="onBack"
      />
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
  </WizardBody>
</template>
