<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Notify } from 'quasar';
import Component from 'vue-class-component';

import GridContainer from '@/components/Grid/GridContainer.vue';
import InvalidWidget from '@/components/WidgetGenerics/InvalidWidget.vue';
import WidgetModal from '@/components/WidgetGenerics/WidgetModal.vue';
import CopyWidgetWizard from '@/components/Wizard/CopyWidgetWizard.vue';

import byOrder from '@/helpers/byOrder';

import { Block } from '@/store/blocks/state';
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
  allTypes,
  widgetByType,
  validatorByType,
  wizardByType,
  displayNameByType,
} from '@/features/feature-by-type';


interface VueOrdered extends Vue {
  id: string;
}

interface ModalConfig {
  open: boolean;
  title: string;
  component?: VueConstructor;
}

/* eslint-disable indent */
@Component({
  components: {
    GridContainer,
    WidgetModal,
    CopyWidgetWizard,
  },
})
/* eslint-enable */
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
    ].sort(byOrder);
  }

  get validatedItems() {
    return this.items.map((item) => {
      try {
        if (!validatorByType(item.widget)(this.$store, item.config)) {
          throw new Error(`${item.widget} validation failed`);
        }
        return {
          ...item,
          component: widgetByType(item.widget),
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

  onEditable() {
    this.title = this.dashboard.title;
    this.editable = true;
  }

  onSave() {
    if (this.title !== this.dashboard.title) {
      // update title of dashboard if changed
      updateDashboard(this.$store, {
        ...this.dashboard,
        title: this.title,
      });
    }
    this.editable = false;
  }

  onOpenAddWidget() {
    this.wizardModal.open = true;
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

  onCopyWidgetStart() {
    this.wizardModal = {
      open: true,
      component: CopyWidgetWizard,
      title: 'Copy Existing Widget',
    };
  }

  async onAddWidget(id: string, widget: string, config: any) {
    try {
      const item = {
        id,
        widget,
        config: { ...config },
        order: this.items.length + 1,
        cols: 4,
        rows: 4,
      };
      await createDashboardItem(
        this.$store,
        { item, dashboard: this.dashboard },
      );
      Notify.create({
        type: 'positive',
        message: `Added widget "${id}"`,
      });
    } catch (e) {
      Notify.create(`Failed to add widget: ${e.toString()}`);
    }
  }

  onChangeItemConfig(id: string, config: any) {
    updateDashboardItemConfig(this.$store, { id, config });
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
          @click="onCopyWidgetStart"
        />

        <q-btn
          v-if="editable"
          color="primary"
          icon="add"
          label="Start Wizard"
        >
          <q-popover
          >
            <q-list link style="min-width: 100px">

              <q-item
                v-for="wizard in wizards"
                :key="wizard.label"
                v-close-overlay
                @click.native="() => startWizard(wizard.component)"
              >
                <q-item-main :label="wizard.label" />
              </q-item>
            </q-list>
          </q-popover>
        </q-btn>

        <q-btn
          v-if="editable"
          color="primary"
          icon="add"
          label="Add widget"
          @click="onOpenAddWidget"
        />
        <q-btn
          :icon="editable ? 'check' : 'mode edit'"
          :color="editable ? 'positive' : 'primary'"
          @click="editable ? onSave() : onEditable()"
          :label="editable ? 'Save changes' : 'Edit dashboard'"
        />
      </portal>

      <widget-modal
        :isOpen="wizardModal.open"
        :title="wizardModal.title"
        :onClose="() => { this.wizardModal.open = false; }"
      >
        <component
          :is="wizardModal.component"
          :onAddWidget="onAddWidget"
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
