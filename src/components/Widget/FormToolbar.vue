<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from './CrudComponent';

@Component
export default class FormToolbar extends CrudComponent {
  @Prop({ type: String, required: true })
  readonly title!: string;
}
</script>

<template>
  <DialogToolbar>
    <span class="text-h6 q-mr-md">{{ widget.title }}</span>
    <slot/>
    <template v-slot:buttons>
      <slot name="buttons">
        <q-btn-dropdown flat icon="mdi-pencil">
          <q-list dark bordered>
            <slot name="actions"/>
            <WidgetActions :crud="crud" no-rename/>
          </q-list>
        </q-btn-dropdown>
      </slot>
    </template>
  </DialogToolbar>
</template>
