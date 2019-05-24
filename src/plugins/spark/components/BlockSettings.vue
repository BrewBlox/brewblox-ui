<script lang="ts">
import Component from 'vue-class-component';

import BlockForm from '@/plugins/spark/components/BlockForm';

@Component({
  props: {
    presetsData: {
      type: Array,
      required: true,
    },
  },
})
export default class BlockSettings extends BlockForm {
  applyPreset(presetData: any) {
    this.block.data = { ...this.block.data, ...presetData };
    this.$q.notify({
      color: 'positive',
      message: 'Applying preset',
    });
  }
}
</script>

<template>
  <q-list>
    <q-item dark>
      <q-item-section>
        <q-item-label caption>Block ID</q-item-label>
        <InputPopupEdit
          :field="block.id"
          :change="$props.onChangeBlockId"
          tag="span"
          label="Block ID"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label caption>Block Type</q-item-label>
        <span>{{ block.type }}</span>
      </q-item-section>
    </q-item>
    <q-item dark>
      <q-item-section>
        <q-item-label caption>Part of service</q-item-label>
        <span>{{ serviceId }}</span>
      </q-item-section>
      <q-item-section>
        <q-item-label caption>Active in groups</q-item-label>
        <GroupsPopupEdit
          :field="block.groups"
          :service-id="serviceId"
          :change="callAndSaveBlock(v => block.groups = v)"
          tag="span"
        />
      </q-item-section>
    </q-item>
    <q-item v-if="$props.presetsData.length > 0" dark>
      <q-item-section>
        <q-item-label caption>Apply block settings preset</q-item-label>
        <SelectPopupEdit
          :field="block.data"
          :options="$props.presetsData"
          :change="callAndSaveBlock(applyPreset)"
          label="Select a preset"
          tag="span"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

