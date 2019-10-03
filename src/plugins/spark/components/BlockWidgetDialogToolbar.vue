<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import { WidgetMode } from '@/store/features';

import BlockCrudComponent from './BlockCrudComponent';


@Component
export default class BlockWidgetDialogToolbar extends BlockCrudComponent {
  graphModalOpen = false;

  @Prop({ type: String, default: 'Basic' })
  public readonly mode!: WidgetMode;

  @Emit('update:mode')
  public toggleMode(): WidgetMode {
    return this.mode === 'Basic' ? 'Full' : 'Basic';
  }
}
</script>

<template>
  <WidgetDialogToolbar :crud="crud">
    <BlockGraph
      v-if="graphModalOpen"
      :id="widget.id"
      v-model="graphModalOpen"
      :config.sync="graphCfg"
    />
    <template v-slot:buttons>
      <q-btn flat icon="mdi-account-switch" @click="toggleMode" />
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
  </WidgetDialogToolbar>
</template>
