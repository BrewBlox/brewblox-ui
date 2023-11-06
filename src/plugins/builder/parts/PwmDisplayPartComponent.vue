<script setup lang="ts">
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../blueprints/PwmDisplay';
import { usePart } from '../composables';
import { liquidBorderColor } from '../utils';
import { computed } from 'vue';

const { flows, bordered, width, height, passthrough } = usePart.setup();

const borderColor = computed<string>(() => liquidBorderColor(flows.value));
</script>

<template>
  <PwmValues v-bind="{ width, height }">
    <BuilderBorder
      v-if="bordered"
      :color="borderColor"
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
  </PwmValues>
</template>
