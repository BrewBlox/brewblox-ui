<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useWizard } from '@/plugins/wizardry/composables';
import { Dashboard, useDashboardStore } from '@/store/dashboards';
import { makeDashboardIdRules } from '@/utils/dashboards';
import { createDialog } from '@/utils/dialog';
import { notify } from '@/utils/notify';
import { makeRuleValidator, suggestId } from '@/utils/rules';
import { makeUrlSafe } from '@/utils/url';

const idRules = makeDashboardIdRules();
const idValidator = makeRuleValidator(idRules);

export default defineComponent({
  name: 'DashboardWizard',
  props: {
    ...useWizard.props,
  },
  emits: [...useWizard.emits],
  setup() {
    const { onBack, onClose, setDialogTitle } = useWizard.setup();
    const router = useRouter();
    const dashboardStore = useDashboardStore();

    setDialogTitle('Dashboard wizard');

    const dashboardTitle = ref<string>('New dashboard');

    const _dashboardId = ref<string | null>(null);
    const dashboardId = computed<string>({
      get: () =>
        _dashboardId.value !== null ? _dashboardId.value : suggestDashboardId(),
      set: (id) => (_dashboardId.value = id),
    });

    const valid = computed<boolean>(() => idValidator(dashboardId.value));

    function suggestDashboardId(): string {
      return suggestId(makeUrlSafe(dashboardTitle.value), idValidator);
    }

    function showTitleKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: dashboardTitle.value,
        },
      }).onOk((v) => (dashboardTitle.value = v));
    }

    function showIdKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: dashboardId.value,
          rules: idRules,
        },
      }).onOk((v) => (dashboardId.value = v));
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
      suggestDashboardId,
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
  <WizardBody>
    <q-card-section>
      <q-item>
        <q-item-section>
          <q-input v-model="dashboardTitle" label="Dashboard Title">
            <template #append>
              <KeyboardButton @click="showTitleKeyboard" />
            </template>
          </q-input>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-input v-model="dashboardId" :rules="idRules" label="Dashboard URL">
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
            @click="dashboardId = suggestDashboardId()"
          >
            <q-tooltip>Reset to default</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-card-section>

    <template #actions>
      <q-btn unelevated label="Back" @click="onBack" />
      <q-space />
      <q-btn
        :disable="!valid"
        unelevated
        label="Create"
        color="primary"
        @click="createDashboard"
      />
    </template>
  </WizardBody>
</template>
