<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { Unit } from '@/helpers/units';
import { ProcessValueLink } from '@/helpers/units/KnownLinks';

@Component
export default class ActuatorOffsetForm extends BlockForm {
  get inputMapping() {
    return {
      profiles: { path: 'profiles', default: [] },
      targetId: { path: 'data.targetId', default: new ProcessValueLink(null) },
      referenceId: { path: 'data.referenceId', default: new ProcessValueLink(null) },
      constrainedBy: { path: 'data.constrainedBy', default: { constraints: [] } },
    };
  }

  afterBlockFetch() {
    this.fetchCompatibleToInputLinks();
  }
}
</script>

<template>
  <q-card orientation="vertical">
    <q-card-main class="column centered">

      <widget-field
        label="Target"
        icon="edit"
      >
        <q-select
          v-model="inputValues.targetId.id"
          :options="linkOpts(inputValues.targetId)"
        />
      </widget-field>

      <widget-field
        label="Reference"
        icon="edit"
      >
        <q-select
          v-model="inputValues.referenceId.id"
          :options="linkOpts(inputValues.referenceId)"
        />
      </widget-field>

      <widget-field
        label="Constrained by"
        icon="edit"
      >
        <AnalogConstraints
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

