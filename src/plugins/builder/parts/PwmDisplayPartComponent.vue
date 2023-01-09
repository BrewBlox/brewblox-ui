<script lang="ts">
import { computed, defineComponent } from 'vue';
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../blueprints/PwmDisplay';
import { usePart } from '../composables';
import { liquidBorderColor } from '../utils';

export default defineComponent({
  name: 'PwmDisplayPartComponent',
  setup() {
    const { part, bordered, width, height, passthrough } = usePart.setup();

    const borderColor = computed<string>(() => liquidBorderColor(part.value));

    return {
      MIN_SIZE,
      MAX_SIZE,
      DEFAULT_SIZE,
      width,
      height,
      bordered,
      passthrough,
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
