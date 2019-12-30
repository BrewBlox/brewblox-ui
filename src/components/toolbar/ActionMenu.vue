<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';


@Component
export default class ActionMenu extends Vue {

}
</script>

<template>
  <q-btn v-bind="$attrs" flat icon="mdi-dots-vertical">
    <q-tooltip>
      Show menu
    </q-tooltip>
    <q-menu content-class="row q-gutter-x-sm bordered">
      <template v-if="$slots.actions">
        <ActionSubmenu label="Actions">
          <slot name="actions" />
        </ActionSubmenu>
      </template>
      <slot name="menus" />
    </q-menu>
  </q-btn>
</template>
