<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from './BlockCrudComponent';


@Component
export default class BlockFormToolbar extends BlockCrudComponent {

}
</script>

<template>
  <FormToolbar :crud="crud">
    <template v-slot:buttons>
      <q-btn-dropdown flat icon="mdi-pencil">
        <q-list dark bordered>
          <ActionItem icon="refresh" label="Refresh" @click="refreshBlock" />
          <slot name="actions" />
          <WidgetActions :crud="crud" no-rename />
          <BlockActions :crud="crud" />
        </q-list>
      </q-btn-dropdown>
    </template>
  </FormToolbar>
</template>
