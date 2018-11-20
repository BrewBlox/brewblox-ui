<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';

@Component
export default class InactiveObjectForm extends BlockForm {
}
</script>

<template>
  <div class="widget-modal">
    <q-card>
      <q-alert type="info" class="centered">
        This block is not in any active profile
      </q-alert>
    </q-card>
  </div>
</template>

<style scoped>
</style>

