<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Notify } from 'quasar';
import Component from 'vue-class-component';

import GridContainer from '@/components/Grid/GridContainer.vue';
import WizardModal from '@/components/Wizard/WizardModal.vue';
import InvalidWidget from '@/components/WidgetGenerics/InvalidWidget.vue';
import ExistingBlockWizard from '@/components/Wizard/ExistingBlockWizard.vue';

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

/* eslint-disable indent */
@Component({
  components: {
    GridContainer,
    WizardModal,
    ExistingBlockWizard,
  },
})
/* eslint-enable */
export default class DashboardPage extends Vue {
  editable: boolean = false;
  modalComponent: VueConstructor | null = null;
  modalOpen: boolean = false;
  title: string = '';

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

  get wizards() {
    return [
      {
        label: 'Existing Block',
        component: ExistingBlockWizard,
      },
      {
        label: 'New Block',
        component: ExistingBlockWizard,
      },
      ...allTypes
        .filter(wizardByType)
        .map(type => ({
          label: displayNameByType(type),
          component: wizardByType(type),
        })),
    ];
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

  toggleEditable() {
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
    this.modalOpen = true;
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

  startWizard(component: VueConstructor) {
    this.modalComponent = component;
    this.modalOpen = true;
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
      this.modalOpen = false;
    } catch (e) {
      Notify.create(`Failed to add item: ${e.toString()}`);
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
          @click="editable ? onSave() : toggleEditable()"
          :label="editable ? 'Save changes' : 'Edit dashboard'"
        />
      </portal>

      <q-modal
        v-model="modalOpen"
        :content-css="{ minWidth: '80vw', minHeight: '500px' }"
      >
        <component
          :is="modalComponent"
          :isOpen="modalOpen"
          :onAddWidget="onAddWidget"
        />
      </q-modal>

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
