<script lang="ts">
import { primaryDashboardId } from '@/store/dashboards/getters';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

@Component
export default class IndexPage extends Vue {
  get primaryDashboardId() {
    return primaryDashboardId(this.$store);
  }

  @Watch('primaryDashboardId', { immediate: true })
  onPrimaryDashboardFound() {
    if (this.primaryDashboardId !== null) {
      this.$router.replace(`/dashboard/${this.primaryDashboardId}`);
    }
  }

}
</script>

<template>
  <q-page class="flex flex-center">Home</q-page>
</template>
