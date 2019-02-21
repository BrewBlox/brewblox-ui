<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';


@Component
export default class DashboardWizard extends Vue {

}
</script>

<template>
  <q-card dark>
    <q-card-title>Create dashboard</q-card-title>
    <q-card-main>
      <q-field>
        <q-input float-label="Dashboard ID"/>
      </q-field>
    </q-card-main>
    <q-card-actions align="end">
      <q-btn color="primary" label="create"/>
    </q-card-actions>
  </q-card>
</template>
