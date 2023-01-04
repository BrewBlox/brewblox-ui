<script lang="ts">
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { liquidBorderColor } from '../utils';

export default defineComponent({
  name: 'PwmDisplayPartComponent',
  setup() {
    const { part, bordered, width, height, universalFlow } = usePart.setup();

    const borderColor = computed<string>(() => liquidBorderColor(part.value));

    return {
      width,
      height,
      bordered,
      universalFlow,
      borderColor,
    };
  },
});
</script>

<template>
  <PwmValues v-bind="{ width, height }">
    <BuilderBorder
      v-if="bordered"
      :color="borderColor"
    />

    <template #menu-content>
      <SizeMenuContent
        :min="{ width: 1, height: 1 }"
        :max="{ width: 5, height: 5 }"
        :default="{ width: 1, height: 1 }"
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
  </PwmValues>
</template>
