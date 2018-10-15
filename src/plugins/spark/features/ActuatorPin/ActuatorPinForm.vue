<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import Constraints from '@/plugins/spark/components/Constraints.vue';
import WidgetField from '@/components/Widget/WidgetField.vue';
import ProfilesBar from '@/plugins/spark/components/ProfilesBar.vue';
import { state } from './getters';

@Component({
  components: {
    WidgetField,
    ProfilesBar,
    Constraints,
  },
})
export default class ActuatorPinForm extends BlockForm {
  get inputMapping() {
    return {
      profiles: { path: 'profiles', default: [] },
      state: { path: 'data.state', default: 2 },
      pin: { path: 'data.pin', default: 0 },
      invert: { path: 'data.invert', default: false },
      constrainedBy: { path: 'data.constrainedBy', default: { constraints: [] } },
    };
  }

  get stateOptions() {
    return state.map((s, idx) => ({ label: s, value: idx }));
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
        label="State"
        icon="edit"
      >
        <q-select
          v-model="inputValues.state"
          :options="stateOptions"
        />
      </widget-field>

      <widget-field
        label="Pin"
        icon="edit"
      >
        <q-input
          v-model="inputValues.pin"
          type="number"
        />
      </widget-field>

      <widget-field
        label="Invert"
        icon="edit"
      >
        <q-toggle
          v-model="inputValues.invert"
        />
      </widget-field>

      <widget-field
        label="Constrained by"
        icon="edit"
      >
        <constraints
          type="digital"
          :serviceId="block.serviceId"
          v-model="inputValues.constrainedBy"
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

