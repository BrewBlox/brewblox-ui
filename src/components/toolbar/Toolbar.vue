<script setup lang="ts">
import { computed, ref } from 'vue';
import { getNumDialogs } from '@/utils/dialog';

interface Props {
  title: string;
  subtitle?: string;
  icon?: string;
  changeTitleFn?: () => unknown;
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  icon: '',
});

defineEmits<{
  close: [];
}>();

const toolbarRef = ref<Element>();

// We can't use WidgetContext here: this component is also used by non-widgets.
// We'll assume that if any parent is a q-dialog, this is a dialog toolbar.
// This will break if we have a dialog with a nested component with toolbar.
const inDialog = computed<boolean>(
  () => toolbarRef.value?.closest('.q-dialog') != null,
);

const numDialogs = computed<number>(() => getNumDialogs());
</script>

<template>
  <div
    ref="toolbarRef"
    class="row no-wrap full-height items-center"
  >
    <q-icon
      v-if="icon"
      :name="icon"
      class="col-auto self-center q-px-sm"
      size="sm"
    />
    <div class="col row no-wrap ellipsis q-px-xs text-h6 items-center">
      <div
        :class="{ pointer: changeTitleFn != null }"
        @click="changeTitleFn && changeTitleFn()"
      >
        {{ title }}
      </div>
      <q-space />
      <div
        v-if="!!subtitle"
        class="col-shrink subtitle q-px-sm ellipsis"
      >
        {{ subtitle }}
      </div>
    </div>
    <slot />
    <slot name="buttons" />
    <q-btn
      v-if="inDialog"
      v-close-popup
      flat
      round
      dense
      :icon="numDialogs > 1 ? 'mdi-arrow-left-circle' : 'mdi-close-circle'"
      class="close-button"
      @click="$emit('close')"
    />
  </div>
</template>

<style lang="sass" scoped>
.subtitle
  opacity: 0.8
  font-style: italic
  font-size: 70%
  font-weight: 300
</style>
