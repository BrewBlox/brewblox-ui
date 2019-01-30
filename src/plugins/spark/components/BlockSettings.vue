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
    <q-item>
      <q-item-side left color="grey-7">Block ID</q-item-side>
      <q-item-main>
        <InputPopupEdit
          :field="block.id"
          :change="$props.onChangeBlockId"
          display="span"
          label="Block ID"
        />
      </q-item-main>
    </q-item>
    <q-item>
      <q-item-side left color="grey-7">Block Type</q-item-side>
      <q-item-main>{{ block.type }}</q-item-main>
    </q-item>
    <q-item>
      <q-item-side left color="grey-7">Part of service</q-item-side>
      <q-item-main>{{ serviceId }}</q-item-main>
    </q-item>
    <q-item>
      <q-item-side left color="grey-7">Active in groups</q-item-side>
      <q-item-main>
        <GroupsPopupEdit
          :field="block.groups"
          :service-id="serviceId"
          :change="callAndSaveBlock(v => block.groups = v)"
          display="span"
        />
      </q-item-main>
    </q-item>
    <q-item v-if="$props.presetsData.length > 0">
      <q-item-side left color="grey-7">Apply preset</q-item-side>
      <q-item-main>
        <SelectPopupEdit
          :field="block.data"
          :options="$props.presetsData"
          :change="callAndSaveBlock(applyPreset)"
          label="preset"
          display="span"
        />
      </q-item-main>
    </q-item>
  </q-list>
</template>

