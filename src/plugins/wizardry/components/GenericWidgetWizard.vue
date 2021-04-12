<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

import { tryCreateWidget } from '@/plugins/wizardry';
import { Widget } from '@/store/dashboards';
import { Crud, featureStore } from '@/store/features';
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

    const localConfig = ref<any>(
      featureStore
        .widgetById(props.featureId)
        ?.generateConfig?.()
      ?? {},
    );
    const dashboardId = ref<string | null>(null);
    const widgetTitle = ref<string>(featureTitle);

    const widget = computed<Widget>({
      get: () => ({
        id: widgetId,
        title: widgetTitle.value,
        feature: props.featureId,
        order: 0,
        dashboard: dashboardId.value ?? '',
        config: localConfig.value,
        ...defaultWidgetSize,
      }),
      set: ({ config }) => localConfig.value = config,
    });

    const crud = computed<Crud>(
      () => ({
        isStoreWidget: false,
        widget: widget.value,
        saveWidget: v => widget.value = v,
        closeDialog: () => { },
      }),
    );

    const canCreate = computed<boolean>(
      () => !!dashboardId.value,
    );

    function showKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          value: widgetTitle.value,
        },
      })
        .onOk(v => widgetTitle.value = v);
    }

    function showWidget(): void {
      createDialog({
        component: 'WidgetDialog',
        componentProps: {
          getCrud: () => crud.value,
        },
      });
    }

    async function createWidget(): Promise<void> {
      if (canCreate.value) {
        const created = await tryCreateWidget(widget.value);
        onDone({ widget: created });
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
