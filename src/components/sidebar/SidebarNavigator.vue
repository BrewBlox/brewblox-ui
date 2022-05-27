<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';

const btnAttrs = {
  stack: true,
  flat: true,
  noCaps: true,
  class: 'col-grow q-py-sm max-small',
};

export default defineComponent({
  name: 'SidebarNavigator',
  setup() {
    const route = useRoute();

    const activeSection = computed<string>(
      () => route.path.split('/')[1] ?? '',
    );

    function btnColor(...sections: string[]): string {
      return sections.includes(activeSection.value) ? 'primary' : '';
    }

    return {
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

<style
  lang="sass"
  scoped
>
.max-small
  max-width: 34%
</style>
