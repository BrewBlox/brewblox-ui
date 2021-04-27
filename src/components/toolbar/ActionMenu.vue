<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ActionMenu',
  props: {
    icon: {
      type: String,
      default: 'mdi-dots-vertical',
    },
    flat: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      default: 'Actions',
    },
  },
});
</script>

<template>
  <q-btn v-bind="{...$attrs, flat, icon}">
    <q-menu
      class="row q-gutter-x-sm bordered action-menu"
      anchor="bottom right"
      self="top right"
    >
      <ActionSubmenu
        v-if="!!$slots.actions"
        :label="label"
      >
        <slot name="actions" />
      </ActionSubmenu>
      <slot name="menus" />
    </q-menu>
    <slot />
  </q-btn>
</template>

<style lang="sass">
// Undo unwanted left-most margin introduced by q-gutter-x-sm
.action-menu > *:first-child
  margin-left: 0
</style>
