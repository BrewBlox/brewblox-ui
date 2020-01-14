<script lang="ts">
import UrlSafeString from 'url-safe-string';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { dashboardIdRules } from '@/helpers/dashboards';
import { suggestId, validator } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { Dashboard, dashboardStore } from '@/store/dashboards';

@Component
export default class DashboardWizard extends Vue {
  idGenerator = new UrlSafeString();
  dashboardIdRules = dashboardIdRules();

  chosenId: string | null = null;
  dashboardTitle = 'New dashboard';

  back(): void {
    this.$emit('back');
  }

  get dashboardId(): string {
    return this.chosenId !== null
      ? this.chosenId
      : suggestId(this.idGenerator.generate(this.dashboardTitle), validator(this.dashboardIdRules));
  }

  set dashboardId(id: string) {
    this.chosenId = id;
  }

  get valid(): boolean {
    return validator(this.dashboardIdRules)(this.dashboardId);
  }

  async createDashboard(): Promise<void> {
    const dashboard: Dashboard = {
      id: this.dashboardId,
      title: this.dashboardTitle || this.dashboardId,
      order: dashboardStore.dashboardIds.length + 1,
    };

    await dashboardStore.createDashboard(dashboard);
    notify.done(`Added dashboard ${dashboard.title}`);
    this.$emit('close');
  }

  mounted(): void {
    this.$emit('title', 'Dashboard wizard');
  }
}
</script>

<template>
  <div class="dialog-content">
    <WizardCard>
      <q-card-section>
        <q-item>
          <q-item-section>
            <q-input v-model="dashboardTitle" label="Dashboard Title" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-input v-model="dashboardId" :rules="dashboardIdRules" label="Dashboard URL" />
          </q-item-section>
          <q-item-section class="col-auto">
            <q-btn
              icon="mdi-backup-restore"
              flat
              round
              size="sm"
              color="white"
              @click="chosenId = null"
            >
              <q-tooltip>Reset to default</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-card-section>

      <template #actions>
        <q-btn unelevated label="Back" @click="back" />
        <q-space />
        <q-btn :disable="!valid" unelevated label="Create" color="primary" @click="createDashboard" />
      </template>
    </WizardCard>
  </div>
</template>
