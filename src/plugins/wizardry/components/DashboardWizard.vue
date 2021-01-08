<script lang="ts">
import UrlSafeString from 'url-safe-string';
import { Component } from 'vue-property-decorator';

import { dashboardIdRules } from '@/helpers/dashboards';
import { createDialog } from '@/helpers/dialog';
import { ruleValidator, suggestId } from '@/helpers/functional';
import notify from '@/helpers/notify';
import WizardBase from '@/plugins/wizardry/WizardBase';
import router from '@/router';
import { Dashboard, dashboardStore } from '@/store/dashboards';

@Component
export default class DashboardWizard extends WizardBase {
  idGenerator = new UrlSafeString();
  dashboardIdRules = dashboardIdRules();
  dashboardIdValidator = ruleValidator(dashboardIdRules());

  chosenId: string | null = null;
  dashboardTitle = 'New dashboard';

  mounted(): void {
    this.setDialogTitle('Dashboard wizard');
  }

  get dashboardId(): string {
    return this.chosenId !== null
      ? this.chosenId
      : suggestId(this.idGenerator.generate(this.dashboardTitle), this.dashboardIdValidator);
  }

  set dashboardId(id: string) {
    this.chosenId = id;
  }

  get valid(): boolean {
    return this.dashboardIdValidator(this.dashboardId);
  }

  showTitleKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      value: this.dashboardTitle,
    })
      .onOk(v => this.dashboardTitle = v);
  }

  showIdKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      value: this.dashboardId,
      rules: this.dashboardIdRules,
    })
      .onOk(v => this.dashboardId = v);
  }

  async createDashboard(): Promise<void> {
    if (!this.valid) {
      return;
    }
    const dashboard: Dashboard = {
      id: this.dashboardId,
      title: this.dashboardTitle || this.dashboardId,
      order: dashboardStore.dashboardIds.length + 1,
    };

    await dashboardStore.createDashboard(dashboard);
    router.push(`/dashboard/${dashboard.id}`);
    notify.done(`Added dashboard <b>${dashboard.title}</b>`);
    this.close();
  }
}
</script>

<template>
  <ActionCardBody>
    <q-card-section>
      <q-item>
        <q-item-section>
          <q-input
            v-model="dashboardTitle"
            label="Dashboard Title"
          >
            <template #append>
              <KeyboardButton @click="showTitleKeyboard" />
            </template>
          </q-input>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-input
            v-model="dashboardId"
            :rules="dashboardIdRules"
            label="Dashboard URL"
          >
            <template #append>
              <KeyboardButton @click="showIdKeyboard" />
            </template>
          </q-input>
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
  </ActionCardBody>
</template>
