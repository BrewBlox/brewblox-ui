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
  <div>
    <q-field label="Block ID">
      <InputPopupEdit
        :field="block.id"
        :change="$props.onChangeBlockId"
        display="span"
        label="Block ID"
      />
    </q-field>
    <q-field label="Block Type">
      <span>{{ block.type }}</span>
    </q-field>
    <q-field label="Part of service">
      <span>{{ serviceId }}</span>
    </q-field>
    <q-field label="Active in groups">
      <GroupsPopupEdit
        :field="block.groups"
        :service-id="serviceId"
        :change="callAndSaveBlock(v => block.groups = v)"
        display="span"
      />
    </q-field>
    <q-field v-if="$props.presetsData.length > 0" label="Apply preset">
      <SelectPopupEdit
        :field="block.data"
        :options="$props.presetsData"
        :change="callAndSaveBlock(applyPreset)"
        label="preset"
        display="span"
      />
    </q-field>
  </div>
</template>
