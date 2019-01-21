<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component({
  props: {
    presetsFunc: {
      type: Function,
      required: true,
    },
  },
})
export default class BlockSettings extends BlockForm {
  presets() {
    return this.$props.presetsFunc();
  }

  applyPreset(presetData: any) {
    this.block.data = { ...this.block.data, ...presetData };
  }
}
</script>

<template>
  <div>
    <q-field label="Block ID">
      <InputPopupEdit :field="block.id" :change="changeBlockId" display="span" label="Block ID"/>
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
    <q-field label="Apply preset">
      <SelectPopupEdit
        :field="block.data"
        :options="presets()"
        :change="callAndSaveBlock(applyPreset)"
        label="preset"
        display="span"
      />
    </q-field>
  </div>
</template>
