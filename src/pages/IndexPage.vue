<script lang="ts">
import { primaryDashboard } from '@/store/dashboards/getters';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

@Component
export default class IndexPage extends Vue {
  get primaryDashboard() {
    return primaryDashboard(this.$store);
  }

  @Watch('primaryDashboard', { immediate: true })
  onPrimaryDashboardFound() {
    if (this.primaryDashboard !== null) {
      this.$router.replace(`/dashboard/${this.primaryDashboard}`);
    }
  }

}
</script>

<template>
  <q-page class="flex flex-center">Home</q-page>
</template>

