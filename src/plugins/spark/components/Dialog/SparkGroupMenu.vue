<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import serviceStore from '@/store/services';


@Component
export default class SparkGroupMenu extends DialogBase {

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get service() {
    return serviceStore.serviceById(this.serviceId);
  }

  get groups() {
    return sparkStore.blockValues(this.service.id)
      .find(block => block.type === 'Groups');
  }

  get groupNames(): string[] {
    return sparkStore.groupNames(this.service.id);
  }

  saveBlock(block: Block) {
    sparkStore.saveBlock([this.service.id, block]);
  }

  saveGroupNames(vals: string[] = this.groupNames) {
    sparkStore.updateGroupNames([this.service.id, vals]);
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card dark class="widget-modal">
      <DialogToolbar @close="onDialogHide">
        <q-item-section>
          <q-item-label>{{ service.id }}</q-item-label>
          <q-item-label caption>Group menu</q-item-label>
        </q-item-section>
      </DialogToolbar>

      <q-card-section>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Active groups</q-item-label>
            <GroupsField
              :value="groups.data.active"
              :service-id="service.id"
              title="Active groups"
              @input="v => { groups.data.active = v; saveBlock(groups); }"
            />
          </q-item-section>
        </q-item>

        <q-item dense/>

        <div class="row">
          <q-item v-for="(name, idx) in groupNames" :key="idx" dark class="col-4">
            <q-item-section>
              <q-item-label caption>{{ `Group ${idx + 1} name` }}</q-item-label>
              <InputField
                :value="name"
                title="Group name"
                @input="v => { groupNames[idx] = v; saveGroupNames(); }"
              />
            </q-item-section>
          </q-item>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
