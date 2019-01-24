<script lang="ts">
import { itemCopyName, allDashboards, dashboardItemsByDashboardId } from '@/store/dashboards/getters';
import { displayNameById, widgetById, featureById, widgetSizeById } from '@/store/features/getters';
import { Notify } from 'quasar';
import Vue from 'vue';
import Component from 'vue-class-component';
import { blockValues } from '@/plugins/spark/store/getters';
import { createDashboardItem } from '@/store/dashboards/actions';
import { DashboardItem } from '@/store/dashboards/state';
import { Block } from '@/plugins/spark/state';

@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class BlockWidgetWizard extends Vue {
  $q: any;
  searchModel: string = '';

  get blockOptions() {
    return blockValues(this.$store, this.$props.serviceId)
      .filter(block => featureById(this.$store, block.type).widget !== undefined)
      .reduce(
        (acc, block) => {
          const model = this.searchModel.toLowerCase();
          const displayName = displayNameById(this.$store, block.type);
          const match = !model
            || block.id.toLowerCase().match(model)
            || displayName.toLowerCase().match(model);

          return match
            ? [...acc, { block, displayName }]
            : acc;
        },
        [],
    );
  }

  get dashboardOptions() {
    return allDashboards(this.$store)
      .map(dashboard => ({ label: dashboard.title, value: dashboard.id }));
  }

  async selectItem(block: Block) {
    try {
      const dashboard = await this.$q.dialog({
        title: 'Create Widget on Dashboard',
        message: `On which dashboard do you want to create a widget for block ${block.id}?`,
        options: {
          type: 'radio',
          model: this.dashboardOptions.length > 0 ? this.dashboardOptions[0].value : null,
          items: this.dashboardOptions,
        },
        cancel: true,
      });
      if (dashboard) {
        const item: DashboardItem = {
          dashboard,
          id: itemCopyName(this.$store, block.id),
          feature: block.type,
          order: dashboardItemsByDashboardId(this.$store, dashboard).length,
          config: {
            serviceId: this.$props.serviceId,
            blockId: block.id,
          },
          ...widgetSizeById(this.$store, block.type),
        };
        createDashboardItem(this.$store, item)
          .then(() => this.$q.notify({ type: 'positive', message: `Created ${item.id} on ${dashboard}` }))
          .catch((e) => this.$q.notify(`Failed to create widget: ${e.message}`));
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
      <q-toolbar-title>Copy Block to Dashboard</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>
    <q-list no-border>
      <q-item>
        <q-search v-model="searchModel" placeholder="Search"/>
      </q-item>
    </q-list>
    <q-list link inset-separator no-border>
      <q-item
        v-for="opt in blockOptions"
        :key="opt.block.id"
        icon="widgets"
        @click.native="selectItem(opt.block)"
      >
        <div class="row">
          <q-item-main>
            <q-item-tile label>{{ opt.block.id }}</q-item-tile>
            <q-item-tile sublabel>{{ opt.displayName }}</q-item-tile>
          </q-item-main>
          <q-item-side right icon="chevron_right"/>
        </div>
      </q-item>
    </q-list>
  </div>
</template>
