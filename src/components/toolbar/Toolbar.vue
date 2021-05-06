<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'Toolbar',
  props: {
    icon: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
  },
  emits: [
    'title-click',
  ],
  setup(props, { attrs }) {
    const readonly = computed<boolean>(
      () => attrs['onTitleClick'] === undefined,
    );

    return {
      readonly,
    };
  },
});
</script>

<template>
  <div class="row no-wrap full-height items-center">
    <q-icon v-if="icon" :name="icon" class="col-auto self-center q-px-sm" size="sm" />
    <div class="col no-wrap row ellipsis q-px-xs text-h6 items-center">
      <div
        :class="{pointer: !readonly}"
        @click="$emit('title-click')"
      >
        {{ title }}
      </div>
      <q-space />
      <div
        v-if="!!subtitle"
        class="subtitle q-px-sm col-shrink ellipsis"
      >
        {{ subtitle }}
      </div>
    </div>
    <slot />
    <slot name="buttons" />
  </div>
</template>

<style lang="sass" scoped>
.subtitle
  opacity: 0.8
  font-style: italic
  font-size: 70%
  font-weight: 300
</style>
