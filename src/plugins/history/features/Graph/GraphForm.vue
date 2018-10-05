<script lang="ts">
import Component from 'vue-class-component';
import HistoryForm from '@/plugins/history/components/HistoryForm';
import WidgetField from '@/components/Widget/WidgetField.vue';
import Link from '@/helpers/units/Link';
import { blockIds } from '@/plugins/spark/store/getters';

@Component({
  components: {
    WidgetField,
  },
})
export default class GraphForm extends HistoryForm {
  get inputMapping() {
    return {
    };
  }
}
</script>

<template>
  <q-card orientation="vertical">
    <q-card-main class="column centered">

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

