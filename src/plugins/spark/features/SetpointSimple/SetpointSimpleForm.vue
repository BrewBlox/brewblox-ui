<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import WidgetField from '@/components/Widget/WidgetField.vue';
import ProfilesBar from '@/plugins/spark/components/ProfilesBar.vue';
import { Unit } from '@/helpers/units';

@Component({
  components: {
    WidgetField,
    ProfilesBar,
  },
})
export default class SetpointSimpleForm extends BlockForm {
  get inputMapping() {
    return {
      profiles: { path: 'profiles', default: [] },
      setting: { path: 'data.setting', default: new Unit(0, 'celsius') },
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
          v-model="inputValues.setting.value"
          :suffix="inputValues.setting.unit"
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

