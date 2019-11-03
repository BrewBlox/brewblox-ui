<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { QuasarNode } from '@/plugins/history/nodes';

import { GraphConfig } from '../types';


@Component
export default class GraphEditor extends Vue {

  @Prop({ type: Object, required: true })
  public readonly config!: GraphConfig;

  saveConfig(config: GraphConfig = this.config): void {
    this.$emit('update:config', config);
  }

  editLeaf(node: QuasarNode): void {
    createDialog({
      component: 'GraphDisplayDialog',
      title: node.value,
      parent: this,
      config: this.config,
      field: node.value,
    })
      .onOk(config => this.saveConfig(config));
  }
}
</script>

<template>
  <div>
    <GraphPeriodEditor :config="config" @update:config="saveConfig" />
    <QueryEditor :config="config" @update:config="saveConfig">
      <template #leaf="{node}">
        <div @click="editLeaf(node)">
          {{ node.label }}
          <q-tooltip>
            <i>Click to edit</i> <br />
            Label: <span>{{ config.renames[node.value] || node.label }}</span> <br />
            Color: <span>
              <ColorField
                :value="config.colors[node.value] || ''"
                null-text="automatic"
                readonly
              />
            </span> <br />
            Axis: <span>{{ config.axes[node.value] === 'y2' ? 'Y2' : 'Y1' }}</span>
          </q-tooltip>
        </div>
      </template>
    </QueryEditor>
  </div>
</template>
