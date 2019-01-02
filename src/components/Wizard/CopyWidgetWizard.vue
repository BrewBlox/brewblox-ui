<script lang="ts">
import { allDashboardItems, dashboardItemById } from '@/store/dashboards/getters';
import { displayNameById } from '@/store/features/getters';
import { Notify } from 'quasar';
import Vue from 'vue';
import Component from 'vue-class-component';

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
      .filter(item => item.id.toLowerCase().match(this.searchModel.toLowerCase()))
      .map(item => ({
        id: item.id,
        displayName: displayNameById(this.$store, item.widget),
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
      <q-field label="Widget ID" icon="create" orientation="vertical">
        <q-input
          v-model="widgetId"
          :error="widgetIdError !== null"
          :suffix="widgetIdError"
          placeholder="Enter a widget ID"
        />
      </q-field>
      <q-field label="Select a widget to copy" icon="widgets" orientation="vertical">
        <q-item>
          <q-search v-model="searchModel" placeholder="Search"/>
        </q-item>
        <q-list link="" inset-separator>
          <q-item
            v-for="opt in existingWidgetOptions"
            :key="opt.id"
            icon="widgets"
            @click.native="selectItem(opt.id)"
          >
            <div class="row">
              <q-item-main>
                <q-item-tile label="">{{ opt.id }}</q-item-tile>
                <q-item-tile sublabel>{{ opt.displayName }}</q-item-tile>
              </q-item-main>
              <q-item-side right icon="chevron_right"/>
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
