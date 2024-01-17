<script setup lang="ts">
import { computed } from 'vue';
import { useContext, useWidget } from '@/composables';
import { findById } from '@/utils/collections';
import { fieldLabels } from '../const';
import { useTiltStore } from '../store';
import { TiltStateValue } from '../types';
import { makeTiltId, splitTiltId } from '../utils';
import { TiltWidget } from './types';

const tiltStore = useTiltStore();
const { context } = useContext.setup();
const { config, patchConfig } = useWidget.setup<TiltWidget>();

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
      patchConfig({ serviceId, mac });
    } else {
      patchConfig({ serviceId: null, mac: null });
    }
  },
});

const value = computed<TiltStateValue | null>(() =>
  findById(tiltStore.values, tiltId.value),
);

function setShown(key: string, value: boolean): void {
  patchConfig({
    hidden: {
      ...config.value.hidden,
      [key]: !value || undefined,
    },
  });
}
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar has-mode-toggle />
    </template>

    <div
      v-if="context.mode === 'Basic'"
      class="widget-body"
    >
      <TiltValues
        v-if="value"
        :state="value"
        :hidden="config.hidden"
      />
      <CardWarning v-else-if="config.serviceId && config.mac">
        <template #message> Tilt not found </template>
      </CardWarning>
      <CardWarning v-else>
        <template #message> No Tilt selected </template>
      </CardWarning>
    </div>

    <div
      v-if="context.mode === 'Full'"
      class="widget-body column q-mt-none"
    >
      <SelectField
        v-model="tiltId"
        label="Tilt"
        :options="tiltOpts"
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
