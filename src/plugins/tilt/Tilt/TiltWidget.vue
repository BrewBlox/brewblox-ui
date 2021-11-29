<script lang="ts">
import { debounce } from 'quasar';
import { computed, defineComponent } from 'vue';

import { useContext, useWidget } from '@/composables';
import { findById } from '@/utils/collections';

import { fieldLabels } from '../const';
import { useTiltStore } from '../store';
import { TiltStateValue } from '../types';
import { makeTiltId, splitTiltId } from '../utils';
import { TiltWidget } from './types';

export default defineComponent({
  name: 'TiltWidget',
  setup() {
    const tiltStore = useTiltStore();
    const { context } = useContext.setup();
    const { config, saveConfig } = useWidget.setup<TiltWidget>();

    const debouncedSaveConfig = debounce(saveConfig, 100, false);

    const tiltOpts = computed<SelectOption<string>[]>(() =>
      tiltStore.values.map((v) => ({ label: v.name, value: v.id })),
    );

    const tiltId = computed<string | null>({
      get: () => {
        const { serviceId, mac } = config.value;
        return serviceId && mac ? makeTiltId(serviceId, mac) : null;
      },
      set: (id) => {
        if (id) {
          const [serviceId, mac] = splitTiltId(id);
          saveConfig({ ...config.value, serviceId, mac });
        } else {
          saveConfig({ ...config.value, serviceId: null, mac: null });
        }
      },
    });

    const value = computed<TiltStateValue | null>(() =>
      findById(tiltStore.values, tiltId.value),
    );

    function setShown(key: string, value: boolean): void {
      config.value.hidden[key] = !value || undefined;
      debouncedSaveConfig();
    }

    return {
      tiltOpts,
      tiltId,
      fieldLabels,
      context,
      config,
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
      <CardWarning v-else-if="config.serviceId && config.mac">
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
      <SelectField v-model="tiltId" label="Tilt" :options="tiltOpts" />
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
