<script lang="ts">
import { ActuatorDigitalLink } from '@/helpers/units/KnownLinks';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { ActuatorPwmBlock } from '@/plugins/spark/features/ActuatorPwm/state';
import Component from 'vue-class-component';

@Component
export default class ActuatorPwmForm extends BlockForm {
  get block(): ActuatorPwmBlock {
    return this.blockField as ActuatorPwmBlock;
  }

  defaultData() {
    return {
      actuatorId: new ActuatorDigitalLink(null),
      period: 0,
      setting: 0,
      constrainedBy: { constraints: [] },
    };
  }
}
</script>

<template>
  <div class="widget-modal">
    <q-card>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Actuator">
          <LinkPopupEdit
            label="Actuator"
            :field="block.data.actuatorId"
            :serviceId="serviceId"
            :change="callAndSaveBlock(v => block.data.actuatorId = v)"
          />
        </q-field>
        <q-field class="col" label="Period">
          <InputPopupEdit
            label="Period"
            type="number"
            :field="block.data.period"
            :change="callAndSaveBlock(v => block.data.period = v)"
          />
        </q-field>
        <q-field class="col" label="Setting">
          <InputPopupEdit
            label="Setting"
            type="number"
            :field="block.data.setting"
            :change="callAndSaveBlock(v => block.data.setting = v)"
          />
        </q-field>
        <q-field class="col" label="Value">
          <big>{{ block.data.value | round }}</big>
        </q-field>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>Constraints</q-card-title>
      <q-card-main>
        <q-field class="col" label="Constraints" orientation="vertical">
          <AnalogConstraints
            :serviceId="block.serviceId"
            :field="block.data.constrainedBy"
            :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
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

