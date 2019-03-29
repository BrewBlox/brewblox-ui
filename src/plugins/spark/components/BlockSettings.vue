<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

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
      type: 'positive',
      message: 'Applying preset',
    });
  }
}
</script>

<template>
  <q-list>
    <q-item dark>
      <q-item-section>Block ID</q-item-section>
      <q-item-section>
        <InputPopupEdit
          :field="block.id"
          :change="$props.onChangeBlockId"
          tag="span"
          label="Block ID"
        />
      </q-item-section>
    </q-item>
    <q-item dark>
      <q-item-section>Block Type</q-item-section>
      <q-item-section>{{ block.type }}</q-item-section>
    </q-item>
    <q-item dark>
      <q-item-section>Part of service</q-item-section>
      <q-item-section>{{ serviceId }}</q-item-section>
    </q-item>
    <q-item dark>
      <q-item-section>Active in groups</q-item-section>
      <q-item-section>
        <GroupsPopupEdit
          :field="block.groups"
          :service-id="serviceId"
          :change="callAndSaveBlock(v => block.groups = v)"
          tag="span"
        />
      </q-item-section>
    </q-item>
    <q-item v-if="$props.presetsData.length > 0" dark>
      <q-item-section>Apply preset</q-item-section>
      <q-item-section>
        <SelectPopupEdit
          :field="block.data"
          :options="$props.presetsData"
          :change="callAndSaveBlock(applyPreset)"
          label="preset"
          tag="span"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

