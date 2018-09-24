<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Notify } from 'quasar';
import Component from 'vue-class-component';
import shortid from 'shortid';

import GridContainer from '@/components/Grid/GridContainer.vue';
import InvalidWidget from '@/components/Widget/InvalidWidget.vue';
import WidgetModal from '@/components/Widget/WidgetModal.vue';
import CopyWidgetWizard from '@/components/Wizard/CopyWidgetWizard.vue';
import NewWidgetWizard from '@/components/Wizard/NewWidgetWizard.vue';

import byOrder from '@/helpers/byOrder';

import { Block } from '@/plugins/spark/state';
import { DashboardItem } from '@/store/dashboards/state';

import {
  isFetching,
  dashboardById,
  dashboardItemById,
} from '@/store/dashboards/getters';

import {
  updateDashboard,
  updateDashboardItemOrder,
  updateDashboardItemSize,
  updateDashboardItemConfig,
  createDashboardItem,
  addDashboardItemToDashboard,
} from '@/store/dashboards/actions';

import {
  validatorById,
  widgetById,
  displayNameById,
  widgetSizeById,
} from '@/store/features/getters';

interface VueOrdered extends Vue {
  id: string;
}

interface ModalConfig {
  open: boolean;
  title: string;
  component?: VueConstructor;
}

@Component({
  components: {
    GridContainer,
    WidgetModal,
    CopyWidgetWizard,
    NewWidgetWizard,
  },
})
export default class DashboardPage extends Vue {
  editable: boolean = false;
  title: string = '';

  wizardModal: ModalConfig = {
    open: false,
    title: '',
  };

  get dashboardId(): string {
    return this.$route.params.id;
  }

  get dashboard() {
    return dashboardById(this.$store, this.dashboardId);
  }

  get items() {
    return [
      ...this.dashboard.items
        .map(id => dashboardItemById(this.$store, id)),
    ];
  }

  get validatedItems() {
    return this.items
      .map((item) => {
        try {
          if (!validatorById(this.$store, item.widget)(this.$store, item.config)) {
            throw new Error(`${item.widget} validation failed`);
          }
          return {
            ...item,
            component: widgetById(this.$store, item.widget) || InvalidWidget,
          };
        } catch (e) {
          return {
            ...item,
            component: InvalidWidget,
            error: e.toString(),
          };
        }
      });
  }

  get isFetching() {
    return isFetching(this.$store);
  }

  onStartEdit() {
    this.title = this.dashboard.title;
    this.editable = true;
  }

  onStopEdit() {
    if (this.title !== this.dashboard.title) {
      // update title of dashboard if changed
      updateDashboard(this.$store, {
        ...this.dashboard,
        title: this.title,
      });
    }
    this.editable = false;
  }

  async onChangeOrder(order: VueOrdered[]) {
    const newOrder = order.map(item => item.id);
    try {
      await updateDashboardItemOrder(this.$store, newOrder);
    } catch (e) {
      throw e;
    }
  }

  onChangeSize(id: string, cols: number, rows: number) {
    updateDashboardItemSize(this.$store, { id, cols, rows });
  }

  onChangeItemConfig(id: string, config: any) {
    updateDashboardItemConfig(this.$store, { id, config });
  }

  onStartCopyWidget() {
    this.wizardModal = {
      open: true,
      component: CopyWidgetWizard,
      title: 'Copy Existing Widget',
    };
  }

  onStartNewWidget() {
    this.wizardModal = {
      open: true,
      component: NewWidgetWizard,
      title: 'Add New Widget',
    };
  }

  defaultItem(): DashboardItem {
    return {
      id: shortid.generate(),
      widget: 'Unknown',
      config: {},
      ...widgetSizeById(this.$store, 'Unknown'),
    };
  }

  async onCreateItem(partial: Partial<DashboardItem>) {
    try {
      const item: DashboardItem = {
        ...this.defaultItem(),
        ...partial,
      };
      await createDashboardItem(
        this.$store,
        { item, dashboard: this.dashboard },
      );
      Notify.create({
        type: 'positive',
        message: `Added ${displayNameById(this.$store, item.widget)} "${item.id}"`,
      });
    } catch (e) {
      Notify.create(`Failed to add widget: ${e.toString()}`);
    }
  }
}
</script>

<template>
  <q-page padding>
    <q-inner-loading :visible="isFetching">
      <q-spinner
        size="50px"
        color="primary"
      />
    </q-inner-loading>

    <template v-if="!isFetching">
      <portal to="toolbar-title">
        <div v-if="!editable">
          {{ dashboard.title }}
        </div>
        <div v-else>
          <q-input
            v-model="title"
            placeholder="Name of this dashboard"
            dark
            :before="[{ icon: 'edit' }]"
          />
        </div>
      </portal>

      <portal to="toolbar-buttons">

        <q-btn
          v-if="editable"
          color="primary"
          icon="add"
          label="Copy Widget"
          @click="onStartCopyWidget"
        />

        <q-btn
          v-if="editable"
          color="primary"
          icon="add"
          label="New Widget"
          @click="onStartNewWidget"
        />

        <q-btn
          :icon="editable ? 'check' : 'mode edit'"
          :color="editable ? 'positive' : 'primary'"
          @click="editable ? onStopEdit() : onStartEdit()"
          :label="editable ? 'Save changes' : 'Edit dashboard'"
        />

      </portal>

      <widget-modal
        :isOpen="wizardModal.open"
        :title="wizardModal.title"
        :onClose="() => { this.wizardModal.open = false; }"
      >
        <component
          v-if="wizardModal.open"
          :is="wizardModal.component"
          :onCreateItem="onCreateItem"
        />
      </widget-modal>

      <grid-container
        :editable="editable"
        :on-change-order="onChangeOrder"
        :on-change-size="onChangeSize"
      >
        <component
          class="dashboard-item"
          v-for="item in validatedItems"
          :is="item.component"
          :error="item.error"
          :key="item.id"
          :id="item.id"
          :type="item.widget"
          :cols="item.cols"
          :rows="item.rows"
          :config="item.config"
          :on-config-change="onChangeItemConfig"
        />
      </grid-container>
    </template>
  </q-page>
</template>

<style lang="stylus" scoped>
@import '../css/app.styl';

.dashboard-item {
  background: $block-background;
  height: 100%;
  width: 100%;
}
</style>
