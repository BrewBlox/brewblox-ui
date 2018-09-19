<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Notify } from 'quasar';

import { allBlocks } from '@/services/spark/store/getters';

import { DashboardItem } from '@/store/dashboards/state';
import { allDashboardItems, dashboardItemById } from '@/store/dashboards/getters';

import { allFeatureTypes, wizardByType, displayNameByType } from '@/services/feature-by-type';

@Component({
  components: {},
  props: {
    onCreateItem: {
      type: Function,
      required: true,
    },
  },
})
export default class CopyWidgetWizard extends Vue {
  widgetId: string = '';
  searchModel: string = '';

  get existingWidgetOptions() {
    return allDashboardItems(this.$store)
      .filter(item => item.id.match(this.searchModel))
      .map(item => ({
        id: item.id,
        displayName: displayNameByType(item.widget),
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
    this.$props.onCreateItem({
      ...item,
      id: this.widgetId,
    });
  }

  mounted() {
    this.widgetId = '';
    this.searchModel = '';
  }
}
</script>

<template>
  <div class="layout-padding">

    <q-item>
      <q-field
        label="Widget ID"
        icon="create"
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
        label="Select a widget to copy"
        icon="widgets"
        orientation="vertical"
      >
        <q-item>
          <q-search
            v-model="searchModel"
            placeholder="Search"
          />
        </q-item>
        <q-list link inset-separator>
          <q-item
            icon="widgets"
            v-for="opt in existingWidgetOptions"
            :key="opt.id"
            @click.native="selectItem(opt.id)"
          >
            <div class="row">
              <q-item-main>
                <q-item-tile label>{{ opt.id }}</q-item-tile>
                <q-item-tile sublabel>{{ opt.displayName }}</q-item-tile>
              </q-item-main>
              <q-item-side right icon="chevron_right" />
            </div>
          </q-item>
        </q-list>
      </q-field>

    </q-item>

  </div>
</template>

<style scoped>
.q-item {
  display: grid;
  grid-gap: 10px;
}

.layout-padding {
  position: relative;
}
</style>
