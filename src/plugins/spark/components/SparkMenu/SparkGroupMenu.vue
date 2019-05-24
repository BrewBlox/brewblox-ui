<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import serviceStore from '@/store/services';


@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class SparkGroupMenu extends Vue {
  get service() {
    return serviceStore.serviceById(this.$props.serviceId);
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
  <q-card dark class="widget-modal">
    <FormToolbar>
      <q-item-section>
        <q-item-label>{{ service.id }}</q-item-label>
        <q-item-label caption>Group menu</q-item-label>
      </q-item-section>
    </FormToolbar>

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>Active groups</q-item-label>
          <GroupsPopupEdit
            :field="groups.data.active"
            :service-id="service.id"
            :change="v => { groups.data.active = v; saveBlock(groups); }"
          />
        </q-item-section>
      </q-item>

      <q-item dense/>

      <div class="row">
        <q-item v-for="(name, idx) in groupNames" :key="idx" dark class="col-4">
          <q-item-section>
            <q-item-label caption>{{ `Group ${idx + 1} name` }}</q-item-label>
            <InputPopupEdit
              :field="name"
              :change="v => { groupNames[idx] = v; saveGroupNames(); }"
              label="Group"
              tag="span"
            />
          </q-item-section>
        </q-item>
      </div>
    </q-card-section>
  </q-card>
</template>
