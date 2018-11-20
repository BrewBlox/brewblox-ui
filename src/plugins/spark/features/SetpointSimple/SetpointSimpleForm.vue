<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';

@Component
export default class SetpointSimpleForm extends BlockForm {

}
</script>

<template>
  <div class="widget-modal">
    <q-card>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Setpoint">
          <UnitPopupEdit label="Setpoint" :field="block.data.setting" :change="callAndSaveBlock(v => block.data.setting = v)" />
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

