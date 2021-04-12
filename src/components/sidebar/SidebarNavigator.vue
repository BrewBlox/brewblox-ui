<script lang="ts">
import { useQuasar } from 'quasar';
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';

import { useGlobals } from '@/composables';

const btnAttrs = {
  stack: true,
  flat: true,
  noCaps: true,
  class: 'col-grow q-py-sm max-small',
};

export default defineComponent({
  name: 'SidebarNavigator',
  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const { dense } = useGlobals.setup();

    const activeSection = computed<string>(
      () => route.path.split('/')[1] ?? '',
    );

    const editorDisabled = computed<boolean>(
      () => $q.platform.is.ie || dense.value,
    );

    const currentDashboard = computed<string | null>(
      () => route.path.startsWith('/dashboard')
        ? route.params.id as string
        : null,
    );

    function btnColor(...sections: string[]): string {
      return sections.includes(activeSection.value) ? 'primary' : '';
    }

    return {
      dense,
      activeSection,
      editorDisabled,
      currentDashboard,
      btnAttrs,
      btnColor,
    };
  },
});
</script>

<template>
  <div class="col-auto">
    <div class="row wrap">
      <q-btn
        icon="mdi-view-dashboard"
        label="Dashboards"
        to="/"
        :color="btnColor('dashboard', 'service', 'brewery')"
        v-bind="btnAttrs"
      />
      <q-btn
        :disable="editorDisabled"
        icon="mdi-tools"
        label="Builder"
        to="/builder"
        :color="btnColor('builder')"
        v-bind="btnAttrs"
      />
      <q-btn
        icon="mdi-settings"
        label="Admin"
        to="/admin"
        :color="btnColor('admin')"
        v-bind="btnAttrs"
      />
    </div>
    <q-separator />
  </div>
</template>

<style lang="sass" scoped>
.max-small
  max-width: 34%
</style>
