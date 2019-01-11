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
    <q-field label="Active in profiles">
      <ProfilesPopupEdit
        :field="block.profiles"
        :service-id="serviceId"
        :change="callAndSaveBlock(v => block.profiles = v)"
        display="span"
      />
    </q-field>
    <q-field label="Load defaults preset">
      <SelectPopupEdit
        :field="block.data"
        :options="presets()"
        :change="callAndSaveBlock(v => block.data = v)"
        label="Select preset to load"
        display="span"
      />
    </q-field>
  </div>
</template>
