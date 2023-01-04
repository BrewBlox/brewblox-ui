<script lang="ts">
import { computed, defineComponent } from 'vue';
import { DEFAULT_SIZE_X, DEFAULT_SIZE_Y } from '../blueprints/SetpointDisplay';
import { usePart } from '../composables';
import { liquidBorderColor } from '../utils';

export default defineComponent({
  name: 'SetpointDisplayPartComponent',
  setup() {
    const { part, width, height, bordered, universalFlow } = usePart.setup();

    const borderColor = computed<string>(() => liquidBorderColor(part.value));

    return {
      DEFAULT_SIZE_X,
      DEFAULT_SIZE_Y,
      width,
      height,
      bordered,
      borderColor,
      universalFlow,
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
        :min="{ width: 2, height: 1 }"
        :max="{ width: 10, height: 5 }"
        :default="{ width: DEFAULT_SIZE_X, height: DEFAULT_SIZE_Y }"
      />
      <ToggleMenuContent
        v-model="bordered"
        label="Border"
      />
      <ToggleMenuContent
        v-model="universalFlow"
        label="Flow through part"
      />
    </template>
  </SetpointValues>
</template>
