<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { uid } from 'quasar';
import { displayNameById } from '@/store/features/getters';
import { dashboardValues, primaryDashboardId } from '@/store/dashboards/getters';
import { appendDashboardItem } from '@/store/dashboards/actions';
import { deserialize } from '@/helpers/units/parseObject';

@Component({
  props: {
    dashboardId: {
      type: String,
      required: false,
    },
  },
})
export default class ImportWizard extends Vue {
  $q: any;
  serializedWidget: string = '';

  localChosenDashboardId: string = '';

  get chosenDashboardId() {
    return this.localChosenDashboardId
      || this.$props.dashboardId
      || primaryDashboardId(this.$store);
  }

  set chosenDashboardId(id: string) {
    this.localChosenDashboardId = id;
  }

  get dashboardOptions() {
    return dashboardValues(this.$store)
      .map(dash => ({ label: dash.title, value: dash.id }));
  }

  get valuesOk() {
    return !!this.chosenDashboardId && !!this.serializedWidget;
  }

  async create() {
    try {
      const item = {
        ...deserialize(JSON.parse(this.serializedWidget)),
        id: uid(),
        dashboard: this.chosenDashboardId,
      };
      await appendDashboardItem(this.$store, item);
      this.$q.notify({
        icon: 'mdi-check-all',
        color: 'positive',
        message: `Created ${displayNameById(this.$store, item.feature)} '${item.title}'`,
      });
      this.$emit('close');
    } catch (e) {
      this.$q.notify({
        icon: 'error',
        color: 'negative',
        message: `Failed to create widget: ${e.toString()}`,
      });
    }
  }

  back() {
    this.$emit('back');
  }

  mounted() {
    this.$emit('title', 'Import wizard');
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label>Dashboard</q-item-label>
          <q-option-group v-model="chosenDashboardId" :options="dashboardOptions"/>
        </q-item-section>
      </q-item>
      <q-item dark>
        <textarea
          v-model="serializedWidget"
          placeholder="Paste your export string here"
          class="full-width"
          style="min-height: 200px"
        />
      </q-item>
    </q-card-section>

    <q-separator dark/>

    <q-card-actions class="row justify-between">
      <q-btn unelevated label="Back" @click="back"/>
      <q-btn :disable="!valuesOk" unelevated label="Create" color="primary" @click="create"/>
    </q-card-actions>
  </div>
</template>
