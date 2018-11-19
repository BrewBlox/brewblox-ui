<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { ActuatorDigitalLink } from '@/helpers/units/KnownLinks';
import { ActuatorPwmBlock } from '@/plugins/spark/features/ActuatorPwm/state';

@Component
export default class ActuatorPwmForm extends BlockForm {
  get block(): ActuatorPwmBlock {
    return this.blockField as ActuatorPwmBlock;
  }
}
</script>

<template>
  <div class="widget-modal">
    <q-card>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Actuator">
          <LinkPopupEdit label="Actuator" :field="block.data.actuatorId" :serviceId="serviceId" :change="callAndSaveBlock(v => block.data.actuatorId = v)" />
        </q-field>
        <q-field class="col" label="Period">
          <InputPopupEdit label="Period" type="number" :field="block.data.period" :change="callAndSaveBlock(v => block.data.period = v)" />
        </q-field>
        <q-field class="col" label="Setting">
          <InputPopupEdit label="Setting" type="number" :field="block.data.setting" :change="callAndSaveBlock(v => block.data.setting = v)" />
        </q-field>
        <q-field class="col" label="Value">
          <big>{{ block.data.value | round }}</big>
        </q-field>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>Constraints</q-card-title>
      <q-card-main>
        <ReadonlyConstraints :serviceId="block.serviceId" :value="block.data.constrainedBy" />
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

