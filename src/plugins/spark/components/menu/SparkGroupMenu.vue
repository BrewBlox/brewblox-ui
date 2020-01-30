<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { blockTypes, GroupsBlock } from '@/plugins/spark/block-types';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import { Service, serviceStore } from '@/store/services';


@Component
export default class SparkGroupMenu extends DialogBase {

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get service(): Service {
    return serviceStore.serviceById(this.serviceId);
  }

  get groups(): GroupsBlock | null {
    return sparkStore.blockValues(this.service.id)
      .find(block => block.type === blockTypes.Groups) || null;
  }

  get groupNames(): string[] {
    return sparkStore.groupNames(this.service.id);
  }

  saveBlock(block: Block): void {
    sparkStore.saveBlock(block);
  }

  saveGroupNames(vals: string[] = this.groupNames): void {
    sparkStore.updateGroupNames([this.service.id, vals])
      .catch(() => { });
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <ActionCardWrapper v-bind="{context}">
      <template #toolbar>
        <DialogToolbar :title="service.id" subtitle="Group menu" />
      </template>

      <div class="widget-body column">
        <GroupsField
          :value="groups.data.active"
          :service-id="service.id"
          title="Active groups"
          label="Active groups"
          item-aligned
          @input="v => { groups.data.active = v; saveBlock(groups); }"
        />

        <div class="row q-mt-sm">
          <div
            v-for="(name, idx) in groupNames"
            :key="idx"
            class="col-4 q-pa-xs"
          >
            <InputField
              :value="name"
              :label="`Group ${idx + 1} name`"
              title="Group name"
              @input="v => { groupNames[idx] = v; saveGroupNames(); }"
            />
          </div>
        </div>
      </div>
    </ActionCardWrapper>
  </q-dialog>
</template>
