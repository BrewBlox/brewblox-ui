<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Notify } from 'quasar';
import { DashboardItem } from '@/store/dashboards/state';
import { allDashboardItems, dashboardItemById } from '@/store/dashboards/getters';

import { allTypes, wizardByType, displayNameByType } from '@/features/feature-by-type';

/* eslint-disable indent */
@Component({
  components: { },
  props: {
    onAddWidget: {
      type: Function,
      default: () => { throw new Error('Provide onAddWidget callback'); },
    },
  },
})
/* eslint-enable */
export default class CopyWidgetWizard extends Vue {
  widgetId: string = '';
  selectedItem: string = '';

  get existingWidgetOptions() {
    return allDashboardItems(this.$store)
      .filter(item => item.id.match(this.selectedItem))
      .map(item => ({
        id: item.id,
        displayName: `${item.id} (${displayNameByType(item.widget)})`,
      }));
  }

  get wizardOptions() {
    return allTypes
      .filter(wizardByType)
      .map(type => ({
        value: type,
        label: displayNameByType(type),
      }));
  }

  get widgetIdError() {
    if (!this.widgetId) {
      return 'ID must not be empty';
    }
    if (dashboardItemById(this.$store, this.widgetId)) {
      return 'ID must be unique';
    }
    return null;
  }

  selectItem(id: string) {
    if (this.widgetIdError !== null) {
      Notify.create(`Unable to create item: ${this.widgetIdError}`);
      return;
    }
    const item = dashboardItemById(this.$store, id);
    this.$props.onAddWidget(this.widgetId, item.widget, { ...item.config });
  }

  mounted() {
    this.widgetId = '';
    this.selectedItem = '';
  }
}
</script>

<template>
  <div class="layout-padding">

    <q-item>
      <q-field
        label="Widget ID"
        icon="widgets"
        orientation="vertical"
      >
        <q-input
          v-model="widgetId"
          placeholder="Enter a widget ID"
          :error="widgetIdError !== null"
          :suffix="widgetIdError"
        />
      </q-field>

      <q-field
        label="Select a widget"
        icon="widgets"
        orientation="vertical"
      >
        <q-search
          v-model="selectedItem"
          placeholder="Search for a block"
        />

        <q-list link style="min-width: 100px">
          <q-item
            v-for="opt in existingWidgetOptions"
            :key="opt.id"
            :label="opt.displayName"
            @click.native="selectItem(opt.id)"
          >
            {{ opt.displayName}}
          </q-item>
        </q-list>

      </q-field>
    </q-item>

  </div>
</template>

<style>
.q-item {
  display: grid;
  grid-gap: 10px;
}

.q-list {
  border: 0;
}

.layout-padding {
  position: relative;
}
</style>
