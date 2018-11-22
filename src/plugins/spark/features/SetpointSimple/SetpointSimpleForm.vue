<script lang="ts">
import { Unit } from '@/helpers/units';
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class SetpointSimpleForm extends BlockForm {
  defaultData() {
    return {
      setting: new Unit(0, 'degC'),
      valid: true,
    };
  }
}
</script>

<template>
  <div class="widget-modal">
    <q-card>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Setpoint">
          <UnitPopupEdit
            label="Setpoint"
            :field="block.data.setting"
            :change="callAndSaveBlock(v => block.data.setting = v)"
          />
        </q-field>
        <q-field class="col" label="Valid">
          <q-toggle :value="block.data.valid" @input="v => { block.data.valid = v; saveBlock(); }"/>
        </q-field>
      </q-card-main>
    </q-card>
  </div>
</template>

<style scoped>
.q-card {
  min-width: 400px;
  width: 100%;
  margin-bottom: 10px;
}
</style>

