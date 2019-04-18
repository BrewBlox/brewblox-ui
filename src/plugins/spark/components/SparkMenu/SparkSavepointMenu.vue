<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { serviceById } from '@/store/services/getters';
import { savepoints } from '../../store/getters';
import { fetchSavepoints, writeSavepoint, applySavepoint, removeSavepoint } from '../../store/actions';


@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class SparkSavepointMenu extends Vue {
  $q: any;
  savepointInput: string = '';

  get service() {
    return serviceById(this.$store, this.$props.serviceId);
  }

  get savepoints() {
    return savepoints(this.$store, this.service.id);
  }

  writeSavepoint(point: string) {
    writeSavepoint(this.$store, this.service.id, point);
  }

  applySavepoint(point: string) {
    applySavepoint(this.$store, this.service.id, point);
  }

  removeSavepoint(point: string) {
    removeSavepoint(this.$store, this.service.id, point);
  }

  mounted() {
    fetchSavepoints(this.$store, this.service.id);
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <FormToolbar>
      <q-item-section>
        <q-item-label>{{ service.id }}</q-item-label>
        <q-item-label caption>Savepoints</q-item-label>
      </q-item-section>
    </FormToolbar>

    <q-card-section>
      <q-item v-for="point in savepoints" :key="point" dark>
        <q-item-section>{{ point }}</q-item-section>
        <q-item-section side>
          <q-btn flat rounded label="Save" @click="writeSavepoint(point)"/>
        </q-item-section>
        <q-item-section side>
          <q-btn flat rounded label="Load" @click="applySavepoint(point)"/>
        </q-item-section>
        <q-item-section side>
          <q-btn flat rounded label="Delete" @click="removeSavepoint(point)"/>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-input
            v-model="savepointInput"
            :error="savepoints.includes(savepointInput)"
            placeholder="New Savepoint"
            clearable
            dark
          />
        </q-item-section>
        <q-item-section side>
          <q-btn
            :disable="!savepointInput || savepoints.includes(savepointInput)"
            flat
            rounded
            text-color="white"
            label="Create"
            @click="() => { writeSavepoint(savepointInput); savepointInput = ''; }"
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
