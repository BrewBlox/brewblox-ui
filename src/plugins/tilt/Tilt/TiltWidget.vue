<script lang="ts">
import { debounce } from 'quasar';
import { computed, defineComponent } from 'vue';

import { useContext, useWidget } from '@/composables';
import { useServiceStore } from '@/store/services';

import { colorOpts, fieldLabels } from '../const';
import { useTiltStore } from '../store';
import { TiltStateValue } from '../types';
import { TiltWidget } from './types';

export default defineComponent({
  name: 'TiltWidget',
  setup() {
    const tiltStore = useTiltStore();
    const serviceStore = useServiceStore();
    const { context } = useContext.setup();
    const { widget, config, saveConfig } = useWidget.setup<TiltWidget>();

    const debouncedSaveConfig = debounce(saveConfig, 100, false);

    const serviceOpts = computed<SelectOption<string>[]>(() =>
      serviceStore.services
        .filter((v) => v.type === 'Tilt')
        .map((v) => ({ label: v.title, value: v.id })),
    );

    const value = computed<TiltStateValue | null>(
      () =>
        tiltStore.values.find(
          (v) =>
            v.serviceId === config.value.serviceId &&
            v.color === config.value.color,
        ) ?? null,
    );

    function setShown(key: string, value: boolean): void {
      config.value.hidden[key] = !value || undefined;
      debouncedSaveConfig();
    }

    return {
      colorOpts,
      fieldLabels,
      context,
      widget,
      config,
      saveConfig,
      serviceOpts,
      value,
      setShown,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar has-mode-toggle />
    </template>

    <div v-if="context.mode === 'Basic'" class="widget-body">
      <TiltValues v-if="value" :state="value" :hidden="config.hidden" />
      <CardWarning v-else-if="config.serviceId && config.color">
        <template #message>
          Tilt not found
        </template>
      </CardWarning>
      <CardWarning v-else>
        <template #message>
          No Tilt selected
        </template>
      </CardWarning>
    </div>

    <div v-if="context.mode === 'Full'" class="widget-body column q-mt-none">
      <SelectField
        label="Service"
        :options="serviceOpts"
        :model-value="config.serviceId"
        @update:model-value="
          (v) => {
            config.serviceId = v;
            saveConfig();
          }
        "
      />
      <SelectField
        label="Color"
        :options="colorOpts"
        :model-value="config.color"
        @update:model-value="
          (v) => {
            config.color = v;
            saveConfig();
          }
        "
      />
      <ActionSubmenu label="Shown values">
        <ToggleAction
          v-for="(label, key) in fieldLabels"
          :key="`toggle-${key}`"
          :model-value="!config.hidden[key]"
          :label="label"
          class="q-ml-sm"
          @update:model-value="(v) => setShown(key, v)"
        />
      </ActionSubmenu>
    </div>
  </Card>
</template>
