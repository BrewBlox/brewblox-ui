<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';

@Component
export default class ActuatorAnalogMockForm extends BlockForm {
  get inputMapping() {
    return {
      profiles: { path: 'profiles', default: [] },
      setting: { path: 'data.setting', default: 0 },
      minSetting: { path: 'data.minSetting', default: 0 },
      maxSetting: { path: 'data.maxSetting', default: 0 },
      minValue: { path: 'data.minValue', default: 0 },
      maxValue: { path: 'data.maxValue', default: 0 },
    };
  }
}
</script>

<template>
  <q-card orientation="vertical">
    <q-card-main class="column centered">

      <widget-field
        label="Active profiles"
        icon="settings_input_component"
      >
        <profiles-bar
          v-model="inputValues.profiles"
          :profileNames="profileNames"
        />
      </widget-field>

      <widget-field
        label="Setting"
        icon="edit"
      >
        <q-input
          v-model="inputValues.setting"
          stack-label="Setting"
          type="number"
        />
        <q-input
          v-model="inputValues.minSetting"
          stack-label="Minimum"
          type="number"
        />
        <q-input
          v-model="inputValues.maxSetting"
          stack-label="Maximum"
          type="number"
        />
      </widget-field>

      <widget-field
        label="Value"
        icon="edit"
      >
        <q-input
          v-model="inputValues.value"
          stack-label="Value"
          type="number"
        />
        <q-input
          v-model="inputValues.minValue"
          stack-label="Minimum"
          type="number"
        />
        <q-input
          v-model="inputValues.maxValue"
          stack-label="Maximum"
          type="number"
        />
      </widget-field>

    <q-card-separator />
    <q-card-actions align="end">

      <q-btn
        flat
        label="Reset"
        color="primary"
        :disabled="!changed"
        @click="cancelChanges"
      />

      <q-btn
        flat
        label="Save"
        color="primary"
        @click="confirmChanges"
      />

    </q-card-actions>

    </q-card-main>
  </q-card>
</template>

<style scoped>
</style>

