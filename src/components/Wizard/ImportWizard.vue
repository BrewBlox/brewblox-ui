<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { uid } from 'quasar';
import get from 'lodash/get';
import dashboardStore from '@/store/dashboards';
import { displayNameById } from '@/store/features/getters';
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
  reader: FileReader = new FileReader();
  serializedWidget: string = '';

  localChosenDashboardId: string = '';

  get chosenDashboardId() {
    return this.localChosenDashboardId
      || this.$props.dashboardId
      || dashboardStore.primaryDashboardId;
  }

  set chosenDashboardId(id: string) {
    this.localChosenDashboardId = id;
  }

  get dashboardOptions() {
    return dashboardStore.dashboardValues
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
      await dashboardStore.appendDashboardItem(item);
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

  handleFileSelect(evt) {
    const file = evt.target.files[0];
    if (file) {
      this.reader.readAsText(file);
    } else {
      this.serializedWidget = '';
    }
  }

  mounted() {
    this.$emit('title', 'Import wizard');
    this.reader.onload = e => this.serializedWidget = get(e, 'target.result', '');
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
        <input type="file" @change="handleFileSelect">
      </q-item>
    </q-card-section>

    <q-separator dark/>

    <q-card-actions class="row justify-between">
      <q-btn unelevated label="Back" @click="back"/>
      <q-btn :disable="!valuesOk" unelevated label="Create" color="primary" @click="create"/>
    </q-card-actions>
  </div>
</template>
