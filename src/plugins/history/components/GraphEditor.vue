<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { QuasarNode } from '@/plugins/history/nodes';

import { GraphConfig } from '../types';


@Component
export default class GraphEditor extends Vue {

  @Prop({ type: Object, default: () => ({}) })
  readonly downsampling!: Mapped<string>;

  @Prop({ type: Boolean, default: false })
  public readonly noPeriod!: boolean;

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
    <GraphPeriodEditor
      v-if="!noPeriod"
      :config="config"
      :downsampling="downsampling"
      @update:config="saveConfig"
    />
    <QueryEditor :config="config" @update:config="saveConfig">
      <template #leaf="{node}">
        <div @click="editLeaf(node)">
          {{ node.label }}
          <q-tooltip>
            <i>Click to edit</i>
            <LabeledField
              :value="config.renames[node.value] || node.label"
              label="Label"
              dense
              class="q-mt-sm"
            />
            <ColorField
              :value="config.colors[node.value] || ''"
              label="Color"
              null-text="automatic"
              readonly
              dense
              class="q-mt-sm"
            />
            <LabeledField
              :value="config.axes[node.value] === 'y2' ? 'Y2' : 'Y1'"
              label="Axis"
              dense
              class="q-mt-sm"
            />
          </q-tooltip>
        </div>
      </template>
    </QueryEditor>
  </div>
</template>
