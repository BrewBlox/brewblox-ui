<script lang="ts">

import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { deepCopy } from '@/helpers/units/parseObject';
import { blockIdRules } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';

import BlockCrudComponent from '../BlockCrudComponent';

@Component
export default class RemoveBlockAction extends BlockCrudComponent {

  @Prop({ type: String, default: 'Clone Block' })
  readonly label!: string;

  @Prop({ type: String, default: 'file_copy' })
  readonly icon!: string;

  suggestedId(): string {
    const existingIds = sparkStore.blockIds(this.serviceId);

    const copyName = (i: number): string =>
      (this.blockId.match(/-\d+$/)
        ? this.blockId.replace(/-\d+$/, `-${i}`)
        : `${this.blockId}-${i}`);

    let idx = 2;
    while (existingIds.includes(copyName(idx))) {
      idx += 1;
    }

    return copyName(idx);
  }

  public startCloneBlock(): void {
    createDialog({
      component: 'InputDialog',
      title: 'Clone Block',
      message: `This will create an additional Block
      with the exact same settings on your Spark.`,
      value: this.suggestedId(),
      label: 'Block ID',
      clearable: false,
      rules: blockIdRules(this.serviceId),
    })
      .onOk(id => {
        sparkStore.createBlock([this.serviceId, { ...deepCopy(this.block), id }])
          .then(() => this.$q.notify({
            icon: 'mdi-check-all',
            color: 'positive',
            message: `Created ${this.displayName} Block '${id}'`,
          }))
          .catch(e => this.$q.notify({
            icon: 'error',
            color: 'negative',
            message: `Failed to create Block: ${e.toString()}`,
          }));
      });
  }
}
</script>

<template>
  <ActionItem v-bind="{...$attrs, ...$props}" @click="startCloneBlock" />
</template>
