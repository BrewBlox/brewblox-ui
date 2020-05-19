<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component
export default class ActionMenu extends Vue {

  @Prop({ type: String, default: 'mdi-dots-vertical' })
  public readonly icon!: string;

  @Prop({ type: Boolean, default: true })
  public readonly flat!: boolean;

}
</script>

<template>
  <q-btn v-bind="$attrs" :flat="flat" :icon="icon">
    <q-menu
      content-class="row q-gutter-x-sm bordered"
      anchor="bottom right"
      self="top right"
    >
      <template v-if="$slots.actions">
        <ActionSubmenu label="Actions">
          <slot name="actions" />
        </ActionSubmenu>
      </template>
      <slot name="menus" />
    </q-menu>
    <slot />
  </q-btn>
</template>
