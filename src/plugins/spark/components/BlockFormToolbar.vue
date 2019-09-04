<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from './BlockCrudComponent';


@Component
export default class BlockFormToolbar extends BlockCrudComponent {
  graphModalOpen = false;

}
</script>

<template>
  <FormToolbar :crud="crud">
    <BlockGraph
      v-if="graphModalOpen"
      :id="widget.id"
      v-model="graphModalOpen"
      :config.sync="graphCfg"
    />
    <template v-slot:buttons>
      <q-btn-dropdown flat icon="mdi-pencil">
        <q-list dark bordered>
          <ActionItem icon="refresh" label="Refresh" @click="refreshBlock" />
          <ActionItem
            v-if="hasGraph"
            icon="mdi-chart-line"
            label="Show graph"
            @click="graphModalOpen = true"
          />
          <slot name="actions" />
          <WidgetActions :crud="crud" no-rename />
          <BlockActions :crud="crud" />
        </q-list>
      </q-btn-dropdown>
    </template>
  </FormToolbar>
</template>
