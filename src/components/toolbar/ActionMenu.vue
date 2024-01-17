<script setup lang="ts">
interface Props {
  icon?: string;
  flat?: boolean;
  label?: string;
}

withDefaults(defineProps<Props>(), {
  icon: 'mdi-dots-vertical',
  flat: true,
  label: 'Actions',
});
</script>

<template>
  <q-btn v-bind="{ ...$attrs, flat, icon }">
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
