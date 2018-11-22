<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class ActuatorAnalogMockForm extends BlockForm {
  defaultData() {
    return {
      setting: 0,
      minSetting: 0,
      maxSetting: 0,
      value: 0,
      minValue: 0,
      maxValue: 0,
    };
  }
}
</script>

<template>
  <div class="widget-modal">
    <q-card>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Minimum setting">
          <InputPopupEdit
            type="number"
            label="Minimum setting"
            :field="block.data.minSetting"
            :change="callAndSaveBlock(v => block.data.minSetting = v)"
          />
        </q-field>
        <q-field class="col" label="Current setting">
          <InputPopupEdit
            type="number"
            label="Current setting"
            :field="block.data.setting"
            :change="callAndSaveBlock(v => block.data.setting = v)"
          />
        </q-field>
        <q-field class="col" label="Maximum setting">
          <InputPopupEdit
            type="number"
            label="Maximum setting"
            :field="block.data.maxSetting"
            :change="callAndSaveBlock(v => block.data.maxSetting = v)"
          />
        </q-field>
        <q-field class="col" label="Profiles">
          <ProfilesPopupEdit
            :field="block.profiles"
            :serviceId="serviceId"
            :change="callAndSaveBlock(v => block.profiles = v)"
          />
        </q-field>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>Value</q-card-title>
      <q-card-main>
        <q-field class="col" label="Minimum value">
          <InputPopupEdit
            type="number"
            label="Minimum value"
            :field="block.data.minValue"
            :change="callAndSaveBlock(v => block.data.minValue = v)"
          />
        </q-field>
        <q-field class="col" label="Current value">
          <big>{{ block.data.value | round }}</big>
        </q-field>
        <q-field class="col" label="Maximum value">
          <InputPopupEdit
            type="number"
            label="Maximum value"
            :field="block.data.maxValue"
            :change="callAndSaveBlock(v => block.data.maxValue = v)"
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

