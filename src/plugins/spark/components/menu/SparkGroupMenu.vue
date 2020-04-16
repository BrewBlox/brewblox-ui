<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { blockTypes, GroupsBlock } from '@/plugins/spark/block-types';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';


@Component
export default class SparkGroupMenu extends DialogBase {

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  get sparkModule(): SparkServiceModule | null {
    return sparkStore.moduleById(this.serviceId);
  }

  get block(): GroupsBlock | null {
    return this.sparkModule
      ?.blocks
      .find(v => v.type === blockTypes.Groups)
      ?? null;
  }

  get active(): number[] {
    return this.block?.data.active ?? [];
  }

  set active(v: number[]) {
    if (!this.block) { return; }
    this.block.data.active = v;
    this.saveBlock();
  }

  saveBlock(block: GroupsBlock | null = this.block) {
    if (this.sparkModule && block) {
      this.sparkModule.saveBlock(block);
    }
  }

  toggle(idx: number): void {
    this.active = this.active.includes(idx)
      ? this.active.filter(v => v !== idx)
      : [...this.active, idx];
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <ActionCardWrapper v-bind="{context}">
      <template #toolbar>
        <DialogToolbar :title="serviceId" subtitle="Group menu" />
      </template>

      <div class="widget-body column">
        <CardWarning>
          <template #message>
            Spark groups are deprecated, and this functionality will be removed in a later update.
          </template>
        </CardWarning>

        <LabeledField label="Active groups">
          <q-btn-group outline>
            <q-btn
              v-for="v in 7"
              :key="`group-${v}`"
              :label="`${v}`"
              :color="active.includes(v-1) ? 'primary' : ''"
              outline
              @click="toggle(v-1)"
            />
          </q-btn-group>
        </LabeledField>
      </div>
    </ActionCardWrapper>
  </q-dialog>
</template>
