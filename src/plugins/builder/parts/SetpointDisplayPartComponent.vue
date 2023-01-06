<script lang="ts">
import { computed, defineComponent } from 'vue';
import {
  DEFAULT_SIZE,
  MAX_SIZE,
  MIN_SIZE,
} from '../blueprints/SetpointDisplay';
import { usePart } from '../composables';
import { liquidBorderColor } from '../utils';

export default defineComponent({
  name: 'SetpointDisplayPartComponent',
  setup() {
    const { part, width, height, bordered, passthrough } = usePart.setup();

    const borderColor = computed<string>(() => liquidBorderColor(part.value));

    return {
      DEFAULT_SIZE,
      MAX_SIZE,
      MIN_SIZE,
      width,
      height,
      bordered,
      borderColor,
      passthrough,
    };
  },
});
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
