<script lang="ts">
import { allDashboards, dashboardItemValues } from '@/store/dashboards/getters';
import { displayNameById } from '@/store/features/getters';
import { Notify } from 'quasar';
import Vue from 'vue';
import Component from 'vue-class-component';
import { blockValues } from '@/plugins/spark/store/getters';
import { saveDashboardItem } from '@/store/dashboards/actions';
import { DashboardItem } from '@/store/dashboards/state';

@Component({
  props: {
    availableItems: {
      type: Array,
      required: false,
    },
  },
})
export default class MoveWidgetWizard extends Vue {
  $q: any;
  searchModel: string = '';

  get availableItems() {
    return this.$props.availableItems || dashboardItemValues(this.$store);
  }

  get itemOptions(): { item: DashboardItem, displayName: string }[] {
    return this.availableItems
      .reduce(
        (acc, item: DashboardItem) => {
          const model = this.searchModel.toLowerCase();
          const displayName = displayNameById(this.$store, item.feature);
          const match = !model
            || item.id.toLowerCase().match(model)
            || displayName.toLowerCase().match(model);

          return match
            ? [...acc, { item, displayName }]
            : acc;
        },
        [],
    );
  }

  get dashboardOptions() {
    return allDashboards(this.$store)
      .map(dashboard => ({ label: dashboard.title, value: dashboard.id }));
  }

  async selectItem(item: DashboardItem) {
    try {
      const dashboard = await this.$q.dialog({
        title: 'Create Widget on Dashboard',
        message: `To which dashboard do you want to copy ${item.id}?`,
        options: {
          type: 'radio',
          model: this.dashboardOptions.length > 0 ? this.dashboardOptions[0].value : null,
          items: this.dashboardOptions,
        },
        cancel: true,
      });
      if (dashboard) {
        saveDashboardItem(this.$store, { ...item, dashboard })
          .then(() => this.$q.notify({ type: 'positive', message: `Moved ${item.id} to ${dashboard}` }))
          .catch((e) => this.$q.notify(`Failed to move widget: ${e.message}`));
      }
    } catch (e) {
      // dialog cancelled
    }
  }
}
</script>

<template>
  <div class="widget-modal column">
    <q-toolbar class="unpadded">
      <q-toolbar-title>Move Widget to Dashboard</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>
    <q-list no-border>
      <q-item>
        <q-search v-model="searchModel" placeholder="Search"/>
      </q-item>
    </q-list>
    <q-list link inset-separator no-border>
      <q-item
        v-for="opt in itemOptions"
        :key="opt.item.id"
        icon="widgets"
        @click.native="selectItem(opt.item)"
      >
        <div class="row">
          <q-item-main>
            <q-item-tile label>{{ opt.item.id }}</q-item-tile>
            <q-item-tile sublabel>{{ opt.displayName }}</q-item-tile>
          </q-item-main>
          <q-item-side right icon="chevron_right"/>
        </div>
      </q-item>
    </q-list>
  </div>
</template>
