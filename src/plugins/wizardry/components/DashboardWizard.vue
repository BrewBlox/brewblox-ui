<script lang="ts">
import UrlSafeString from 'url-safe-string';
import { computed, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useWizard } from '@/plugins/wizardry/composables';
import { Dashboard, dashboardStore } from '@/store/dashboards';
import { dashboardIdRules } from '@/utils/dashboards';
import { createDialog } from '@/utils/dialog';
import { ruleValidator, suggestId } from '@/utils/functional';
import notify from '@/utils/notify';

const urlGenerator = new UrlSafeString();
const idRules = dashboardIdRules();
const idValidator = ruleValidator(idRules);

export default defineComponent({
  name: 'DashboardWizard',
  props: {
    ...useWizard.props,
  },
  emits: [
    ...useWizard.emits,
  ],
  setup() {
    const {
      onBack,
      onClose,
      setDialogTitle,
    } = useWizard.setup();
    const router = useRouter();

    setDialogTitle('Dashboard wizard');

    const dashboardTitle = ref<string>('New dashboard');

    const _dashboardId = ref<string | null>(null);
    const dashboardId = computed<string>({
      get: () => _dashboardId.value !== null
        ? _dashboardId.value
        : suggestId(urlGenerator.generate(dashboardTitle.value), idValidator),
      set: id => _dashboardId.value = id,
    });

    const valid = computed<boolean>(
      () => idValidator(dashboardId.value),
    );

    function showTitleKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          value: dashboardTitle.value,
        },
      })
        .onOk(v => dashboardTitle.value = v);
    }

    function showIdKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          value: dashboardId.value,
          rules: idRules,
        },
      })
        .onOk(v => dashboardId.value = v);
    }

    async function createDashboard(): Promise<void> {
      if (!valid.value) {
        return;
      }
      const dashboard: Dashboard = {
        id: dashboardId.value,
        title: dashboardTitle.value || dashboardId.value,
        order: dashboardStore.dashboardIds.length + 1,
      };

      await dashboardStore.createDashboard(dashboard);
      router.push(`/dashboard/${dashboard.id}`);
      notify.done(`Added dashboard <b>${dashboard.title}</b>`);
      onClose();
    }

    return {
      onBack,
      dashboardId,
      idRules,
      valid,
      dashboardTitle,
      showIdKeyboard,
      showTitleKeyboard,
      createDashboard,
    };
  },
});
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
            :rules="idRules"
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
      <q-btn
        unelevated
        label="Back"
        @click="onBack"
      />
      <q-space />
      <q-btn
        :disable="!valid"
        unelevated
        label="Create"
        color="primary"
        @click="createDashboard"
      />
    </template>
  </ActionCardBody>
</template>
