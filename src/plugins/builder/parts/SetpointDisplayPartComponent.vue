<script setup lang="ts">
import {
  DEFAULT_SIZE,
  MAX_SIZE,
  MIN_SIZE,
} from '../blueprints/SetpointDisplay';
import { usePart } from '../composables';
import { liquidBorderColor } from '../utils';
import { computed } from 'vue';

const { flows, width, height, bordered, passthrough } = usePart.setup();

const borderColor = computed<string>(() => liquidBorderColor(flows.value));
</script>

<template>
  <SetpointValues
    v-bind="{ width, height, bordered, borderColor }"
    always
  >
    <BuilderBorder
      v-if="bordered"
      :color="borderColor"
      :width="100"
    />

    <template #menu-content>
      <SizeMenuContent
        :min="MIN_SIZE"
        :max="MAX_SIZE"
        :default="DEFAULT_SIZE"
      />
      <ToggleMenuContent
        v-model="bordered"
        label="Border"
      />
      <ToggleMenuContent
        v-model="passthrough"
        label="Flow through part"
      />
    </template>
  </SetpointValues>
</template>
