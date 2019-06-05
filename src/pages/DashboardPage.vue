<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { objectSorter } from '@/helpers/functional';
import dashboardStore, { DashboardItem } from '@/store/dashboards';
import featureStore from '@/store/features';

interface ValidatedItem {
  item: DashboardItem;
  component: string;
  error?: Error;
}

@Component
export default class DashboardPage extends Vue {
  widgetEditable: boolean = false;
  menuModalOpen: boolean = false;
  wizardModalOpen: boolean = false;

  get dashboardId(): string {
    return this.$route.params.id;
  }

  @Watch('dashboardId')
  onChangeDashboard() {
    this.widgetEditable = false;
  }

  get dashboard() {
    return dashboardStore.dashboardById(this.dashboardId);
  }

  get allDashboards() {
    return dashboardStore.dashboardValues;
  }

  get allItems() {
    return dashboardStore.itemValues;
  }

  get items() {
    return dashboardStore.dashboardItemsByDashboardId(this.dashboardId)
      .sort(objectSorter('order'));
  }

  get validatedItems(): ValidatedItem[] {
    return this.items
      .map((item: DashboardItem) => {
        try {
          if (item.title === undefined) {
            // ensure backwards compatibility
            // older items may not have a title
            item.title = item.id;
          }
          const component = featureStore.widgetById(item.feature, item.config);
          if (!component) {
            throw new Error(`No widget found for ${item.feature}`);
          }
          const validator = featureStore.validatorById(item.feature);
          if (!validator(item.config)) {
            throw new Error(`${item.feature} validation failed`);
          }
          return { item, component };
        } catch (e) {
          return {
            item,
            component: 'InvalidWidget',
            error: e.toString(),
          };
        }
      });
  }

  get isMobile(): boolean {
    return this.$q.platform.is.mobile;
  }

  async onChangePositions(id: string, pinnedPosition: XYPosition | null, order: string[]) {
    try {
      // Make a local change to the validated item, to avoid it jumping during the store round trip
      const local = this.validatedItems.find(valItem => valItem.item.id === id);
      if (local) {
        local.item.pinnedPosition = pinnedPosition;
      }
      await dashboardStore.saveDashboardItem({ ...dashboardStore.dashboardItemById(id), pinnedPosition });
      await dashboardStore.updateDashboardItemOrder(order);
    } catch (e) {
      throw e;
    }
  }

  async onChangeSize(id: string, cols: number, rows: number) {
    await dashboardStore.updateDashboardItemSize({ id, cols, rows });
  }

  public async saveWidget(widget: DashboardItem) {
    await dashboardStore.saveDashboardItem(widget);
  }
}
</script>

<template>
  <q-page padding>
    <q-inner-loading v-if="!dashboard">
      <q-spinner size="50px" color="primary"/>
    </q-inner-loading>
    <div v-else>
      <portal to="toolbar-title">{{ dashboard.title }}</portal>
      <portal to="toolbar-buttons">
        <q-toggle v-model="widgetEditable" checked-icon="mdi-lock-open" unchecked-icon="mdi-lock">
          <q-tooltip>{{ widgetEditable ? 'Lock widgets' : 'Move widgets' }}</q-tooltip>
        </q-toggle>
        <q-btn-dropdown color="primary" label="actions">
          <q-list dark>
            <ActionItem icon="add" label="New Widget" @click="wizardModalOpen = true"/>
          </q-list>
        </q-btn-dropdown>
      </portal>
      <q-dialog v-model="wizardModalOpen" no-backdrop-dismiss>
        <WizardPicker
          v-if="wizardModalOpen"
          :dashboard-id="dashboardId"
          initial-component="WidgetWizardPicker"
          @close="wizardModalOpen = false"
        />
      </q-dialog>
      <q-list v-if="isMobile" no-border>
        <q-item v-for="val in validatedItems" :key="val.item.id">
          <q-item-section>
            <component
              :disabled="widgetEditable"
              :is="val.component"
              :widget="val.item"
              class="dashboard-item"
              @update:widget="saveWidget"
            />
          </q-item-section>
        </q-item>
      </q-list>
      <GridContainer
        v-else
        :editable="widgetEditable"
        @change-positions="onChangePositions"
        @change-size="onChangeSize"
      >
        <component
          v-for="val in validatedItems"
          :disabled="widgetEditable"
          :is="val.component"
          :key="val.item.id"
          :widget="val.item"
          :error="val.error"
          class="dashboard-item"
          @update:widget="saveWidget"
        />
      </GridContainer>
    </div>
  </q-page>
</template>

<style lang="stylus" scoped>
@import '../styles/quasar.variables.styl';
@import '../styles/quasar.styl';

.dashboard-item {
  background: $block-background;
  height: 100%;
  width: 100%;
}
</style>
