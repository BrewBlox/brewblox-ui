<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class MutexForm extends BlockForm {
  defaultData() {
    return {
      differentActuatorWait: 0,
    };
  }
}
</script>

<template>
  <div class="widget-modal">
    <q-card>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Actuator wait time">
          <InputPopupEdit
            type="number"
            label="Actuator wait time"
            :field="block.data.differentActuatorWait"
            :change="callAndSaveBlock(v => block.data.differentActuatorWait = v)"
          />
        </q-field>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>Block Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Profiles">
          <ProfilesPopupEdit
            :field="block.profiles"
            :serviceId="serviceId"
            :change="callAndSaveBlock(v => block.profiles = v)"
          />
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

