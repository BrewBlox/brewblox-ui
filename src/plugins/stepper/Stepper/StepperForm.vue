<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import CrudComponent from '@/components/Widget/CrudComponent';


@Component
export default class StepperForm extends CrudComponent {

}
</script>


<template>
  <q-card dark class="widget-modal">
    <FormToolbar :crud="crud" />
    <q-card-section>
      TODO
    </q-card-section>
  </q-card>
</template>
