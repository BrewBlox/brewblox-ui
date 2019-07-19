<script lang="ts">
import { Component } from 'vue-property-decorator';

import CrudComponent from '@/components/Widget/CrudComponent';

@Component
export default class BuilderForm extends CrudComponent {

}
</script>

<template>
  <q-card dark class="maximized bg-dark">
    <FormToolbar :crud="crud" />

    <q-card-section>
      <!-- Set active layout -->
      <!-- Select and sort layouts -->
    </q-card-section>
  </q-card>
</template>
