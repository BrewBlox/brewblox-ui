<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import WidgetField from '@/components/Widget/WidgetField.vue';
import ProfilesBar from '@/plugins/spark/components/ProfilesBar.vue';

@Component({
  components: {
    WidgetField,
    ProfilesBar,
  },
})
export default class InactiveObjectForm extends BlockForm {
  get inputMapping() {
    return {
      profiles: { path: 'profiles', default: [] },
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

