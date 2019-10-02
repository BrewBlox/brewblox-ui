<script lang="ts">
import { Component } from 'vue-property-decorator';

import CrudComponent from './CrudComponent';

@Component
export default class WidgetDialogToolbar extends CrudComponent { }
</script>

<template>
  <DialogToolbar>
    <q-item-section>
      <q-item-label>{{ widget.title }}</q-item-label>
      <q-item-label caption>
        {{ displayName }}
      </q-item-label>
    </q-item-section>
    <slot />
    <template v-slot:buttons>
      <slot name="buttons">
        <q-btn-dropdown flat icon="mdi-pencil">
          <q-list dark bordered>
            <slot name="actions" />
            <WidgetActions :crud="crud" />
          </q-list>
        </q-btn-dropdown>
      </slot>
    </template>
  </DialogToolbar>
</template>
