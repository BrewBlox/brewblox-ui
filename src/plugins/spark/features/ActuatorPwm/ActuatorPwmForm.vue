<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import WidgetField from '@/components/Widget/WidgetField.vue';
import ProfilesBar from '@/plugins/spark/components/ProfilesBar.vue';
import DigitalConstraints from '@/plugins/spark/components/Constraints/DigitalConstraints.vue';
import Link from '@/helpers/units/Link';
import { blockIds } from '@/plugins/spark/store/getters';

@Component({
  components: {
    WidgetField,
    ProfilesBar,
    DigitalConstraints,
  },
})
export default class ActuatorPwmForm extends BlockForm {
  get inputMapping() {
    return {
      profiles: { path: 'profiles', default: [] },
      actuatorId: { path: 'data.actuatorId', default: new Link(null) },
      period: { path: 'data.period', default: 0 },
      constrainedBy: { path: 'data.constrainedBy', default: {} },
    };
  }

  get linkOpts() {
    const unset = new Link(null);
    return [
      { label: unset.toString(), value: unset.id },
      ...blockIds(this.$store, this.block.serviceId)
        .map(id => ({
          label: id,
          value: id,
        })),
    ];
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
        label="Actuator"
        icon="edit"
      >
        <q-select
          v-model="inputValues.actuatorId.id"
          :options="linkOpts"
        />
      </widget-field>

      <widget-field
        label="Period"
        icon="edit"
      >
        <q-input
          v-model="inputValues.period"
          type="number"
        />
      </widget-field>

      <widget-field
        label="Constrained by"
        icon="edit"
      >
        <digital-constraints
          :serviceId="block.serviceId"
          v-model="inputValues.constrainedBy.constraints"
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

